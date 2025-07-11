"use client";

import { useEffect, useState } from "react";
import socket from "@/utils/socket";

interface Reserva {
  _id: string;
  nombre: string;
  email: string;
  sector: string;
  hora: string;
  personas: number;
}

export default function AdminReservas() {
  const [fecha, setFecha] = useState("");
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [eventos, setEventos] = useState<string[]>([]);

  const sectores = ["Patio", "Esquina"];
  const horarios = ["19:30", "20:00", "20:30", "21:00", "21:30", "21:45"];

  const fetchReservas = async (fechaElegida: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/reservas?fecha=${fechaElegida}`
      );
      const data = await res.json();
      setReservas(data);
    } catch (err) {
      console.error("Error al cargar reservas:", err);
    }
  };

  useEffect(() => {
    if (fecha) {
      fetchReservas(fecha);
    }
  }, [fecha]);

  useEffect(() => {
    socket.on("reservaCreada", (reserva) => {
      setEventos((prev) => [
        ...prev,
        `✅ Reserva nueva: ${reserva.nombre} (${reserva.hora})`,
      ]);
      if (fecha === reserva.fecha) fetchReservas(fecha); // actualizar si es la misma fecha
    });

    socket.on("reservaEliminada", (id) => {
      setEventos((prev) => [...prev, `❌ Reserva eliminada (ID): ${id}`]);
      setReservas((prev) => prev.filter((r) => r._id !== id));
    });

    return () => {
      socket.off("reservaCreada");
      socket.off("reservaEliminada");
    };
  }, [fecha]);

  const eliminarReserva = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta reserva?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/reservas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) alert("Error al eliminar la reserva.");
      // No hace falta actualizar manualmente: ya se actualiza por WebSocket
    } catch (err) {
      console.error("Error al eliminar reserva:", err);
      alert("Error al conectar con el servidor.");
    }
  };

  const exportarCSV = () => {
    if (reservas.length === 0) return;

    const headers = ["Nombre", "Email", "Sector", "Horario", "Personas"];
    const rows = reservas.map((r) => [
      r.nombre,
      r.email,
      r.sector,
      r.hora,
      r.personas,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reservas_${fecha}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resumenPorSector = sectores.map((sector) => {
    const total = reservas
      .filter((r) => r.sector === sector)
      .reduce((sum, r) => sum + r.personas, 0);
    const limite = sector === "Patio" ? 40 : 35;
    const porcentaje = (total / limite) * 100;
    return { sector, total, limite, porcentaje };
  });

  const resumenPorHorario = horarios.map((hora) => {
    const total = reservas
      .filter((r) => r.hora === hora)
      .reduce((sum, r) => sum + r.personas, 0);
    return { hora, total };
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Reservas</h1>

      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="p-2 border rounded mb-6"
      />

      {reservas.length > 0 && (
        <button
          onClick={exportarCSV}
          className="mb-4 ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Exportar CSV
        </button>
      )}

      {eventos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Eventos en tiempo real</h2>
          {eventos.map((e, i) => (
            <p key={i} className="text-sm text-green-700">
              {e}
            </p>
          ))}
        </div>
      )}

      {reservas.length === 0 ? (
        <p className="text-gray-600">No hay reservas para esta fecha.</p>
      ) : (
        <>
          <table className="w-full table-auto border-collapse mb-8">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Nombre</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Sector</th>
                <th className="p-2 border">Horario</th>
                <th className="p-2 border">Personas</th>
                <th className="p-2 border">Acción</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((res) => (
                <tr key={res._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{res.nombre}</td>
                  <td className="p-2 border">{res.email}</td>
                  <td className="p-2 border">{res.sector}</td>
                  <td className="p-2 border">{res.hora}</td>
                  <td className="p-2 border">{res.personas}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => eliminarReserva(res._id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="text-xl font-semibold mb-2">Resumen por Sector</h2>
          <ul className="mb-6">
            {resumenPorSector.map((s) => (
              <li
                key={s.sector}
                className={`p-2 rounded border mb-2 ${
                  s.porcentaje > 90
                    ? "bg-red-100 border-red-400 text-red-800"
                    : s.porcentaje > 70
                    ? "bg-yellow-100 border-yellow-400 text-yellow-800"
                    : "bg-green-100 border-green-400 text-green-800"
                }`}
              >
                {s.sector}: {s.total} / {s.limite} personas (
                {s.porcentaje.toFixed(0)}%)
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mb-2">Resumen por Horario</h2>
          <ul>
            {resumenPorHorario.map((h) => (
              <li
                key={h.hora}
                className={`p-2 rounded border mb-2 ${
                  h.total >= 10
                    ? "bg-red-100 border-red-400 text-red-800"
                    : h.total >= 7
                    ? "bg-yellow-100 border-yellow-400 text-yellow-800"
                    : "bg-green-100 border-green-400 text-green-800"
                }`}
              >
                {h.hora}: {h.total} / 10 personas
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
