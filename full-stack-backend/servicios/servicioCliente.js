const fastify = require("fastify")({ logger: true });
const redis = require("ioredis");
const amqp = require("amqplib");
const cors = require("@fastify/cors");
const db = require("../bd");

// Inicializa Redis
const redisClient = new redis({ host: "127.0.0.1", port: 6379 });
redisClient.on("connect", () => {
  console.log("Conexión a Redis exitosa");
});

redisClient.on("error", (err) => {
  console.error("Error de conexión a Redis:", err);
});

// Configura CORS
fastify.register(cors, {
  origin: "*",
});

// Configura RabbitMQ
let channel;

const initRabbitMQ = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue("email_queue");
    console.log("Conexión a RabbitMQ exitosa");
  } catch (err) {
    console.error("Error connecting to RabbitMQ:", err);
    process.exit(1); // Finaliza el proceso si no se puede conectar
  }
};

// Cargar parámetros globales en Redis desde MySQL
const parametrosGlobales = async () => {
  try {
    const [rows] = await db.query(
      "SELECT parametro, valor FROM parametros_globales"
    );
    rows.forEach(async (row) => {
      await redisClient.set(row.parametro, row.valor);
    });
    console.log("Parámetros globales cargados en Redis");
  } catch (err) {
    console.error("Error al cargar los parámetros globales en Redis:", err);
  }
};

// Registrar cliente
fastify.post('/registrar-cliente', async (request, reply) => {
  const { token, clientData } = request.body;

  // Validar el token
  if (!token || token.length === 0) return reply.status(400).send({ error: 'Token inválido' });

  try {
    const { nombre, email } = clientData;
    await db.query('INSERT INTO clientes (nombre, email) VALUES (?, ?)', [nombre, email]);
    console.log('Cliente registrado en la base de datos');
  } catch (dbError) {
    console.error('Error al registrar el cliente:', dbError);
    return reply.status(500).send({ error: 'Error al registrar el cliente' });
  }

  // Consultar Redis para determinar si se debe enviar un correo
  const sendEmail = await redisClient.get('sendEmails');
  if (sendEmail === 'true') {
    const emailData = {
      email: clientData.email, // Asegúrate de incluir el email del cliente
      asunto: 'Bienvenido', // Define el asunto que quieres usar
      mensaje: `Hola ${clientData.nombre}, gracias por registrarte!` // Mensaje que quieres enviar
    };
    
    channel.sendToQueue('email_queue', Buffer.from(JSON.stringify(emailData)));
    console.log('Mensaje enviado a la cola de correos');
  }

  return { message: 'Cliente registrado correctamente' };
});


// Configurar el estado de envío de correos
fastify.get("/set-email-status", async (request, reply) => {
  try {
    await redisClient.set("sendEmails", "true");
    return { message: "Parámetro de envío de correos actualizado en Redis" };
  } catch (err) {
    console.error("Error al establecer el valor en Redis:", err);
    return reply
      .status(500)
      .send({ error: "Error al actualizar el parámetro en Redis" });
  }
});


fastify.get("/clientes", async (request, reply) => {
  try {
    const [rows] = await db.query("SELECT * FROM clientes");
    if (rows.length === 0) {
      return reply.status(404).send({ error: "No se encontraron clientes" });
    }
    return rows; // Devuelve todos los clientes
  } catch (dbError) {
    console.error("Error al obtener los clientes:", dbError);
    return reply.status(500).send({ error: "Error al obtener los clientes" });
  }
});

// Obtener cliente por ID
fastify.get("/clientes/:id", async (request, reply) => {
  const { id } = request.params;
  try {
    const [rows] = await db.query("SELECT * FROM clientes WHERE id = ?", [id]);
    if (rows.length === 0) {
      return reply.status(404).send({ error: "Cliente no encontrado" });
    }
    return rows[0];
  } catch (dbError) {
    console.error("Error al obtener el cliente:", dbError);
    return reply.status(500).send({ error: "Error al obtener el cliente" });
  }
});

// Eliminar cliente
fastify.delete("/clientes/:id", async (request, reply) => {
  const { id } = request.params;
  try {
    const result = await db.query("DELETE FROM clientes WHERE id = ?", [id]);
    if (result[0].affectedRows === 0) {
      return reply.status(404).send({ error: "Cliente no encontrado" });
    }
    return reply
      .status(200)
      .send({ message: "Cliente eliminado correctamente" });
  } catch (dbError) {
    console.error("Error al eliminar el cliente:", dbError);
    return reply.status(500).send({ error: "Error al eliminar el cliente" });
  }
});

// Iniciar la aplicación
const start = async () => {
  try {
    await fastify.listen({ port: 3002 });
    await initRabbitMQ();
    await parametrosGlobales();
    console.log("Microservicio de Clientes en el puerto 3002");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
