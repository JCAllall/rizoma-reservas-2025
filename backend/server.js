const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") }); // ✅ usa ruta absoluta

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors()); // <- habilita acceso desde el frontend
app.use(express.json());

// ✅ importá correctamente tu archivo
const reservasRouter = require("./routes/reservationRoutes");

// ✅ montá la ruta
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

console.log("MONGO_URI:", process.env.MONGO_URI);

// 🔌 Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => {
    console.error("Error al conectar MongoDB:", err);
  });
