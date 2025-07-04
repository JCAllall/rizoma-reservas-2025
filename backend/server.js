const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require("./routes/auth");
const reservationRoutes = require("./routes/reservationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/reservas", reservationRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    app.listen(5000, () => console.log("🚀 Servidor en puerto 5000"));
  })
  .catch((err) => {
    console.error("❌ Error al conectar MongoDB:", err);
  });
