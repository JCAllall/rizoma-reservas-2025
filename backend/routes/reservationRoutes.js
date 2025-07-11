const express = require("express");
const router = express.Router();

const {
  crearReserva,
  obtenerHorariosOcupados,
  getCapacidadPorSector,
  guardarEnListaEspera,
  verificarDisponibilidadInteligente,
  verificarCapacidadSector,
  obtenerCapacidadHorariaYDiaria,
  exportarReservasPDF,
  obtenerListaEspera,
  obtenerResumenPorRango,
  obtenerReservasPorFecha,
  eliminarReserva,
} = require("../controllers/reservationController");

// Rutas específicas primero
router.get("/horarios-ocupados", obtenerHorariosOcupados);
router.get("/capacidad", getCapacidadPorSector);
router.get("/lista-espera", obtenerListaEspera); // evitar duplicado
router.get("/disponibilidad", verificarDisponibilidadInteligente);
router.get("/verificar-capacidad", verificarCapacidadSector);
router.get("/capacidad-horaria", obtenerCapacidadHorariaYDiaria);
router.get("/exportar-pdf", exportarReservasPDF);
router.get("/resumen", obtenerResumenPorRango);

// POST y DELETE
router.post("/", crearReserva);
router.post("/lista-espera", guardarEnListaEspera);
router.delete("/:id", eliminarReserva);

// ⚠️ Ruta genérica al final
router.get("/", obtenerReservasPorFecha);

module.exports = router;
