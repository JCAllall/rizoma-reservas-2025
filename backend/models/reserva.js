const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    personas: { type: Number, required: true, min: 1 },
    sector: { type: String, enum: ["Patio", "Esquina"], required: true },
    comentario: { type: String, trim: true },
    listaEspera: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Reserva || mongoose.model("Reserva", reservaSchema);