import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

interface EntradaEspera {
  _id: string;
  nombre: string;
  email: string;
  telefono?: string;
  fecha: string;
  sector: string;
  comentario?: string;
  createdAt: string;
}

export default function ListaEspera() {
  const router = useRouter();
  const [lista, setLista] = useState<EntradaEspera[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fecha, setFecha] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    cargarLista(token);
  }, [fecha]);

  const cargarLista = async (token: string) => {
    setCargando(true);
    try {
      const res = await axios.get<EntradaEspera[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/lista-espera?fecha=${fecha}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLista(res.data);
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        router.push("/login");
      } else {
        toast.error("Error al cargar la lista de espera");
      }
    } finally {
      setCargando(false);
    }
  };

  const eliminarEntrada = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLista((prev) => prev.filter((e) => e._id !== id));
      toast.success("Entrada eliminada");
    } catch {
      toast.error("Error al eliminar la entrada");
    }
  };

  const confirmarReserva = async (entrada: EntradaEspera) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      // Eliminar de lista de espera
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${entrada._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLista((prev) => prev.filter((e) => e._id !== entrada._id));
      toast.success(`${entrada.nombre} removido de la lista de espera`);

      // Redirigir a nueva reserva con datos precargados
      router.push(
        `/nuevaReserva?nombre=${encodeURIComponent(entrada.nombre)}&email=${encodeURIComponent(entrada.email)}&fecha=${entrada.fecha}&sector=${entrada.sector}`
      );
    } catch {
      toast.error("Error al procesar la entrada");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Lista de espera</h1>
            <p className="text-zinc-400 text-sm">
              Personas esperando disponibilidad
            </p>
          </div>
        </div>

        {/* Filtro por fecha */}
        <div className="flex items-center gap-3">
          <label className="text-zinc-400 text-sm">Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-zinc-800 text-white px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Lista */}
        {cargando ? (
          <p className="text-zinc-400">Cargando lista de espera...</p>
        ) : lista.length === 0 ? (
          <div className="bg-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-400">
              No hay personas en lista de espera para esta fecha.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm">
              {lista.length} persona(s) en espera
            </p>
            {lista.map((entrada, index) => (
              <div
                key={entrada._id}
                className="bg-zinc-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        #{index + 1}
                      </span>
                      <p className="font-semibold text-base">{entrada.nombre}</p>
                    </div>
                    <p>
                      <span className="text-zinc-400">📅</span> {entrada.fecha} —{" "}
                      <span className="text-zinc-400">📍</span> {entrada.sector}
                    </p>
                    <p>
                      <span className="text-zinc-400">✉️</span> {entrada.email}
                    </p>
                    {entrada.telefono && (
                      <p>
                        <span className="text-zinc-400">📱</span> {entrada.telefono}
                      </p>
                    )}
                    {entrada.comentario && (
                      <p>
                        <span className="text-zinc-400">💬</span> {entrada.comentario}
                      </p>
                    )}
                    <p className="text-zinc-500 text-xs">
                      Agregado:{" "}
                      {new Date(entrada.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => confirmarReserva(entrada)}
                    className="flex-1 bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-xl text-white text-sm font-semibold"
                  >
                    ✅ Confirmar reserva
                  </button>
                  <button
                    onClick={() => eliminarEntrada(entrada._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-xl text-white text-sm font-semibold"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}