
const fastify = require('fastify')({ logger: true });
const redis = require('ioredis');
const amqp = require('amqplib');
const mysql = require('mysql2/promise');
const cors = require('@fastify/cors'); 


// Inicializa Redis
const redisClient = new redis({ host: '127.0.0.1', port: 6379 }); // Configuración de Redis
redisClient.on('connect', () => {
  console.log('Conexión a Redis exitosa');
});

redisClient.on('error', (err) => {
  console.error('Error de conexión a Redis:', err);
});
let channel;

// Conexión a MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'fikmortvy02479bd', 
  database: 'pruebafullstack' 
});


// Configura CORS
fastify.register(cors, {
    origin: '*', 
  });


// Configura RabbitMQ
const initRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('email_queue');
    console.log('Conexión a RabbitMQ exitosa');
  } catch (err) {
    console.error('Error connecting to RabbitMQ:', err);
    process.exit(1); // Finaliza el proceso si no se puede conectar
  }
};


//Metodo de crear
fastify.post('/registrar-cliente', async (request, reply) => {
  const { token, clientData } = request.body;

  // Validar el token (asegúrate de que el token sea válido)
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

   
    channel.sendToQueue('email_queue', Buffer.from(JSON.stringify(clientData)));
    console.log('Mensaje enviado a la cola de correos');
  }

  return { message: 'Cliente registrado correctamente' };
});


//Metodo de obenter clientes
fastify.get('/set-email-status', async (request, reply) => {
  try {
    await redisClient.set('sendEmails', 'true'); // O 'false' para deshabilitar
    return { message: 'Parámetro de envío de correos actualizado en Redis' };
  } catch (err) {
    console.error('Error al establecer el valor en Redis:', err);
    return reply.status(500).send({ error: 'Error al actualizar el parámetro en Redis' });
  }
});


  //Metodo de obenter cliente por id
  fastify.get('/clientes/:id', async (request, reply) => {
    const { id } = request.params; 
    try {
      const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
      if (rows.length === 0) {
        return reply.status(404).send({ error: 'Cliente no encontrado' });
      }
      return rows[0]; 
    } catch (dbError) {
      console.error('Error al obtener el cliente:', dbError);
      return reply.status(500).send({ error: 'Error al obtener el cliente' });
    }
  });

  //Metodo de eliminar cliente
  fastify.delete('/clientes/:id', async (request, reply) => {
    const { id } = request.params; // Obtener el ID de los parámetros de la ruta
  
    try {
      // Ejecutar la consulta para eliminar el cliente
      const result = await db.query('DELETE FROM clientes WHERE id = ?', [id]);
  
      // Verificar si se eliminó algún registro
      if (result[0].affectedRows === 0) {
        return reply.status(404).send({ error: 'Cliente no encontrado' });
      }
  
      return reply.status(200).send({ message: 'Cliente eliminado correctamente' });
    } catch (dbError) {
      console.error('Error al eliminar el cliente:', dbError);
      return reply.status(500).send({ error: 'Error al eliminar el cliente' });
    }
  });
  

const start = async () => {
  try {
    await fastify.listen({ port: 3002 });
    await initRabbitMQ(); // Inicia la conexión con RabbitMQ
    console.log('Microservicio de Clientes en el puerto 3002');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
