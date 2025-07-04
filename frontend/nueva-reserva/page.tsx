"use client";

import { useState } from "react";
import axios from "axios";

export default function NuevaReserva() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    fecha: "",
    hora: "",
    personas: 1,
    sector: "Patio",
  });

  const [mensaje, setMensaje] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/reservas", form);
      setMensaje("✅ Reserva creada correctamente");
      setForm({
        nombre: "",
        email: "",
        fecha: "",
        hora: "",
        personas: 1,
        sector: "Patio",
      });
    } catch (error) {
      console.error("Error al crear reserva:", error);
      setMensaje("❌ Error al crear la reserva");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Nueva Reserva</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="time"
          name="hora"
          value={form.hora}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="personas"
          min="1"
          value={form.personas}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <select
          name="sector"
          value={form.sector}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="Patio">Patio</option>
          <option value="Esquina">Esquina</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Reservar
        </button>
      </form>

      {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
    </div>
  );
}
