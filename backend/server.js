const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://rizoma-reservas-2025.vercel.app",
  "https://rizoma-reservas-2025-9umfaiuds-juan-cruz-allalls-projects.vercel.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some((o) => origin.startsWith(o) || origin === o)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const io = new Server(server, { cors: corsOptions });

const { setSocketIO } = require("./controllers/reservationController");
setSocketIO(io);

app.use(cors(corsOptions));
app.use(express.json());
app.set("io", io);

const authRoutes = require("./routes/auth");
const reservationRoutes = require("./routes/reservationRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/reservas", reservationRoutes);
app.use("/api/carta", require("./routes/carta"));

io.on("connection", (socket) => {
  console.log("🟢 Usuario conectado vía WebSocket:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 Usuario desconectado:", socket.id);
  });
});

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

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

module.exports = { io };