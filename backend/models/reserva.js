// backend/models/reserva.js
const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  personas: { type: Number, required: true },
  sector: { type: String, enum: ["Patio", "Esquina"], required: true },
  listaEspera: { type: Boolean, default: false },
});

module.exports =
  mongoose.models.Reserva || mongoose.model("Reserva", reservaSchema);
