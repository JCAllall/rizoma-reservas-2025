import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  CalendarDays,
  ClipboardList,
  ScrollText,
  LogOut,
} from "lucide-react";

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

interface Resumen {
  totalPersonas: number;
  porSector: Record<string, number>;
  porHorario: Record<string, number>;
}

export default function AdminIndex() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [reservasHoy, setReservasHoy] = useState<Reserva[]>([]);
  const [reservasFuturas, setReservasFuturas] = useState<Reserva[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cargando, setCargando] = useState(true);

  const hoy = new Date().toISOString().split("T")[0];
  const en7Dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    if (!token) {
      router.push("/login");
      return;
    }
    setNombre(name || "Admin");
    cargarDatos(token);
  }, []);

  const cargarDatos = async (token: string) => {
    setCargando(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resHoy, resFuturas, resResumen] = await Promise.all([
        axios.get<Reserva[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservas?fecha=${hoy}`,
          { headers }
        ),
        axios.get<Reserva[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/todas`,
          { headers }
        ),
        axios.get<Resumen>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/resumen?desde=${hoy}&hasta=${en7Dias}`,
          { headers }
        ),
      ]);

      setReservasHoy(resHoy.data);
      setReservasFuturas(
        resFuturas.data
          .filter((r) => r.fecha > hoy && !r.listaEspera)
          .sort((a, b) => (a.fecha > b.fecha ? 1 : -1))
      );
      setResumen(resResumen.data);
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        router.push("/login");
      } else {
        toast.error("Error al cargar los datos");
      }
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    router.push("/login");
  };

  const eliminarReserva = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservasHoy((prev) => prev.filter((r) => r._id !== id));
      setReservasFuturas((prev) => prev.filter((r) => r._id !== id));
      toast.success("Reserva eliminada");
    } catch {
      toast.error("Error al eliminar la reserva");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Panel Admin</h1>
            <p className="text-zinc-400 text-sm">Hola, {nombre} 👋</p>
          </div>
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>

        {/* Navegación */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/reservas"
            className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-zinc-700 transition p-6 rounded-2xl text-center"
          >
            <CalendarDays size={32} className="text-green-500" />
            <span className="font-semibold">Reservas</span>
            <span className="text-xs text-zinc-400">Ver y gestionar</span>
          </Link>
          <Link
            href="/admin/carta"
            className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-zinc-700 transition p-6 rounded-2xl text-center"
          >
            <ScrollText size={32} className="text-green-500" />
            <span className="font-semibold">Carta</span>
            <span className="text-xs text-zinc-400">Editar menú</span>
          </Link>
          <Link
            href="/admin/lista-espera"
            className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-zinc-700 transition p-6 rounded-2xl text-center"
          >
            <ClipboardList size={32} className="text-green-500" />
            <span className="font-semibold">Lista de espera</span>
            <span className="text-xs text-zinc-400">Ver pendientes</span>
          </Link>
        </div>

        {cargando ? (
          <p className="text-zinc-400 text-center">Cargando datos...</p>
        ) : (
          <>
            {/* Resumen 7 días */}
            {resumen && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold">Resumen próximos 7 días</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-zinc-800 rounded-2xl p-5 text-center">
                    <p className="text-3xl font-bold text-green-500">
                      {resumen.totalPersonas}
                    </p>
                    <p className="text-zinc-400 text-sm mt-1">
                      Personas totales
                    </p>
                  </div>
                  {Object.entries(resumen.porSector).map(([sector, total]) => (
                    <div
                      key={sector}
                      className="bg-zinc-800 rounded-2xl p-5 text-center"
                    >
                      <p className="text-3xl font-bold text-green-500">
                        {total}
                      </p>
                      <p className="text-zinc-400 text-sm mt-1">{sector}</p>
                    </div>
                  ))}
                </div>

                {/* Horarios más ocupados */}
                <div className="bg-zinc-800 rounded-2xl p-5 space-y-3">
                  <p className="font-semibold">Horarios más ocupados</p>
                  {Object.entries(resumen.porHorario)
                    .sort(([, a], [, b]) => b - a)
                    .map(([hora, total]) => (
                      <div key={hora} className="flex items-center gap-3">
                        <span className="text-zinc-400 text-sm w-14">
                          {hora}
                        </span>
                        <div className="flex-1 bg-zinc-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min((total / 12) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-zinc-400 w-8 text-right">
                          {total}
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Reservas de hoy */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">
                Reservas de hoy{" "}
                <span className="text-zinc-400 text-base font-normal">
                  ({hoy})
                </span>
              </h2>
              {reservasHoy.length === 0 ? (
                <p className="text-zinc-400">No hay reservas para hoy.</p>
              ) : (
                <div className="space-y-3">
                  {reservasHoy.map((r) => (
                    <ReservaCard
                      key={r._id}
                      reserva={r}
                      onEliminar={eliminarReserva}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Reservas futuras */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold">Próximas reservas</h2>
              {reservasFuturas.length === 0 ? (
                <p className="text-zinc-400">No hay reservas futuras.</p>
              ) : (
                <div className="space-y-3">
                  {reservasFuturas.map((r) => (
                    <ReservaCard
                      key={r._id}
                      reserva={r}
                      onEliminar={eliminarReserva}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// Componente de tarjeta de reserva
function ReservaCard({
  reserva,
  onEliminar,
}: {
  reserva: Reserva;
  onEliminar: (id: string) => void;
}) {
  return (
    <div className="bg-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-1 text-sm">
        <p className="font-semibold text-base">{reserva.nombre}</p>
        <p>
          <span className="text-zinc-400">📅</span> {reserva.fecha} —{" "}
          <span className="text-zinc-400">⏰</span> {reserva.hora}
        </p>
        <p>
          <span className="text-zinc-400">📍</span> {reserva.sector} —{" "}
          <span className="text-zinc-400">👥</span> {reserva.personas} persona(s)
        </p>
        <p>
          <span className="text-zinc-400">✉️</span> {reserva.email} —{" "}
          <span className="text-zinc-400">📱</span> {reserva.telefono}
        </p>
        {reserva.comentario && (
          <p>
            <span className="text-zinc-400">💬</span> {reserva.comentario}
          </p>
        )}
        {reserva.listaEspera && (
          <span className="inline-block bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
            Lista de espera
          </span>
        )}
      </div>
      <button
        onClick={() => onEliminar(reserva._id)}
        className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-xl text-white text-sm font-semibold shrink-0"
      >
        Eliminar
      </button>
    </div>
  );
}