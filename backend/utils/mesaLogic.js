// backend/utils/mesaLogic.js

const Reserva = require("../models/reserva");

async function verificarMesasDisponibles({ fecha, sector, personas, hora }) {
  const personasSolicitadas = parseInt(personas);
  const horaReserva = new Date(`${fecha}T${hora}:00`);
  const ahora = new Date();
  const horasDeAnticipo = (horaReserva - ahora) / (1000 * 60 * 60);

  // 🔹 Sector Patio siempre admite
  if (sector === "Patio") return { disponible: true };

  // 🔹 Más de 8 personas se deriva a WhatsApp
  if (personasSolicitadas > 8)
    return { disponible: false, mensaje: "WhatsApp" };

  const reservas = await Reserva.find({ fecha, sector, listaEspera: false });

  let mesas2 = 10;
  let mesas4 = 4;

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

  return { disponible: personasRestantes <= 0 };
}

module.exports = { verificarMesasDisponibles };
