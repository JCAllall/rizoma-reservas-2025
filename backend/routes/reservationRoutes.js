const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth");

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
  obtenerEstadoSectores,
  actualizarEstadoSector,
} = require("../controllers/reservationController");

// ── Rutas públicas ──────────────────────────────────────
router.get("/horarios-ocupados", obtenerHorariosOcupados);
router.get("/capacidad", getCapacidadPorSector);
router.get("/disponibilidad", verificarDisponibilidadInteligente);
router.get("/capacidad-horaria", obtenerCapacidadHorariaYDiaria);
router.get("/estado-sectores", obtenerEstadoSectores);
router.post("/", crearReserva);
router.post("/lista-espera", guardarEnListaEspera);

// ── Rutas protegidas (solo admin) ───────────────────────
router.post("/estado-sectores", verificarToken, actualizarEstadoSector);
router.get("/todas", verificarToken, obtenerTodasLasReservas);
router.get("/lista-espera", verificarToken, obtenerListaEspera);
router.get("/exportar-pdf", verificarToken, exportarReservasPDF);
router.get("/resumen", verificarToken, obtenerResumenPorRango);
router.delete("/:id", verificarToken, eliminarReserva);

// ── Ruta genérica al final ──────────────────────────────
router.get("/", obtenerReservasPorFecha);

module.exports = router;
