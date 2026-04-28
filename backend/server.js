const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const io = new Server(server, {
  cors: { origin: CLIENT_URL },
});

// 🔌 Conectar io con reservationController
const { setSocketIO } = require("./controllers/reservationController");
setSocketIO(io);

// Middleware
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
app.set("io", io);

// Rutas
const authRoutes = require("./routes/auth");
const reservationRoutes = require("./routes/reservationRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/reservas", reservationRoutes);
app.use("/api/carta", require("./routes/carta"));

// WebSocket handlers
io.on("connection", (socket) => {
  console.log("🟢 Usuario conectado vía WebSocket:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 Usuario desconectado:", socket.id);
  });
});

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    server.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Servidor escuchando en puerto ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error("❌ Error al conectar MongoDB:", err);
    process.exit(1);
  });

// Manejo de errores no capturados
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

module.exports = { io };