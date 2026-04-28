import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios, { AxiosError } from "axios";
import { Pencil, Trash2, Plus } from "lucide-react";
import CartaItemForm from "../../components/CartaItemForm";
import toast from "react-hot-toast";

type Item = {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string;
  categoria: "comida" | "bebida" | "postre" | "coctel" | "vino";
  disponible: boolean;
};

export default function AdminCartaPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [modoEdicion, setModoEdicion] = useState<null | Item>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    cargarItems(token);
  }, []);

  const cargarItems = async (token: string) => {
    setCargando(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/carta/admin`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(res.data);
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        router.push("/login");
      } else {
        toast.error("Error al cargar la carta");
      }
    } finally {
      setCargando(false);
    }
  };

  const eliminarItem = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    setEliminandoId(id);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/carta/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Ítem eliminado");
    } catch {
      toast.error("Error al eliminar el ítem");
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Editar carta</h1>
          <button
            onClick={() => {
              setModoEdicion(null);
              setMostrarFormulario(true);
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-xl text-white font-semibold"
          >
            <Plus size={18} />
            Nuevo ítem
          </button>
        </div>

        {mostrarFormulario && (
          <CartaItemForm
            itemInicial={modoEdicion}
            onClose={() => {
              setMostrarFormulario(false);
              setModoEdicion(null);
              const token = localStorage.getItem("token");
              if (token) cargarItems(token);
            }}
          />
        )}

        {cargando ? (
          <p className="text-zinc-400">Cargando carta...</p>
        ) : items.length === 0 ? (
          <p className="text-zinc-400">No hay ítems en la carta.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item._id}
                className={`bg-zinc-800 rounded-xl p-4 flex flex-col gap-2 ${
                  !item.disponible ? "opacity-50" : ""
                }`}
              >
                {item.imagenUrl && (
                  <img
                    src={item.imagenUrl}
                    alt={item.nombre}
                    className="h-40 object-cover rounded-lg"
                  />
                )}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{item.nombre}</h3>
                  {!item.disponible && (
                    <span className="text-xs bg-zinc-600 px-2 py-1 rounded-full">
                      No disponible
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400">
                  {item.descripcion.length > 60
                    ? item.descripcion.slice(0, 60) + "..."
                    : item.descripcion}
                </p>
                <p className="text-sm text-zinc-400 capitalize">{item.categoria}</p>
                <p className="font-medium text-right">${item.precio}</p>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setModoEd