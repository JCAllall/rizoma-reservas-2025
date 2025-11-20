"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../../components/Button";
import { Pencil, Trash2, Plus } from "lucide-react";
import CartaItemForm from "../../components/CartaItemForm";

type Item = {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  categoria: "comida" | "bebida";
};

export default function AdminCartaPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [modoEdicion, setModoEdicion] = useState<null | Item>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const cargarItems = async () => {
    const res = await axios.get("/api/carta");
    setItems(res.data);
  };

  useEffect(() => {
    cargarItems();
  }, []);

  const eliminarItem = async (id: string) => {
    if (confirm("¿Eliminar este ítem?")) {
      await axios.delete(`/api/carta/${id}`);
      cargarItems();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar carta</h1>
        <Button
          onClick={() => {
            setModoEdicion(null);
            setMostrarFormulario(true);
          }}
        >
          <Plus className="mr-2" size={18} />
          Nuevo ítem
        </Button>
      </div>

      {mostrarFormulario && (
        <CartaItemForm
          itemInicial={modoEdicion}
          onClose={() => {
            setMostrarFormulario(false);
            setModoEdicion(null);
            cargarItems();
          }}
        />
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item._id}
            className="border rounded-xl p-4 shadow-sm flex flex-col gap-2"
          >
            <img
              src={item.imagenUrl}
              alt={item.nombre}
              className="h-40 object-cover rounded-lg"
            />
            <h3 className="text-lg font-semibold">{item.nombre}</h3>
            <p className="text-sm text-gray-600">
              {item.descripcion.slice(0, 60)}...
            </p>
            <p className="font-medium text-right">${item.precio}</p>
            <div className="flex gap-2 mt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setModoEdicion(item);
                  setMostrarFormulario(true);
                }}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="destructive"
                onClick={() => eliminarItem(item._id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
