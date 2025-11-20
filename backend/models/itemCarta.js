const mongoose = require("mongoose");

const itemCartaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  imagenUrl: { type: String },
  categoria: { type: String, enum: ["comida", "bebida"], required: true },
});

module.exports = mongoose.model("ItemCarta", itemCartaSchema);
