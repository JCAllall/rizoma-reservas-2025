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
  eliminarReserva, // 👈 Agregamos esto
} = require("../controllers/reservationController");

// Rutas principales
router.post("/", crearReserva);
router.get("/horarios-ocupados", obtenerHorariosOcupados);
router.get("/capacidad", getCapacidadPorSector);
router.post("/lista-espera", guardarEnListaEspera);
router.get("/disponibilidad", verificarDisponibilidadInteligente);
router.get("/verificar-capacidad", verificarCapacidadSector);
router.get("/capacidad-horaria", obtenerCapacidadHorariaYDiaria);
router.get("/", obtenerReservasPorFecha); // 👈 Ya la tenías

// Extra (admin)
router.get("/exportar-pdf", exportarReservasPDF);
router.get("/lista-espera", obtenerListaEspera);
router.get("/resumen", obtenerResumenPorRango);

// Nueva ruta para eliminar
router.delete("/:id", eliminarReserva); // 👈 Esta es nueva

module.exports = router;
