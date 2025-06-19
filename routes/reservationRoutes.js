const express = require("express");
const router = express.Router();
const Reserva = require("../models/Reserva");

router.post("/", async (req, res) => {
  try {
    const nuevaReserva = new Reserva(req.body);
    await nuevaReserva.save();
    res.status(201).json({ mensaje: "Reserva guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar reserva:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});
router.get("/", async (req, res) => {
  try {
    const { fecha } = req.query;

    let filtro = {};

    if (fecha) {
      const inicioDelDia = new Date(fecha);
      inicioDelDia.setHours(0, 0, 0, 0);

      const finDelDia = new Date(fecha);
      finDelDia.setHours(23, 59, 59, 999);

      filtro.fecha = { $gte: inicioDelDia, $lte: finDelDia };
    }

    const reservas = await Reserva.find(filtro).sort({ fecha: 1, hora: 1 });
    res.status(200).json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
