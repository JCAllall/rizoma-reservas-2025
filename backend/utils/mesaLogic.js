const Reserva = require("../models/reserva");

const SECTORES = {
  Esquina: { mesas2: 10, mesas4: 4 },
  Patio:   { mesas2: 11, mesas4: 4 },
};

function calcularMesasNecesarias(personas) {
  if (personas <= 3) return { mesas2: 1, mesas4: 0 };
  if (personas <= 4) return { mesas2: 0, mesas4: 1 };
  if (personas <= 8) return { mesas2: 0, mesas4: 2 };
  return null;
}

function mesasUsadasPorReserva(personas) {
  if (personas <= 3) return { mesas2: 1, mesas4: 0 };
  if (personas <= 4) return { mesas2: 0, mesas4: 1 };
  if (personas <= 8) return { mesas2: 0, mesas4: 2 };
  return { mesas2: 0, mesas4: 0 };
}

async function verificarMesasDisponibles({ fecha, sector, personas, hora, esAdmin }) {
  const personasNum = Number(personas);

  if (personasNum > 8) {
    return { disponible: false, mensaje: "WhatsApp" };
  }

  // Solo verificar anticipación si NO es admin
  if (!esAdmin) {
    const horaReserva = new Date(`${fecha}T${hora}:00`);
    const ahora = new Date();
    const horasDeAnticipo = (horaReserva - ahora) / (1000 * 60 * 60);

    if (horasDeAnticipo < 0.5) {
      return {
        disponible: false,
        mensaje: "La reserva debe hacerse con al menos 30 minutos de anticipación.",
      };
    }
  }

  const necesarias = calcularMesasNecesarias(personasNum);
  if (!necesarias) {
    return { disponible: false, mensaje: "WhatsApp" };
  }

  const config = SECTORES[sector];
  if (!config) {
    return { disponible: false, mensaje: "Sector no válido." };
  }

  const reservas = await Reserva.find({ fecha, sector, hora, listaEspera: false });

  let mesas2Ocupadas = 0;
  let mesas4Ocupadas = 0;

  for (const r of reservas) {
    const usadas = mesasUsadasPorReserva(r.personas);
    mesas2Ocupadas += usadas.mesas2;
    mesas4Ocupadas += usadas.mesas4;
  }

  const mesas2Libres = config.mesas2 - mesas2Ocupadas;
  const mesas4Libres = config.mesas4 - mesas4Ocupadas;

  let m2 = mesas2Libres - necesarias.mesas2;
  let m4 = mesas4Libres - necesarias.mesas4;

  if (m4 < 0) {
    const faltanM4 = Math.abs(m4);
    m4 = 0;
    m2 -= faltanM4 * 2;
  }

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