import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

type Categoria = "comida" | "bebida" | "postre" | "coctel" | "vino";

type Item = {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string;
  categoria: Categoria;
  disponible: boolean;
};

const CATEGORIAS: { valor: Categoria; label: string }[] = [
  { valor: "comida", label: "Comidas" },
  { valor: "bebida", label: "Bebidas" },
  { valor: "postre", label: "Postres" },
  { valor: "coctel", label: "Cócteles" },
  { valor: "vino", label: "Vinos" },
];

const MAX_DESCRIPCION = 100;

export default function MenuPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [cargando, setCargando] = useState(true);
  const [descripcionExpandida, setDescripcionExpandida] = useState<string | null>(null);

  useEffect(() => {
    const cargarMenu = async () => {
      try {
        const res = await axios.get<Item[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/carta`
        );
        setItems(res.data);
      } catch {
        toast.error("Error al cargar el menú");
      } finally {
        setCargando(false);
      }
    };
    cargarMenu();
  }, []);

  const mostrarDescripcion = (item: Item) => {
    if (
      item.descripcion.length <= MAX_DESCRIPCION ||
      descripcionExpandida === item._id
    ) {
      return item.descripcion;
    }
    return item.descripcion.slice(0, MAX_DESCRIPCION) + "...";
  };

  const toggleDescripcion = (id: string) => {
    setDescripcionExpandida((prev) => (prev === id ? null : id));
  };

  const renderItems = (categoria: Categoria) => {
    const filtrados = items.filter((item) => item.categoria === categoria);
    if (filtrados.length === 0) return null;

    return filtrados.map((item) => (
      <motion.div
        key={item._id}
        layout
        className="bg-zinc-800 rounded-xl p-4 shadow space-y-2"
      >
        {item.imagenUrl && (
          <img
            src={item.imagenUrl}
            alt={item.nombre}
            className="w-full h-48 object-cover rounded-xl"
          />
        )}
        <h3 className="text-lg font-bold text-white">{item.nombre}</h3>
        <p className="text-sm text-zinc-400">{mostrarDescripcion(item)}</p>
        {item.descripcion.length > MAX_DESCRIPCION && (
          <button
            onClick={() => toggleDescripcion(item._id)}
            className="text-xs text-green-400 hover:text-green-300 transition"
          >
            {descripcionExpandida === item._id ? "Ver menos" : "Ver más"}
          </button>
        )}
        <p className="text-right font-medium text-white">${item.precio}</p>
      </motion.div>
    ));
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-center">Menú</h1>

        {cargando ? (
          <p className="text-zinc-400 text-center">Cargando menú...</p>
        ) : (
          CATEGORIAS.map(({ valor, label }) => {
            const hayItems = items.some((i) => i.categoria === valor);
            if (!hayItems) return null;

            return (
              <section key={valor}>
                <h2 className="text-2xl font-bold mb-4">{label}</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {renderItems(valor)}
                  </AnimatePresence>
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}