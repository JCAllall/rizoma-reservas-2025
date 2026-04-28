// backend/utils/mesaLogic.js
const Reserva = require("../models/reserva");

// ─── Configuración de sectores ───────────────────────────
const SECTORES = {
  Esquina: { mesas2: 10, mesas4: 4 },
  Patio:   { mesas2: 11, mesas4: 4 },
};

// ─── Cuántas mesas necesita un grupo ─────────────────────
function calcularMesasNecesarias(personas) {
  if (personas <= 3) return { mesas2: 1, mesas4: 0 };
  if (personas === 4) return { mesas2: 0, mesas4: 1 };
  if (personas <= 6) return { mesas2: 2, mesas4: 0 };
  if (personas <= 7) return { mesas2: 1, mesas4: 1 };
  if (personas === 8) return { mesas2: 0, mesas4: 2 };
  return null; // más de 8 → WhatsApp
}

// ─── Cuántas mesas usa una reserva existente ─────────────
function mesasUsadasPorReserva(personas) {
  if (personas <= 3) return { mesas2: 1, mesas4: 0 };
  if (personas === 4) return { mesas2: 0, mesas4: 1 };
  if (personas <= 6) return { mesas2: 2, mesas4: 0 };
  if (personas <= 7) return { mesas2: 1, mesas4: 1 };
  if (personas === 8) return { mesas2: 0, mesas4: 2 };
  return { mesas2: 0, mesas4: 0 };
}

async function verificarMesasDisponibles({ fecha, sector, personas, hora }) {
  const personasNum = Number(personas);

  // Más de 8 → WhatsApp
  if (personasNum > 8) {
    return { disponible: false, mensaje: "WhatsApp" };
  }

  // Verificar 1 hora mínima de anticipo
  const horaReserva = new Date(`${fecha}T${hora}:00`);
  const ahora = new Date();
  const horasDeAnticipo = (horaReserva - ahora) / (1000 * 60 * 60);

  if (horasDeAnticipo < 1) {
    return {
      disponible: false,
      mensaje: "La reserva debe hacerse con al menos 1 hora de anticipación.",
    };
  }

  // Mesas necesarias para esta reserva
  const necesarias = calcularMesasNecesarias(personasNum);
  if (!necesarias) {
    return { disponible: false, mensaje: "WhatsApp" };
  }

  // Mesas totales del sector
  const config = SECTORES[sector];
  if (!config) {
    return { disponible: false, mensaje: "Sector no válido." };
  }

  // Mesas ya ocupadas en ese sector/fecha/hora
  const reservas = await Reserva.find({
    fecha,
    sector,
    hora,
    listaEspera: false,
  });

  let mesas2Ocupadas = 0;
  let mesas4Ocupadas = 0;

  for (const r of reservas) {
    const usadas = mesasUsadasPorReserva(r.personas);
    mesas2Ocupadas += usadas.mesas2;
    mesas4Ocupadas += usadas.mesas4;
  }

  const mesas2Libres = config.mesas2 - mesas2Ocupadas;
  const mesas4Libres = config.mesas4 - mesas4Ocupadas;

  // Verificar si hay mesas suficientes
  let m2 = mesas2Libres;
  let m4 = mesas4Libres;

  // Intentar asignar mesas preferidas
  m2 -= necesarias.mesas2;
  m4 -= necesarias.mesas4;

  // Si falta alguna mesa, intentar sustituir
  // Mesa de 4 faltante → dos mesas de 2
  if (m4 < 0) {
    const faltanM4 = Math.abs(m4);
    m4 = 0;
    m2 -= faltanM4 * 2;
  }

  // Mesa de 2 faltante → una mesa de 4
  if (m2 < 0) {
    const faltanM2 = Math.abs(m2);
    m2 = 0;
    m4 -= faltanM2;
  }

  const disponible = m2 >= 0 && m4 >= 0;

  return {
    disponible,
    mensaje: disponible ? "OK" : "No hay mesas disponibles para ese horario.",
    mesas2Libres: Math.max(0, mesas2Libres),
    mesas4Libres: Math.max(0, mesas4Libres),
  };
}

module.exports = { verificarMesasDisponibles };