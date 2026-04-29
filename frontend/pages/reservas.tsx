import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

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

export default function ListaReservas() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);

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
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setReservas((prev) => prev.filter((r) => r._id !== id));
      toast.success("Reserva eliminada");
    } catch { toast.error("Error al eliminar la reserva"); }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reservas del día</h1>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="bg-zinc-800 text-white px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
        </div>
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
                <button onClick={() => eliminarReserva(reserva._id)} className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-xl text-white text-sm font-semibold">Eliminar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}