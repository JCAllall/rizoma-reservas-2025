"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "../components/Button";

type Props = {
  itemInicial?: any;
  onClose: () => void;
};

export default function CartaItemForm({ itemInicial, onClose }: Props) {
  const [form, setForm] = useState({
    nombre: itemInicial?.nombre || "",
    descripcion: itemInicial?.descripcion || "",
    precio: itemInicial?.precio || 0,
    imagenUrl: itemInicial?.imagenUrl || "",
    categoria: itemInicial?.categoria || "comida",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemInicial?._id) {
      await axios.put(`/api/carta/${itemInicial._id}`, form);
    } else {
      await axios.post("/api/carta", form);
    }
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-xl p-6 shadow mb-6 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Precio</label>
        <input
          type="number"
          name="precio"
          value={form.precio}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const data = new FormData();
            data.append("file", file);
            data.append("upload_preset", "rizoma-carta"); // ← tu upload preset

            const res = await fetch(
              "https://api.cloudinary.com/v1_1/dg58w0rny/image/upload",
              {
                method: "POST",
                body: data,
              }
            );

            const json = await res.json();
            setForm({ ...form, imagenUrl: json.secure_url });
          }}
          className="w-full border p-2 rounded"
        />
        {form.imagenUrl && (
          <img
            src={form.imagenUrl}
            alt="Vista previa"
            className="mt-2 h-32 object-cover rounded border"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Categoría</label>
        <select
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="comida">Comida</option>
          <option value="bebida">Bebida</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">{itemInicial ? "Actualizar" : "Crear"}</Button>
      </div>
    </form>
  );
}
