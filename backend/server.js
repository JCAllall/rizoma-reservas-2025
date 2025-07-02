const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors"); // <-- AÑADIR ESTA LÍNEA
const mongoose = require("mongoose");

const app = express();
app.use(cors());
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
    app.listen(5000, () => console.log("Servidor en puerto 5000"));
  })
  .catch((err) => {
    console.error("Error al conectar MongoDB:", err);
  });
