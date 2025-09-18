const mysql = require("mysql2");

// Only use dotenv in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "duvtesting",
});

// Connect and handle errors gracefully
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    console.error("Check your DB_HOST, DB_USER, DB_PASSWORD, DB_NAME");
    process.exit(1); // Exit if DB connection fails
  } else {
    console.log(`Connected to MySQL database "${process.env.DB_NAME}" ✅`);
    console.log("NODE_ENV:", process.env.NODE_ENV);
  }
});

module.exports = db;
