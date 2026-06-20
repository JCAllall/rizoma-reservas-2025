import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { CalendarDays, ClipboardList, ScrollText, LogOut, PlusCircle, X, ToggleLeft, ToggleRight } from "lucide-react";

interface Reserva {
  _id: string; nombre: string; email: string; telefono: string;
  fecha: string; hora: string; personas: number; sector: string;
  comentario?: string; listaEspera: boolean;
}
interface Resumen { totalPersonas: number; porSector: Record<string, number>; porHorario: Record<string, number>; }
interface ReservaForm { nombre: string; email: string; telefono: string; fecha: string; hora: string; personas: number; sector: "Patio" | "Esquina"; comentario: string; }
interface SectorEstado { sector: string; abierto: boolean; mensaje: string; }

const HORARIOS = ["20:00", "20:30", "21:00", "21:30"];
const FORM_INICIAL: ReservaForm = { nombre: "", email: "", telefono: "", fecha: new Date().toISOString().split("T")[0], hora: "20:00", personas: 1, sector: "Patio", comentario: "" };

export default function AdminIndex() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [reservasHoy, setReservasHoy] = useState<Reserva[]>([]);
  const [reservasFuturas, setReservasFuturas] = useState<Reserva[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState<ReservaForm>(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [estadoSectores, setEstadoSectores] = useState<SectorEstado[]>([]);
  const [actualizando, setActualizando] = useState<string | null>(null);

  const hoy = new Date().toISOString().split("T")[0];
  const en7Dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    if (!token) { router.push("/login"); return; }
    setNombre(name || "Admin");
    cargarDatos(token);
    cargarEstadoSectores();
  }, []);

  const cargarDatos = async (token: string) => {
    setCargando(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resHoy, resFuturas, resResumen] = await Promise.all([
        axios.get<Reserva[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas?fecha=${hoy}`, { headers }),
        axios.get<Reserva[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas/todas`, { headers }),
        axios.get<Resumen>(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas/resumen?desde=${hoy}&hasta=${en7Dias}`, { headers }),
      ]);
      setReservasHoy(resHoy.data);
      setReservasFuturas(resFuturas.data.filter((r) => r.fecha > hoy && !r.listaEspera).sort((a, b) => a.fecha > b.fecha ? 1 : -1));
      setResumen(resResumen.data);
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) router.push("/login");
      else toast.error("Error al cargar los datos");
    } finally { setCargando(false); }
  };

  const cargarEstadoSectores = async () => {
    try {
      const res = await axios.get<SectorEstado[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas/estado-sectores`);
      setEstadoSectores(res.data);
    } catch { toast.error("Error al cargar estado de sectores"); }
  };

  const toggleSector = async (sector: string, estadoActual: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    setActualizando(sector);
    try {
      const res = await axios.post<SectorEstado>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/estado-sectores`,
        { sector, abierto: !estadoActual },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEstadoSectores((prev) => prev.map((e) => e.sector === sector ? res.data : e));
      toast.success(`${sector} ${!estadoActual ? "abierto" : "cerrado"} para reservas`);
    } catch { toast.error("Error al actualizar el sector"); }
    finally { setActualizando(null); }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token"); localStorage.removeItem("role"); localStorage.removeItem("name");
    router.push("/login");
  };

  const eliminarReserva = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setReservasHoy((prev) => prev.filter((r) => r._id !== id));
      setReservasFuturas((prev) => prev.filter((r) => r._id !== id));
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
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas`, { ...form, esAdmin: true }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Reserva agregada correctamente");
      setModalAbierto(false); setForm(FORM_INICIAL);
      cargarDatos(token);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Error al guardar la reserva");
    } finally { setGuardando(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Panel Admin</h1>
            <p className="text-zinc-400 text-sm">Hola, {nombre} 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setForm(FORM_INICIAL); setModalAbierto(true); }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-xl text-white font-semibold text-sm">
              <PlusCircle size={18} /> Agregar reserva
            </button>
            <button onClick={cerrarSesion} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition">
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </div>

        {/* Navegación */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin" className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-zinc-700 transition p-6 rounded-2xl text-center">
            <CalendarDays size={32} className="text-green-500" /><span className="font-semibold">Reservas</span><span className="text-xs text-zinc-400">Ver y gestionar</span>
          </Link>
          <Link href="/admin/carta" className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-zinc-700 transition p-6 rounded-2xl text-center">
            <ScrollText size={32} className="text-green-500" /><span className="font-semibold">Carta</span><span className="text-xs text-zinc-400">Editar menú</span>
          </Link>
          <Link href="/admin/lista-espera" className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-zinc-700 transition p-6 rounded-2xl text-center">
            <ClipboardList size={32} className="text-green-500" /><span className="font-semibold">Lista de espera</span><span className="text-xs text-zinc-400">Ver pendientes</span>
          </Link>
        </div>

        {/* Control de sectores */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Estado de sectores</h2>
          <p className="text-xs text-zinc-400">Cerrá un sector para frenar las reservas. Los clientes verán un aviso automático.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["Patio", "Esquina"].map((sector) => {
              const estado = estadoSectores.find((e) => e.sector === sector);
              const abierto = estado?.abierto ?? true;
              const cargandoSector = actualizando === sector;
              return (
                <div key={sector} className={`rounded-2xl p-5 flex items-center justify-between gap-4 border-2 transition ${abierto ? "bg-zinc-800 border-green-600" : "bg-zinc-800 border-red-600"}`}>
                  <div>
                    <p className="font-semibold text-lg">{sector}</p>
                    <p className={`text-sm font-medium ${abierto ? "text-green-400" : "text-red-400"}`}>
                      {abierto ? "✅ Abierto para reservas" : "🔴 Cerrado — sin reservas"}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSector(sector, abierto)}
                    disabled={cargandoSector}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${abierto ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
                  >
                    {cargandoSector ? "..." : abierto ? <><ToggleRight size={18} /> Cerrar</> : <><ToggleLeft size={18} /> Abrir</>}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {cargando ? <p className="text-zinc-400 text-center">Cargando datos...</p> : (
          <>
            {resumen && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold">Resumen próximos 7 días</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-zinc-800 rounded-2xl p-5 text-center">
                    <p className="text-3xl font-bold text-green-500">{resumen.totalPersonas}</p>
                    <p className="text-zinc-400 text-sm mt-1">Personas totales</p>
                  </div>
                  {Object.entries(resumen.porSector).map(([sector, total]) => (
                    <div key={sector} className="bg-zinc-800 rounded-2xl p-5 text-center">
                      <p className="text-3xl font-bold text-green-500">{total}</p>
                      <p className="text-zinc-400 text-sm mt-1">{sector}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-zinc-800 rounded-2xl p-5 space-y-3">
                  <p className="font-semibold">Horarios más ocupados</p>
                  {Object.entries(resumen.porHorario).sort(([, a], [, b]) => b - a).map(([hora, total]) => (
                    <div key={hora} className="flex items-center gap-3">
                      <span className="text-zinc-400 text-sm w-14">{hora}</span>
                      <div className="flex-1 bg-zinc-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((total / 12) * 100, 100)}%` }} />
                      </div>
                      <span className="text-sm text-zinc-400 w-8 text-right">{total}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">Reservas de hoy <span className="text-zinc-400 text-base font-normal">({hoy})</span></h2>
              {reservasHoy.length === 0 ? <p className="text-zinc-400">No hay reservas para hoy.</p> : (
                <div className="space-y-3">{reservasHoy.map((r) => <ReservaCard key={r._id} reserva={r} onEliminar={eliminarReserva} />)}</div>
              )}
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold">Próximas reservas</h2>
              {reservasFuturas.length === 0 ? <p className="text-zinc-400">No hay reservas futuras.</p> : (
                <div className="space-y-3">{reservasFuturas.map((r) => <ReservaCard key={r._id} reserva={r} onEliminar={eliminarReserva} />)}</div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Modal agregar reserva manual */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModalAbierto(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"><X size={20} /></button>
            <h2 className="text-xl font-semibold">Agregar reserva manual</h2>
            <p className="text-xs text-zinc-400">Para reservas recibidas por WhatsApp u otro medio</p>
            <form onSubmit={handleGuardarManual} className="space-y-3">
              <input name="nombre" placeholder="Nombre" required value={form.nombre} onChange={handleFormChange} className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500" />
              <input name="email" placeholder="Email (opcional)" type="text" value={form.email} onChange={handleFormChange} className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500" />
              <input name="telefono" placeholder="Teléfono" type="tel" required value={form.telefono} onChange={handleFormChange} className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500" />
              <input name="fecha" type="date" required value={form.fecha} onChange={handleFormChange} className="w-full p-3 rounded-xl bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-green-500" />
              <div>
                <p className="text-sm text-zinc-400 mb-2">Horario</p>
                <div className="grid grid-cols-4 gap-2">
                  {HORARIOS.map((h) => (
                    <button key={h} type="button" onClick={() => setForm((prev) => ({ ...prev, hora: h }))}
                      className={`py-2 rounded-xl text-sm font-medium transition ${form.hora === h ? "bg-green-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}`}>{h}</button>
                  ))}
                </div>
              </div>
              <input name="personas" type="number" min={1} max={20} value={form.personas} onChange={handleFormChange} placeholder="Personas" className="w-full p-3 rounded-xl bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-green-500" />
              <select name="sector" value={form.sector} onChange={handleFormChange} className="w-full p-3 rounded-xl bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-green-500">
                <option value="Patio">Patio</option>
                <option value="Esquina">Esquina</option>
              </select>
              <textarea name="comentario" placeholder="Comentario (opcional)" value={form.comentario} onChange={handleFormChange} rows={2} className="w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              <button type="submit" disabled={guardando} className="w-full bg-green-600 hover:bg-green-700 transition p-3 rounded-xl text-white font-semibold disabled:opacity-50">
                {guardando ? "Guardando..." : "Guardar reserva"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ReservaCard({ reserva, onEliminar }: { reserva: Reserva; onEliminar: (id: string) => void }) {
  return (
    <div className="bg-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-1 text-sm">
        <p className="font-semibold text-base">{reserva.nombre}</p>
        <p><span className="text-zinc-400">📅</span> {reserva.fecha} — <span className="text-zinc-400">⏰</span> {reserva.hora}</p>
        <p><span className="text-zinc-400">📍</span> {reserva.sector} — <span className="text-zinc-400">👥</span> {reserva.personas} persona(s)</p>
        <p><span className="text-zinc-400">✉️</span> {reserva.email} — <span className="text-zinc-400">📱</span> {reserva.telefono}</p>
        {reserva.comentario && <p><span className="text-zinc-400">💬</span> {reserva.comentario}</p>}
        {reserva.listaEspera && <span className="inline-block bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">Lista de espera</span>}
      </div>
      <button onClick={() => onEliminar(reserva._id)} className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-xl text-white text-sm font-semibold shrink-0">Eliminar</button>
    </div>
  );
}
