const fastify = require("fastify")({ logger: true });
const amqp = require("amqplib");
const db = require("../bd");

let channel;
// Configura RabbitMQ
const initRabbitMQ = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue("email_queue");
    console.log("Conexión a RabbitMQ exitosa");

    // Escuchar los mensajes de la cola
    channel.consume("email_queue", async (msg) => {
      if (msg !== null) {
        const emailData = JSON.parse(msg.content.toString());
        const { email, asunto, mensaje } = emailData;

        // Registrar el correo en la base de datos
        try {
          await db.query(
            "INSERT INTO correos_enviados (destinatario, asunto, mensaje) VALUES (?, ?, ?)",
            [email, asunto, mensaje]
          );
          console.log("Correo registrado en la base de datos");
        } catch (dbError) {
          console.error("Error al registrar el correo:", dbError);
        }

        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error("Error connecting to RabbitMQ:", err);
    process.exit(1);
  }
};

const start = async () => {
  try {
    await fastify.listen({ port: 3003 });
    await initRabbitMQ();
    console.log("Microservicio de Correos en el puerto 3003");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
