const ItemCarta = require("../models/itemCarta");

const obtenerCarta = async (req, res) => {
  try {
    const carta = await ItemCarta.find({ disponible: true }).sort({
      categoria: 1,
      nombre: 1,
    });
    res.json(carta);
  } catch (err) {
    console.error("Error al obtener carta:", err);
    res.status(500).json({ error: "Error al obtener carta" });
  }
};

const obtenerCartaAdmin = async (req, res) => {
  try {
    const carta = await ItemCarta.find().sort({ categoria: 1, nombre: 1 });
    res.json(carta);
  } catch (err) {
    console.error("Error al obtener carta admin:", err);
    res.status(500).json({ error: "Error al obtener carta" });
  }
};

const agregarItem = async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagenUrl, categoria, disponible } = req.body;

    if (!nombre || !descripcion || precio === undefined || !categoria) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const nuevoItem = new ItemCarta({
      nombre,
      descripcion,
      precio,
      imagenUrl,
      categoria,
      disponible: disponible ?? true,
    });

    await nuevoItem.save();
    res.status(201).json(nuevoItem);
  } catch (err) {
    console.error("Error al agregar item:", err);
    res.status(500).json({ error: "Error al agregar item" });
  }
};

const editarItem = async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagenUrl, categoria, disponible } = req.body;

    const itemActualizado = await ItemCarta.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, precio, imagenUrl, categoria, disponible },
      { new: true, runValidators: true }
    );

    if (!itemActualizado) {
      return res.status(404).json({ error: "Item no encontrado" });
    }

    res.json(itemActualizado);
  } catch (err) {
    console.error("Error al editar item:", err);
    res.status(500).json({ error: "Error al editar item" });
  }
};

const eliminarItem = async (req, res) => {
  try {
    const item = await ItemCarta.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Item no encontrado" });
    }

    res.json({ mensaje: "Item eliminado" });
  } catch (err) {
    console.error("Error al eliminar item:", err);
    res.status(500).json({ error: "Error al eliminar item" });
  }
};

module.exports = {
  obtenerCarta,
  obtenerCartaAdmin,
  agregarItem,
  editarItem,
  eliminarItem,
};