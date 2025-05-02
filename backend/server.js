const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoute")
const userManagementRoute = require("./routes/userManagementRoute");
const employeeManagementRoute = require("./routes/employeeManagementRoutes");
const hrRoute = require('./routes/hrRoute')
const financeRoute = require('./routes/financeRoute');
const engineerRoute = require('./routes/engineerRoute');
 
require("./config/db"); // Ensure database connects

const app = express();
app.use(express.json()); // Parse JSON
app.use(cors()); // Handle CORS

app.use("/api/auth", authRoutes); // Use the auth routes
app.use("/api/users", userManagementRoute); 
app.use("/api/employees", employeeManagementRoute);
app.use("/api/hr", hrRoute);
app.use("/api/finance", financeRoute);
app.use("/api/engr", engineerRoute);

app.get("/", (req, res) => {
    res.send("Chat API is running!");
  });

app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
