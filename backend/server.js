const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
});

// 🔌 Conectar io con reservationController
const { setSocketIO } = require("./controllers/reservationController");
setSocketIO(io);

// Middleware
app.use(cors());
app.use(express.json());
app.set("io", io); // opcional, pero útil si querés acceder vía req.app.get("io")

// Rutas
const authRoutes = require("./routes/auth");
const reservationRoutes = require("./routes/reservationRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/reservas", reservationRoutes);

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
    server.listen(5000, () =>
      console.log("🚀 Servidor escuchando en puerto 5000")
    );
  })
  .catch((err) => {
    console.error("❌ Error al conectar MongoDB:", err);
  });

module.exports = { io };
