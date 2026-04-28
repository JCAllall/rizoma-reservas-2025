const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth"); // ← lo agregamos

const {
  crearReserva,
  obtenerTodasLasReservas,
  obtenerHorariosOcupados,
  getCapacidadPorSector,
  guardarEnListaEspera,
  verificarDisponibilidadInteligente,
  obtenerCapacidadHorariaYDiaria,
  exportarReservasPDF,
  obtenerListaEspera,
  obtenerResumenPorRango,
  obtenerReservasPorFecha,
  eliminarReserva,
} = require("../controllers/reservationController");

// ── Rutas públicas ──────────────────────────────────────
router.get("/horarios-ocupados", obtenerHorariosOcupados);
router.get("/capacidad", getCapacidadPorSector);
router.get("/disponibilidad", verificarDisponibilidadInteligente);
router.get("/capacidad-horaria", obtenerCapacidadHorariaYDiaria);
router.post("/", crearReserva);
router.post("/lista-espera", guardarEnListaEspera);

// ── Rutas protegidas (solo admin) ───────────────────────
router.get("/todas", verificarToken, obtenerTodasLasReservas);
router.get("/lista-espera", verificarToken, obtenerListaEspera);
router.get("/exportar-pdf", verificarToken, exportarReservasPDF);
router.get("/resumen", verificarToken, obtenerResumenPorRango);
router.delete("/:id", verificarToken, eliminarReserva);

// ── Ruta genérica al final ──────────────────────────────
router.get("/", obtenerReservasPorFecha);

module.exports = router;