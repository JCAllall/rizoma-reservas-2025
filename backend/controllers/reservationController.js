const Reserva = require("../models/reserva");
const PDFDocument = require("pdfkit");
const { verificarMesasDisponibles } = require("../utils/mesaLogic");
const sendEmail = require("../utils/sendEmail");

// Configuración de capacidad centralizada
const LIMITES = {
  HORARIO: 12,
  DIARIO: {
    Patio: 40,
    Esquina: 46,  // ← antes decía "Salon"
  },
};

let io;

function setSocketIO(ioInstance) {
  io = ioInstance;
}

// ✅ Crear reserva
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

    // Enviar email sin romper la reserva si falla
    try {
      await sendEmail({
        to: emailNormalizado,
        subject: "Confirmación de reserva en Rizoma",
        text: `Hola ${nombre}, tu reserva fue confirmada para el día ${fecha} a las ${hora} en el sector ${sector}, para ${personasNum} persona(s). ¡Te esperamos!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e2e2; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #2e7d32; margin-bottom: 8px;">✅ ¡Reserva confirmada!</h2>
            <p style="margin: 0 0 8px;">Hola <strong>${nombre}</strong>