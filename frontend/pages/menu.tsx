"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../components/Button";
import { motion, AnimatePresence } from "framer-motion";

type Item = {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  categoria: "comida" | "bebida";
};

function MenuPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [descripcionExpandida, setDescripcionExpandida] = useState<
    string | null
  >(null);

  useEffect(() => {
    axios.get("/api/carta").then((res) => {
      setItems(res.data);
    });
  }, []);

  const mostrarDescripcion = (item: Item) => {
    const max = 100;
    if (item.descripcion.length <= max || descripcionExpandida === item._id) {
      return item.descripcion;
    } else {
      return item.descripcion.slice(0, max) + "...";
    }
  };

  const toggleDescripcion = (id: string) => {
    setDescripcionExpandida((prev) => (prev === id ? null : id));
  };

  const renderItems = (categoria: "comida" | "bebida") =>
    items
      .filter((item) => item.categoria === categoria)
      .map((item) => (
        <motion.div
          key={item._id}
          layout
          className="border rounded-xl p-4 shadow hover:shadow-md transition-all space-y-2"
        >
          {item.imagenUrl && (
            <img
              src={item.imagenUrl}
              alt={item.nombre}
              className="w-full h-48 object-cover rounded-md"
            />
          )}
          <h3 className="text-lg font-bold">{item.nombre}</h3>
          <p className="text-sm text-gray-600">{mostrarDescripcion(item)}</p>
          {item.descripcion.length > 100 && (
            <Button
              variant="ghost"
              className="text-xs px-2"
              onClick={() => toggleDescripcion(item._id)}
            >
              {descripcionExpandida === item._id ? "Ver menos" : "Ver más"}
            </Button>
          )}
          <p className="text-right font-medium text-base">${item.precio}</p>
        </motion.div>
      ));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <section>
        <h2 className="text-2xl font-bold mb-4">Comidas</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>{renderItems("comida")}</AnimatePresence>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Bebidas</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>{renderItems("bebida")}</AnimatePresence>
        </div>
      </section>
    </div>
  );
}

export default MenuPage;
