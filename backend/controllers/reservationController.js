const Reserva = require("../models/reserva");
const PDFDocument = require("pdfkit");
const { verificarMesasDisponibles } = require("../utils/mesaLogic");
const sendEmail = require("../utils/sendEmail"); // ✅ Agregado para envío de email

let io;

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

    const resultado = await verificarMesasDisponibles({
      fecha,
      sector,
      personas,
      hora,
    });

    if (!resultado.disponible) {
      return res.status(400).json({
        error:
          resultado.mensaje === "WhatsApp"
            ? "Para más de 8 personas contactanos por WhatsApp."
            : "No hay disponibilidad de mesas para ese horario.",
      });
    }

    const reservas = await Reserva.find({
      fecha,
      sector,
      listaEspera: false,
    });

    const LIMITE_DIARIO = sector === "Patio" ? 40 : 46;
    const LIMITE_HORARIO = 12;

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

    // ✅ Guardar reserva
    const nuevaReserva = new Reserva(req.body);
    await nuevaReserva.save();

    // ✅ Emitir WebSocket
    if (io) {
      io.emit("reservaCreada", {
        nombre: nuevaReserva.nombre,
        hora: nuevaReserva.hora,
        fecha: nuevaReserva.fecha,
        sector: nuevaReserva.sector,
      });
    }

    // ✅ Enviar email de confirmación
    await sendEmail({
      to: email,
      subject: "Confirmación de reserva en Rizoma",
      text: `Hola ${nombre}, tu reserva fue confirmada para el día ${fecha} a las ${hora} en el sector ${sector}, para ${personas} persona(s). ¡Te esperamos!`,
      html: /* html */ `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e2e2; border-radius: 12px; background-color: #ffffff;">
    <h2 style="color: #2e7d32; margin-bottom: 8px;">✅ ¡Reserva confirmada!</h2>
    <p style="margin: 0 0 8px;">Hola <strong>${nombre}</strong>,</p>
    <p style="margin: 0 0 16px;">Tu reserva fue confirmada con éxito. Aquí tenés los detalles:</p>

    <ul style="padding-left: 20px; margin-bottom: 20px;">
      <li><strong>📅 Fecha:</strong> ${fecha}</li>
      <li><strong>📍 Sector:</strong> ${sector}</li>
      <li><strong>⏰ Horario:</strong> ${hora}</li>
      <li><strong>👥 Personas:</strong> ${personas}</li>
    </ul>

    <p style="margin: 0 0 16px;">Gracias por elegir <strong>Rizoma</strong>. ¡Te esperamos!</p>

    <div style="text-align: center; margin-top: 24px;">
      <img src="https://i.imgur.com/Ib0iDCn.png" alt="Logo Rizoma" style="max-width: 120px; opacity: 0.8;" />
    </div>

    <p style="font-size: 12px; color: #999; margin-top: 24px; text-align: center;">Este es un mensaje automático. No respondas a este correo.</p>
  </div>
  `,
    });

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

    const resultado = await verificarMesasDisponibles({
      fecha,
      sector,
      personas,
      hora,
    });

    res.json(resultado);
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
