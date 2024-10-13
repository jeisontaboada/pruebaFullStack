const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "fikmortvy02479bd",
  database: "pruebafullstack",
});

module.exports = db;
