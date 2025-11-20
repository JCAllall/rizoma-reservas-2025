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

  const [reservaExitosa, setReservaExitosa] = useState(false);
  const [datosConfirmados, setDatosConfirmados] = useState<ReservaForm | null>(
    null
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "personas" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/reservas", form);

      if (res.data.mensaje === "Agregado a la lista de espera.") {
        toast.success("Te sumamos a la lista de espera 👀");
      } else {
        toast.success("¡Reserva confirmada! 🎉");
        setReservaExitosa(true);
        setDatosConfirmados(form);
      }

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

  // 👉 Google Calendar Link
  const generarLinkGoogleCalendar = () => {
    if (!datosConfirmados) return "#";
    const fecha = datosConfirmados.fecha.replace(/-/g, "");
    const horaInicio = datosConfirmados.hora.replace(":", "") + "00";
    const horaFin =
      String(Number(datosConfirmados.hora.split(":")[0]) + 1).padStart(2, "0") +
      datosConfirmados.hora.split(":")[1] +
      "00";

    const start = `${fecha}T${horaInicio}`;
    const end = `${fecha}T${horaFin}`;

    const detalles = `Reserva en Rizoma para ${datosConfirmados.personas} persona(s) en el sector ${datosConfirmados.sector}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Reserva+Rizoma&dates=${start}/${end}&details=${encodeURIComponent(
      detalles
    )}`;
  };

  // 👉 WhatsApp Link
  const generarLinkWhatsApp = () => {
    if (!datosConfirmados) return "#";
    const mensaje = `¡Hola! Tengo una reserva en Rizoma 🍷\n\n📅 ${datosConfirmados.fecha} - ${datosConfirmados.hora}\n👥 ${datosConfirmados.personas} persona(s)\n📍 ${datosConfirmados.sector}`;
    return `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center px-4">
      <AnimatePresence>
        {reservaExitosa && datosConfirmados ? (
          <motion.div
            className="text-center p-6 rounded-2xl bg-zinc-800 shadow-lg max-w-md w-full space-y-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CheckCircle size={64} className="text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">¡Reserva Confirmada!</h2>
            <p className="text-sm text-zinc-300">Te esperamos en Rizoma 🍷</p>

            <div className="text-left bg-zinc-700 p-4 rounded-md space-y-2">
              <p>
                <strong>Nombre:</strong> {datosConfirmados.nombre}
              </p>
              <p>
                <strong>Email:</strong> {datosConfirmados.email}
              </p>
              <p>
                <strong>Fecha:</strong> {datosConfirmados.fecha}
              </p>
              <p>
                <strong>Hora:</strong> {datosConfirmados.hora}
              </p>
              <p>
                <strong>Personas:</strong> {datosConfirmados.personas}
              </p>
              <p>
                <strong>Sector:</strong> {datosConfirmados.sector}
              </p>
            </div>

            <div className="space-y-2">
              <a
                href={generarLinkGoogleCalendar()}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
              >
                Agregar a Google Calendar
              </a>

              <a
                href={generarLinkWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
              >
                Compartir por WhatsApp
              </a>
            </div>

            <button
              onClick={() => {
                setReservaExitosa(false);
                setDatosConfirmados(null);
              }}
              className="mt-4 bg-zinc-600 hover:bg-zinc-700 px-4 py-2 rounded text-white font-semibold"
            >
              Hacer otra reserva
            </button>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-zinc-800 p-6 rounded-2xl shadow-lg max-w-md w-full space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-center">
              Nueva Reserva
            </h2>

            <input
              name="nombre"
              placeholder="Nombre"
              onChange={handleChange}
              value={form.nombre}
              className="w-full p-2 rounded bg-zinc-700 text-white"
              required
            />
            <input
              name="email"
              placeholder="Email"
              type="email"
              onChange={handleChange}
              value={form.email}
              className="w-full p-2 rounded bg-zinc-700 text-white"
              required
            />
            <input
              name="fecha"
              type="date"
              onChange={handleChange}
              value={form.fecha}
              className="w-full p-2 rounded bg-zinc-700 text-white"
              required
            />
            <input
              name="hora"
              type="time"
              onChange={handleChange}
              value={form.hora}
              className="w-full p-2 rounded bg-zinc-700 text-white"
              required
            />
            <input
              name="personas"
              type="number"
              min={1}
              max={20}
              value={form.personas}
              onChange={handleChange}
              className="w-full p-2 rounded bg-zinc-700 text-white"
            />
            <select
              name="sector"
              value={form.sector}
              onChange={handleChange}
              className="w-full p-2 rounded bg-zinc-700 text-white"
            >
              <option value="Patio">Patio</option>
              <option value="Esquina">Esquina</option>
            </select>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 transition p-2 rounded text-white font-semibold"
            >
              Reservar
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
