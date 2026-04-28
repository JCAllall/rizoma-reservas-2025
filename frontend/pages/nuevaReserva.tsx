import { useState, ChangeEvent, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface ReservaForm {
  nombre: string;
  email: string;
  telefono: string;
  fecha: string;
  hora: string;
  personas: number;
  sector: "Patio" | "Esquina";
  comentario: string;
}

const FORM_INICIAL: ReservaForm = {
  nombre: "",
  email: "",
  telefono: "",
  fecha: "",
  hora: "",
  personas: 1,
  sector: "Patio",
  comentario: "",
};

export default function NuevaReserva() {
  const [form, setForm] = useState<ReservaForm>(FORM_INICIAL);
  const [reservaExitosa, setReservaExitosa] = useState(false);
  const [datosConfirmados, setDatosConfirmados] = useState<ReservaForm | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "personas" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas`,
        form
      );

      if (res.data.mensaje === "Agregado a la lista de espera.") {
        toast.success("Te sumamos a la lista de espera 🙌");
      } else {
        setDatosConfirmados(form);
        setReservaExitosa(true);
        toast.success(res.data.mensaje || "Reserva creada con éxito");
      }
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Ocurrió un error al crear la reserva.");
    } finally {
      setCargando(false);
    }
  };

  const generarLinkGoogleCalendar = () => {
    if (!datosConfirmados) return "#";
    const fecha = datosConfirmados.fecha.replace(/-/g, "");
    const [hh, mm] = datosConfirmados.hora.split(":").map(Number);
    const horaFinNum = (hh + 1) % 24;
    const horaInicio = `${String(hh).padStart(2, "0")}${String(mm).padStart(2, "0")}00`;
    const horaFin = `${String(horaFinNum).padStart(2, "0")}${String(mm).padStart(2, "0")}00`;
    const start = `${fecha}T${horaInicio}`;
    const end = `${fecha}T${horaFin}`;
    const detalles = `Reserva en Rizoma para ${datosConfirmados.personas} persona(s) en el sector ${datosConfirmados.sector}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Reserva+Rizoma&dates=${start}/${end}&details=${encodeURIComponent(detalles)}`;
  };

  const generarLinkWhatsApp = () => {
    if (!datosConfirmados) return "#";
    const mensaje = `¡Hola! Tengo una reserva en Rizoma 🍷\n\n📅 ${datosConfirmados.fecha} - ${datosConfirmados.hora}\n👥 ${datosConfirmados.personas} persona(s)\n📍 ${datosConfirmados.sector}`;
    return `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {reservaExitosa && datosConfirmados ? (
          <motion.div
            key="confirmacion"
            className="text-center p-6 rounded-2xl bg-zinc-800 shadow-lg max-w-md w-full space-y-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CheckCircle size={64} className="text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">¡Reserva Confirmada!</h2>
            <p className="text-sm text-zinc-300">Te esperamos en Rizoma 🍷</p>

            <div className="text-left bg-zinc-700 p-4 rounded-xl space-y-2 text-sm">
              <p><strong>Nombre:</strong> {datosConfirmados.nombre}</p>
              <p><strong>Email:</strong> {datosConfirmados.email}</p>
              <p><strong>Teléfono:</strong> {datosConfirmados.telefono}</p>
              <p><strong>Fecha:</strong> {datosConfirmados.fecha}</p>
              <p><strong>Hora:</strong> {datosConfirmados.hora}</p>
              <p><strong>Personas:</strong> {datosConfirmados.personas}</p>
              <p><strong>Sector:</strong> {datosConfirmados.sector}</p>
              <p><strong>Comentario:</strong> {datosConfirmados.comentario || "—"}</p>
            </div>

            <div className="space-y-2">
              
                href={generarLinkGoogleCalendar()}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-xl text-white font-semibold"
              >
                Agregar a Google Calendar
              </a>
              
                href={generarLinkWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-xl text-white font-semibold"
              >
                Compartir por WhatsApp
              </a>
            </div>

            <button
              onClick={() => {
                setReservaExitosa(false);
                setDatosConfirmados(null);
                setForm(FORM_INICIAL);
              }}
              className="mt-2 bg-zinc-600 hover:bg-zinc-500 transition px-4 py-2 rounded-xl text-white font-semibold w-full"
            >
              Hacer otra reserva
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="formulario"
            onSubmit={handleSubmit}
            className="bg-zinc-800 p-6 rounded-2xl shadow-lg max-w-md w-full space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-center">Nueva Reserva</h2>

            <input
              name="nombre"
              placeholder="Nombre"
              onChange={handleChange}
              value={form.nombre}
              className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              name="email"
              placeholder="Email"
              type="email"
              onChange={handleChange}
              value={form.email}
              className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              name="telefono"
              placeholder="Teléfono"
              type="tel"
              onChange={handleChange}
              value={form.telefono}
              className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              name="fecha"
              type="date"
              onChange={handleChange}
              value={form.fecha}
              className="w-full p-3 rounded-xl bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              name="hora"
              type="time"
              onChange={handleChange}
              value={form.hora}
              className="w-full p-3 rounded-xl bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              name="personas"
              type="number"
              min={1}
              max={8}
              value={form.personas}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              name="sector"
              value={form.sector}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Patio">Patio</option>
              <option value="Esquina">Esquina</option>
            </select>
            <textarea
              name="comentario"
              placeholder="Comentario o nota (opcional)"
              onChange={handleChange}
              value={form.comentario}
              rows={3}
              className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-green-600 hover:bg-green-700 transition p-3 rounded-xl text-white font-semibold disabled:opacity-50"
            >
              {cargando ? "Enviando..." : "Reservar"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}