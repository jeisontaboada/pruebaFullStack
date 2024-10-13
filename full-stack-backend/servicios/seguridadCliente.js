const fastify = require("fastify")({ logger: true });
const db = require("../bd");
const cors = require("@fastify/cors");

fastify.register(cors, {
  origin: "*",
});

// Genera un token de 8 dígitos y guárdalo en MySQL
fastify.get("/generar-token", async (request, reply) => {
  const token = Math.random().toString(36).substr(2, 8);
  await db.query("INSERT INTO seguridad_tokens (token) VALUES (?)", [token]);
  return { token };
});

// Valida el token verificando si está en la base de datos
fastify.post("/validate-token", async (request, reply) => {
  const { token } = request.body;
  const [rows] = await db.query(
    "SELECT * FROM seguridad_tokens WHERE token = ?",
    [token]
  );
  return { valid: rows.length > 0 };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    console.log("Microservicio de Seguridad en el puerto 3001");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
