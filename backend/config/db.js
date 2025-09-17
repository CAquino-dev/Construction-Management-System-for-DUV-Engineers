// backend/db.js
const mysql = require("mysql2");
const dotenv = require("dotenv");

// Load the correct .env file
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config({ path: ".env" });
}

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "duvtesting",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log(
      `Connected to MySQL database "${process.env.DB_NAME}" ✅`
    );
    console.log(process.env.NODE_ENV);
  }
});

module.exports = db;
