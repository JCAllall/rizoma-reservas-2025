const mongoose = require("mongoose");

const sectorEstadoSchema = new mongoose.Schema({
  sector: { type: String, required: true, unique: true }, // "Patio" | "Esquina"
  abierto: { type: Boolean, default: true },
  mensaje: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("SectorEstado", sectorEstadoSchema);
