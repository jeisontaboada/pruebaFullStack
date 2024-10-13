const { fork } = require("child_process");
const path = require("path");

// Ruta de los microservicios
const securityServicePath = path.join(
  __dirname,
  "servicios",
  "seguridadCliente.js"
);
const clientsServicePath = path.join(
  __dirname,
  "servicios",
  "servicioCliente.js"
);
const emailServicePath = path.join(__dirname, "servicios", "emailCliente.js");

const startService = (servicePath, name) => {
  const service = fork(servicePath);

  service.on("error", (err) => {
    console.error(`${name} failed with error:`, err);
  });

  service.on("exit", (code) => {
    console.log(`${name} exited with code ${code}`);
  });

  console.log(`${name} started.`);
};

// Iniciar los microservicios
startService(securityServicePath, "Microservicio de Seguridad");
startService(clientsServicePath, "Microservicio de Clientes");
startService(emailServicePath, "Microservicio de Correos");
