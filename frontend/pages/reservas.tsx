import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { PlusCircle, X } from "lucide-react";

interface Reserva {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  fecha: string;
  hora: string;
  personas: number;
  sector: string;
  comentario?: string;
  listaEspera: boolean;
}

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
  fecha: new Date().toISOString().split("T")[0],
  hora: "20:00",
  personas: 1,
  sector: "Patio",
  comentario: "",
};

const HORARIOS = ["20:00", "20:30", "21:00", "21:30"];

export default function ListaReservas() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState<ReservaForm>(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchReservas(token);
  }, [fecha]);

  const fetchReservas = async (token: string) => {
    setCargando(true);
    try {
      const res = await axios.get<Reserva[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas?fecha=${fecha}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservas(res.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      if (error.response?.status === 401) { router.push("/login"); }
      else { toast.error("No se pudieron cargar las reservas"); }
    } finally { setCargando(false); }
  };

  const eliminarReserva = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservas((prev) => prev.filter((r) => r._id !== id));
      toast.success("Reserva eliminada");
    } catch { toast.error("Error al eliminar la reserva"); }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "personas" ? parseInt(value) : value }));
  };

  const handleGuardarManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    setGuardando(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Reserva agregada correctamente");
      setModalAbierto(false);
      setForm(FORM_INICIAL);
      fetchReservas(token);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Error al guardar la reserva");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold">Reservas del día</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="bg-zinc-800 text-white px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => { setForm({ ...FORM_INICIAL, fecha }); setModalAbierto(true); }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-xl text-white font-semibold text-sm"
            >
              <PlusCircle size={18} />
              Agregar reserva
            </button>
          </div>
        </div>

        {/* Lista */}
        {cargando ? (
          <p className="text-zinc-400">Cargando reservas...</p>
        ) : reservas.length === 0 ? (
          <p className="text-zinc-400">No hay reservas para esta fecha.</p>
        ) : (
          <div className="space-y-3">
            {reservas.map((reserva) => (
              <div key={reserva._id} className="bg-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1 text-sm">
                  <p><span className="text-zinc-400">Nombre:</span> {reserva.nombre}</p>
                  <p><span className="text-zinc-400">Email:</span> {reserva.email}</p>
                  <p><span className="text-zinc-400">Teléfono:</span> {reserva.telefono}</p>
                  <p><span className="text-zinc-400">Hora:</span> {reserva.hora} — <span className="text-zinc-400">Sector:</span> {reserva.sector}</p>
                  <p><span className="text-zinc-400">Personas:</span> {reserva.personas}</p>
                  {reserva.comentario && <p><span className="text-zinc-400">Comentario:</span> {reserva.comentario}</p>}
                  {reserva.listaEspera && <span className="inline-block bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">Lista de espera</span>}
                </div>
                <button
                  onClick={() => eliminarReserva(reserva._id)}
                  className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-xl text-white text-sm font-semibold"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal agregar reserva manual */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4 relative max-h-[90vh] overflow-y-auto">

            {/* Cerrar */}
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold">Agregar reserva manual</h2>
            <p className="text-xs text-zinc-400">Para reservas recibidas por WhatsApp u otro medio</p>

            <form onSubmit={handleGuardarManual} className="space-y-3">
              <input
                name="nombre" placeholder="Nombre" required
                value={form.nombre} onChange={handleFormChange}
                className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                name="email" placeholder="Email" type="email" required
                value={form.email} onChange={handleFormChange}
                className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                name="telefono" placeholder="Teléfono" type="tel" required
                value={form.telefono} onChange={handleFormChange}
                className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                name="fecha" type="date" required
                value={form.fecha} onChange={handleFormChange}
                className="w-full p-3 rounded-xl bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-green-500"
              />

              {/* Horarios */}
              <div>
                <p className="text-sm text-zinc-400 mb-2">Horario</p>
                <div className="grid grid-cols-4 gap-2">
                  {HORARIOS.map((h) => (
                    <button
                      key={h} type="button"
                      onClick={() => setForm((prev) => ({ ...prev, hora: h }))}
                      className={`py-2 rounded-xl text-sm font-medium transition ${
                        form.hora === h
                          ? "bg-green-600 text-white"
                          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <input
                name="personas" type="number" min={1} max={20}
                value={form.personas} onChange={handleFormChange}
                placeholder="Personas"
                className="w-full p-3 rounded-xl bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-green-500"
              />

              <select
                name="sector" value={form.sector} onChange={handleFormChange}
                className="w-full p-3 rounded-xl bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Patio">Patio</option>
                <option value="Esquina">Esquina</option>
              </select>

              <textarea
                name="comentario" placeholder="Comentario (opcional)"
                value={form.comentario} onChange={handleFormChange} rows={2}
                className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />

              <button
                type="submit" disabled={guardando}
                className="w-full bg-green-600 hover:bg-green-700 transition p-3 rounded-xl text-white font-semibold disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar reserva"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
