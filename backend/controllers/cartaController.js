const ItemCarta = require("../models/itemCarta");

// GET all
const obtenerCarta = async (req, res) => {
  try {
    const carta = await ItemCarta.find();
    res.json(carta);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener carta" });
  }
};

// POST new item
const agregarItem = async (req, res) => {
  try {
    const nuevoItem = new ItemCarta(req.body);
    await nuevoItem.save();
    res.status(201).json(nuevoItem);
  } catch (err) {
    res.status(500).json({ error: "Error al agregar item" });
  }
};

// PUT editar
const editarItem = async (req, res) => {
  try {
    const itemActualizado = await ItemCarta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(itemActualizado);
  } catch (err) {
    res.status(500).json({ error: "Error al editar item" });
  }
};

// DELETE
const eliminarItem = async (req, res) => {
  try {
    await ItemCarta.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Item eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar item" });
  }
};

module.exports = { obtenerCarta, agregarItem, editarItem, eliminarItem };
