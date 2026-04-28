const mongoose = require("mongoose");

const itemCartaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    imagenUrl: { type: String, trim: true },
    categoria: {
      type: String,
      enum: ["comida", "bebida", "postre", "coctel", "vino"],
      required: true,
    },
    disponible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ItemCarta || mongoose.model("ItemCarta", itemCartaSchema);