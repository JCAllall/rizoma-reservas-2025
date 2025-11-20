const express = require("express");
const router = express.Router();
const {
  obtenerCarta,
  agregarItem,
  editarItem,
  eliminarItem,
} = require("../controllers/cartaController");

// GET /api/carta
router.get("/", obtenerCarta);

// POST /api/carta
router.post("/", agregarItem);

// PUT /api/carta/:id
router.put("/:id", editarItem);

// DELETE /api/carta/:id
router.delete("/:id", eliminarItem);

module.exports = router;
