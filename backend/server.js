const express = require("express");
const cors = require("cors");
const path = require('path');  // Make sure to require 'path'
const authRoutes = require("./routes/authRoute")
const userManagementRoute = require("./routes/userManagementRoute");
const employeeManagementRoute = require("./routes/employeeManagementRoutes");
const hrRoute = require('./routes/hrRoute')
const financeRoute = require('./routes/financeRoute');
const engineerRoute = require('./routes/engineerRoute');
const ceoRoutes = require('./routes/ceoRoutes');
const projectRoutes = require('./routes/projectRoute');
const appointmentRoutes = require('./routes/appointmentRoute');
// const messageRoutes = require('./routes/messagesRoute');
const paymentRoutes = require('./routes/paymentRoute')
const messageRoutes = require('./routes/messageRoute');
const salesRoutes = require('./routes/salesRoute');
const projectManagerRoutes = require('./routes/projectManagerRoute');
const chatRoute = require('./routes/chatRoute');
const foremanRoute = require('./routes/foremanRoute');
const invoiceRoute = require('./routes/invoiceRoutes');
const webhookRoute = require('./routes/webhookRoute');
const inventoryRoute = require('./routes/inventoryRoute');
const clientRoute = require('./routes/clientRoute')
 
const PORT = process.env.PORT || 5000; // fallback if env not set
 
require("./config/db"); // Ensure database connects

const app = express();
app.use(express.json()); // Parse JSON
app.use(cors()); // Handle CORS
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/contracts', express.static(path.join(__dirname, 'public/contracts')));




app.use("/api/auth", authRoutes); // Use the auth routes
app.use("/api/users", userManagementRoute); 
app.use("/api/employees", employeeManagementRoute);
app.use("/api/hr", hrRoute);
app.use("/api/finance", financeRoute);
app.use("/api/engr", engineerRoute);
app.use("/api/ceo", ceoRoutes);
app.use("/api/project", projectRoutes);
app.use("/api", appointmentRoutes);
app.use("/api", messageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", messageRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/projectManager", projectManagerRoutes);
app.use("/api", messageRoutes);
app.use("/api/chat", messageRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/projectManager", projectManagerRoutes);
app.use("/api/chatAi", chatRoute);
app.use("/api/foreman", foremanRoute);
app.use("/api/invoice", invoiceRoute);
app.use("/api/webhooks", webhookRoute);
app.use("/api/inventory", inventoryRoute);
app.use("/api/client", clientRoute);

app.get("/", (req, res) => {
    res.send("API is running!");
  });

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
