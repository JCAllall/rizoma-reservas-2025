// backend/controllers/reservationController.js
const Reserva = require("../models/reserva");
const PDFDocument = require("pdfkit");

let io; // WebSocket instance

function setSocketIO(ioInstance) {
  io = ioInstance;
}

// ✅ Crear reserva
const crearReserva = async (req, res) => {
  try {
    const { nombre, email, fecha, hora, sector, personas } = req.body;

    if (!nombre || !email || !fecha || !hora || !sector || !personas) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const reservas = await Reserva.find({
      fecha,
      sector,
      listaEspera: false,
    });

    // Nuevos límites por sector
    const LIMITE_DIARIO = sector === "Patio" ? 40 : 46;
    const LIMITE_HORARIO = 10;

    const totalPersonasDia = reservas.reduce(
      (acc, r) => acc + (r.personas || 0),
      0
    );
    if (totalPersonasDia + personas > LIMITE_DIARIO) {
      return res.status(400).json({
        error:
          "Capacidad diaria del sector superada. ¿Querés unirte a la lista de espera?",
      });
    }

    const personasEnHorario = reservas
      .filter((r) => r.hora === hora)
      .reduce((acc, r) => acc + (r.personas || 0), 0);

    if (personasEnHorario + personas > LIMITE_HORARIO) {
      return res.status(400).json({
        error:
          "Horario completo. Por favor elegí otro horario o unite a la lista de espera.",
      });
    }

    const nuevaReserva = new Reserva(req.body);
    await nuevaReserva.save();

    // Emitimos evento WebSocket
    if (io) {
      io.emit("reservaCreada", {
        nombre: nuevaReserva.nombre,
        hora: nuevaReserva.hora,
        fecha: nuevaReserva.fecha,
        sector: nuevaReserva.sector,
      });
    }

    res.status(201).json({ mensaje: "Reserva guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar reserva:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// ✅ Eliminar reserva
const eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    await Reserva.findByIdAndDelete(id);

    if (io) {
      io.emit("reservaEliminada", id);
    }

    res.status(200).json({ message: "Reserva eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

const obtenerHorariosOcupados = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: "Fecha requerida" });

    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    const reservas = await Reserva.find({ fecha: { $gte: inicio, $lte: fin } });
    const horariosOcupados = reservas.map((r) => r.hora);

    res.status(200).json(horariosOcupados);
  } catch (error) {
    console.error("Error al obtener horarios ocupados:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const obtenerReservasPorFecha = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: "Fecha requerida" });

    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    const reservas = await Reserva.find({
      fecha: { $gte: inicio, $lte: fin },
      listaEspera: false,
    }).sort({ sector: 1, hora: 1 });

    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas por fecha:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const verificarCapacidadSector = async (req, res) => {
  try {
    const { fecha, sector } = req.query;
    if (!fecha || !sector)
      return res.status(400).json({ error: "Fecha y sector requeridos." });

    const reservas = await Reserva.find({ fecha, sector });
    const totalPersonas = reservas.reduce((sum, r) => sum + r.personas, 0);

    res.json({ totalPersonas });
  } catch (error) {
    console.error("Error al verificar capacidad:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};

const getCapacidadPorSector = async (req, res) => {
  try {
    const { fecha, sector } = req.query;
    const reservas = await Reserva.find({ fecha, sector });
    const totalPersonas = reservas.reduce(
      (acc, r) => acc + parseInt(r.personas || 0),
      0
    );
    res.json({ totalPersonas });
  } catch (error) {
    console.error("Error al obtener capacidad:", error);
    res.status(500).json({ error: "Error al consultar la capacidad" });
  }
};

const guardarEnListaEspera = async (req, res) => {
  try {
    const { nombre, email, fecha, sector } = req.body;
    if (!nombre || !email || !fecha || !sector) {
      return res.status(400).json({ error: "Faltan campos requeridos." });
    }

    const nuevaEntrada = new Reserva({
      nombre,
      email,
      fecha,
      sector,
      listaEspera: true,
    });
    await nuevaEntrada.save();

    res.status(201).json({ mensaje: "Agregado a la lista de espera." });
  } catch (error) {
    console.error("Error al guardar en lista de espera:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};

const verificarDisponibilidadInteligente = async (req, res) => {
  try {
    const { fecha, sector, personas, hora } = req.query;
    if (!fecha || !sector || !personas || !hora) {
      return res
        .status(400)
        .json({ error: "Faltan datos para verificar disponibilidad" });
    }

    const personasSolicitadas = parseInt(personas);
    const horaReserva = new Date(`${fecha}T${hora}:00`);
    const ahora = new Date();
    const horasDeAnticipo = (horaReserva - ahora) / (1000 * 60 * 60);

    if (sector === "Patio") return res.json({ disponible: true });
    if (personasSolicitadas > 8)
      return res.json({ mensaje: "WhatsApp", disponible: false });

    const reservas = await Reserva.find({ fecha, sector, listaEspera: false });
    let mesas2 = 10,
      mesas4 = 4;

    for (const r of reservas) {
      const p = r.personas;
      if (p <= 3 && mesas2 > 0) mesas2--;
      else if (p === 4 && mesas4 > 0) mesas4--;
      else if (p <= 3 && mesas4 > 0 && horasDeAnticipo < 5) mesas4--;
    }

    let personasRestantes = personasSolicitadas;
    while (personasRestantes >= 2 && mesas2 > 0) {
      personasRestantes -= 3;
      mesas2--;
    }
    while (personasRestantes > 0 && mesas4 > 0) {
      if (personasSolicitadas === 4 || horasDeAnticipo < 5) {
        personasRestantes -= 4;
        mesas4--;
      } else {
        break;
      }
    }

    res.json({ disponible: personasRestantes <= 0 });
  } catch (error) {
    console.error("Error en disponibilidad inteligente:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const obtenerCapacidadHorariaYDiaria = async (req, res) => {
  try {
    const { fecha, sector } = req.query;
    if (!fecha || !sector)
      return res.status(400).json({ error: "Fecha y sector requeridos" });

    const reservas = await Reserva.find({ fecha, sector, listaEspera: false });

    const totalPersonasDia = reservas.reduce(
      (acc, r) => acc + (r.personas || 0),
      0
    );
    const personasPorHorario = {};
    reservas.forEach((r) => {
      if (!personasPorHorario[r.hora]) personasPorHorario[r.hora] = 0;
      personasPorHorario[r.hora] += r.personas || 0;
    });

    res.json({ totalPersonasDia, personasPorHorario });
  } catch (error) {
    console.error("Error en obtenerCapacidadHorariaYDiaria:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const exportarReservasPDF = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: "Fecha requerida" });

    const reservas = await Reserva.find({
      fecha: {
        $gte: new Date(fecha + "T00:00:00"),
        $lte: new Date(fecha + "T23:59:59"),
      },
      listaEspera: false,
    }).sort({ sector: 1, hora: 1 });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="reservas_${fecha}.pdf"`
    );
    doc.pipe(res);

    doc.fontSize(16).text(`Reservas del día ${fecha}`, { align: "center" });
    doc.moveDown();

    reservas.forEach((r, i) => {
      doc
        .fontSize(12)
        .text(
          `${i + 1}. ${r.nombre} - ${r.email} - ${r.sector} - ${r.hora} hs - ${
            r.personas
          } personas`
        );
    });

    doc.end();
  } catch (error) {
    console.error("Error al generar PDF:", error);
    res.status(500).json({ error: "Error al generar PDF" });
  }
};

const obtenerListaEspera = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: "Fecha requerida" });

    const lista = await Reserva.find({
      fecha: {
        $gte: new Date(fecha + "T00:00:00"),
        $lte: new Date(fecha + "T23:59:59"),
      },
      listaEspera: true,
    });

    res.json(lista);
  } catch (error) {
    console.error("Error al obtener lista de espera:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const obtenerResumenPorRango = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta)
      return res
        .status(400)
        .json({ error: "Parámetros 'desde' y 'hasta' requeridos" });

    const reservas = await Reserva.find({
      fecha: {
        $gte: new Date(`${desde}T00:00:00`),
        $lte: new Date(`${hasta}T23:59:59`),
      },
      listaEspera: false,
    });

    let totalPersonas = 0,
      porSector = {},
      porHorario = {};
    reservas.forEach((r) => {
      const p = r.personas || 0;
      totalPersonas += p;
      porSector[r.sector] = (porSector[r.sector] || 0) + p;
      porHorario[r.hora] = (porHorario[r.hora] || 0) + p;
    });

    res.json({ totalPersonas, porSector, porHorario });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const obtenerTodasLasReservas = async (req, res) => {
  try {
    const reservas = await Reserva.find();
    res.status(200).json(reservas);
  } catch (err) {
    console.error("Error al obtener reservas:", err);
    res.status(500).json({ error: "Error al obtener las reservas" });
  }
};

module.exports = {
  crearReserva,
  eliminarReserva,
  setSocketIO,
  obtenerTodasLasReservas,
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
};
