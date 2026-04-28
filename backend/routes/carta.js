const express = require("express");
const router = express.Router();
const { verificarToken, soloAdmin } = require("../middleware/auth");
const {
  obtenerCarta,
  obtenerCartaAdmin,
  agregarItem,
  editarItem,
  eliminarItem,
} = require("../controllers/cartaController");

// ── Rutas públicas ──────────────────────────────────────
router.get("/", obtenerCarta);

// ── Rutas protegidas (solo admin) ───────────────────────
router.get("/admin", verificarToken, soloAdmin, obtenerCartaAdmin);
router.post("/", verificarToken, soloAdmin, agregarItem);
router.put("/:id", verificarToken, soloAdmin, editarItem);
router.delete("/:id", verificarToken, soloAdmin, eliminarItem);

module.exports = router;