// email-service.js
const fastify = require('fastify')({ logger: true });
const amqp = require('amqplib');
const mysql = require('mysql2/promise');

let channel;

// Conexión a MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'fikmortvy02479bd', // Cambia esto a tu contraseña real
  database: 'pruebafullstack' // Cambia esto al nombre correcto de tu base de datos
});

const initRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('email_queue');
    console.log('Conexión a RabbitMQ exitosa');

    // Consumir mensajes de la cola
    channel.consume('email_queue', async (msg) => {
      try {
        const clientData = JSON.parse(msg.content.toString());
        console.log('Mensaje recibido de RabbitMQ:', clientData);

        // Registrar el envío de correo en MySQL
        const result = await db.query('INSERT INTO emails (client_data) VALUES (?)', [JSON.stringify(clientData)]);
        console.log('Correo registrado en la base de datos con ID:', result[0].insertId);

        // Acknowledge the message
        channel.ack(msg);
      } catch (error) {
        console.error('Error al procesar el mensaje:', error);
        // Aquí podrías decidir rechazar el mensaje si es necesario
        channel.nack(msg); // Rechazar el mensaje si hay un error
      }
    });
  } catch (err) {
    console.error('Error connecting to RabbitMQ:', err);
    process.exit(1); // Finaliza el proceso si no se puede conectar
  }
};

const start = async () => {
  try {
    await fastify.listen({ port: 3003 });
    await initRabbitMQ();
    console.log('Microservicio de Correos en el puerto 3003');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
