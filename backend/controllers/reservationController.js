const Reserva = require("../models/reserva");
const PDFDocument = require("pdfkit");
const { verificarMesasDisponibles } = require("../utils/mesaLogic");
const sendEmail = require("../utils/sendEmail");

const LIMITES = {
  HORARIO: 12,
  DIARIO: {
    Patio: 40,
    Esquina: 46,
  },
};

let io;

function setSocketIO(ioInstance) {
  io = ioInstance;
}

const crearReserva = async (req, res) => {
  try {
    const { nombre, email, telefono, fecha, hora, sector, personas, comentario } = req.body;

    if (!nombre || !email || !telefono || !fecha || !hora || !sector || !personas) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const personasNum = Number(personas);

    if (!Number.isInteger(personasNum) || personasNum < 1) {
      return res.status(400).json({
        error: "La cantidad de personas debe ser un número entero mayor a 0.",
      });
    }

    if (personasNum > 8) {
      return res.status(400).json({
        error: "Para más de 8 personas contactanos por WhatsApp.",
      });
    }

    const fechaReserva = new Date(`${fecha}T00:00:00`);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (isNaN(fechaReserva.getTime())) {
      return res.status(400).json({ error: "La fecha ingresada no es válida." });
    }

    if (fechaReserva < hoy) {
      return res.status(400).json({
        error: "No se pueden hacer reservas para fechas pasadas.",
      });
    }

    const diaSemana = fechaReserva.getDay();
    if (![0, 2, 3, 4, 5, 6].includes(diaSemana)) {
      return res.status(400).json({
        error: "Solo se aceptan reservas de martes a domingo.",
      });
    }

    const resultado = await verificarMesasDisponibles({
      fecha,
      sector,
      personas: personasNum,
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

    const reservas = await Reserva.find({ fecha, sector, listaEspera: false });

    const LIMITE_DIARIO = LIMITES.DIARIO[sector] ?? 46;

    const totalPersonasDia = reservas.reduce(
      (acc, r) => acc + (r.personas || 0),
      0
    );

    if (totalPersonasDia + personasNum > LIMITE_DIARIO) {
      return res.status(400).json({
        error:
          "Capacidad diaria del sector superada. ¿Querés unirte a la lista de espera?",
      });
    }

    const personasEnHorario = reservas
      .filter((r) => r.hora === hora)
      .reduce((acc, r) => acc + (r.personas || 0), 0);

    if (personasEnHorario + personasNum > LIMITES.HORARIO) {
      return res.status(400).json({
        error:
          "Horario completo. Por favor elegí otro horario o unite a la lista de espera.",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const reservaDuplicada = await Reserva.findOne({
      fecha,
      hora,
      sector,
      email: emailNormalizado,
      listaEspera: false,
    });

    if (reservaDuplicada) {
      return res.status(400).json({
        error:
          "Ya existe una reserva con ese email para ese día, horario y sector.",
      });
    }

    const nuevaReserva = new Reserva({
      nombre,
      email: emailNormalizado,
      telefono,
      fecha,
      hora,
      sector,
      personas: personasNum,
      comentario,
      listaEspera: false,
    });

    await nuevaReserva.save();

    if (io) {
      io.emit("reservaCreada", {
        nombre: nuevaReserva.nombre,
        hora: nuevaReserva.hora,
        fecha: nuevaReserva.fecha,
        sector: nuevaReserva.sector,
      });
    }

    try {
      await sendEmail({
        to: emailNormalizado,
        subject: "Confirmación de reserva en Rizoma",
        text: `Hola ${nombre}, tu reserva fue confirmada para el día ${fecha} a las ${hora} en el sector ${sector}, para ${personasNum} persona(s). ¡Te esperamos!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e2e2; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #2e7d32; margin-bottom: 8px;">✅ ¡Reserva confirmada!</h2>
            <p style="margin: 0 0 8px;">Hola <strong>${nombre}</strong>,</p>
            <p style="margin: 0 0 16px;">Tu reserva fue confirmada con éxito. Aquí tenés los detalles:</p>
            <ul style="padding-left: 20px; margin-bottom: 20px;">
              <li><strong>📅 Fecha:</strong> ${fecha}</li>
              <li><strong>📍 Sector:</strong> ${sector}</li>
              <li><strong>⏰ Horario:</strong> ${hora}</li>
              <li><strong>👥 Personas:</strong> ${personasNum}</li>
            </ul>
            <p style="margin: 0 0 16px;">Gracias por elegir <strong>Rizoma</strong>. ¡Te esperamos!</p>
            <div style="text-align: center; margin-top: 24px;">
              <img src="https://i.imgur.com/Ib0iDCn.png" alt="Logo Rizoma" style="max-width: 120px; opacity: 0.8;" />
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 24px; text-align: center;">Este es un mensaje automático. No respondas a este correo.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error al enviar email de confirmación:", emailError.message);
    }

    return res.status(201).json({
      mensaje: "Reserva guardada correctamente",
      reserva: nuevaReserva,
    });
  } catch (error) {
    console.error("Error al guardar reserva:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
};

const eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findByIdAndDelete(id);

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

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
    const reservas = await Reserva.find({ fecha, listaEspera: false });
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
    const reservas = await Reserva.find({
      fecha,
      listaEspera: false,
    }).sort({ sector: 1, hora: 1 });
    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas por fecha:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const getCapacidadPorSector = async (req, res) => {
  try {
    const { fecha, sector } = req.query;
    if (!fecha || !sector)
      return res.status(400).json({ error: "Fecha y sector requeridos." });
    const reservas = await Reserva.find({ fecha, sector, listaEspera: false });
    const totalPersonas = reservas.reduce(
      (acc, r) => acc + (r.personas || 0),
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
      email: email.trim().toLowerCase(),
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
      return res.status(400).json({ error: "Faltan datos para verificar disponibilidad" });
    }
    const resultado = await verificarMesasDisponibles({ fecha, sector, personas, hora });
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
      fecha,
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
      doc.fontSize(12).text(
        `${i + 1}. ${r.nombre} - ${r.email} - ${r.sector} - ${r.hora} hs - ${r.personas} personas`
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
    const lista = await Reserva.find({ fecha, listaEspera: true });
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
      return res.status(400).json({ error: "Parámetros 'desde' y 'hasta' requeridos" });
    const reservas = await Reserva.find({
      fecha: { $gte: desde, $lte: hasta },
      listaEspera: false,
    });
    let totalPersonas = 0, porSector = {}, porHorario = {};
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
  obtenerCapacidadHorariaYDiaria,
  exportarReservasPDF,
  obtenerListaEspera,
  obtenerResumenPorRango,
  obtenerReservasPorFecha,
};