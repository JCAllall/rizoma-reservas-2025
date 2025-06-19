const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    cantidadPersonas: { type: Number, required: true },
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
    comentario: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reserva", reservaSchema);
