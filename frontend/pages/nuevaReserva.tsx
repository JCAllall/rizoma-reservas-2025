"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface ReservaForm {
  nombre: string;
  email: string;
  fecha: string;
  hora: string;
  personas: number;
  sector: "Patio" | "Esquina";
}

export default function NuevaReserva() {
  const [form, setForm] = useState<ReservaForm>({
    nombre: "",
    email: "",
    fecha: "",
    hora: "",
    personas: 1,
    sector: "Patio",
  });

  const [mostrarAnimacion, setMostrarAnimacion] = useState<boolean>(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === "personas" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !form.nombre ||
      !form.email ||
      !form.fecha ||
      !form.hora ||
      !form.personas ||
      !form.sector
    ) {
      toast.error("❌ Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/reservas", form);

      if (res.data.mensaje === "Agregado a la lista de espera.") {
        toast.success("Te sumamos a la lista de espera 👀");
      } else {
        toast.success("¡Reserva confirmada! 🎉");
      }

      setMostrarAnimacion(true);
      setTimeout(() => setMostrarAnimacion(false), 2000);

      // Reset form
      setForm({
        nombre: "",
        email: "",
        fecha: "",
        hora: "",
        personas: 1,
        sector: "Patio",
      });
    } catch (error: any) {
      console.error("Error al crear reserva:", error);
      const mensaje =
        error?.response?.data?.error || "❌ Error al crear la reserva";
      toast.error(mensaje);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 relative">
      <h2 className="text-2xl font-bold mb-4">Nueva Reserva</h2>

      <AnimatePresence>
        {mostrarAnimacion && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 rounded-lg"
          >
            <div className="flex flex-col items-center">
              <CheckCircle className="w-20 h-20 text-green-500" />
              <p className="text-green-700 font-semibold mt-2 text-xl">
                ¡Reserva confirmada!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="time"
          name="hora"
          value={form.hora}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="personas"
          min="1"
          value={form.personas}
          onChange={handleChange}
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
    </div>
  );
}
