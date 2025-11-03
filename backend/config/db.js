const mysql = require("mysql2");

// Only use dotenv in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Create a pool instead of a single connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "duvtesting",
  waitForConnections: true,
  connectionLimit: 10, // adjust as needed
  queueLimit: 0,
});

// Optional: test a connection once
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    console.error("Check your DB_HOST, DB_USER, DB_PASSWORD, DB_NAME");
    process.exit(1);
  } else {
    console.log(`Connected to MySQL database "${process.env.DB_NAME}" ✅`);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    connection.release(); // release connection back to pool
  }
});

module.exports = db;
