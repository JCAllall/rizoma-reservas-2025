require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors()); // <- habilita acceso desde el frontend
app.use(express.json());

// ✅ importá correctamente tu archivo
const reservasRouter = require("./routes/reservationRoutes");

// ✅ montá la ruta
app.use("/api/reservas", reservasRouter);

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
