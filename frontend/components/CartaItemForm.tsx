import { useState } from "react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

type ItemInicial = {
  _id?: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  imagenUrl?: string;
  categoria?: "comida" | "bebida" | "postre" | "coctel" | "vino";
  disponible?: boolean;
};

type Props = {
  itemInicial?: ItemInicial | null;
  onClose: () => void;
};

export default function CartaItemForm({ itemInicial, onClose }: Props) {
  const [form, setForm] = useState({
    nombre: itemInicial?.nombre || "",
    descripcion: itemInicial?.descripcion || "",
    precio: itemInicial?.precio || 0,
    imagenUrl: itemInicial?.imagenUrl || "",
    categoria: itemInicial?.categoria || "comida",
    disponible: itemInicial?.disponible ?? true,
  });
  const [subiendo, setSubiendo] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  const handleImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendo(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );

      const json = await res.json();
      if (!json.secure_url) throw new Error("Error al subir imagen");
      setForm((prev) => ({ ...prev, imagenUrl: json.secure_url }));
      toast.success("Imagen subida correctamente");
    } catch {
      toast.error("Error al subir la imagen");
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error("No autorizado");

    setCargando(true);
    try {
      if (itemInicial?._id) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/carta/${itemInicial._id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Ítem actualizado");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/carta`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Ítem creado");
      }
      onClose();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Error al guardar el ítem");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-800 rounded-xl p-6 mb-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-white">
        {itemInicial?._id ? "Editar ítem" : "Nuevo ítem"}
      </h2>

      <div className="space-y-1">
        <label className="block text-sm text-zinc-400">Nombre</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full bg-zinc-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-zinc-400">Descripción</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          rows={3}
          className="w-full bg-zinc-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500 resize-none"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-zinc-400">Precio</label>
        <input
          type="number"
          name="precio"
          value={form.precio}
          onChange={handleChange}
          min={0}
          className="w-full bg-zinc-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-zinc-400">Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImagen}
          disabled={subiendo}
          className="w-full bg-zinc-700 text-white p-3 rounded-xl outline-none"
        />
        {subiendo && <p className="text-sm text-zinc-400">Subiendo imagen...</p>}
        {form.imagenUrl && (
          <img
            src={form.imagenUrl}
            alt="Vista previa"
            className="mt-2 h-32 object-cover rounded-xl"
          />
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-zinc-400">Categoría</label>
        <select
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          className="w-full bg-zinc-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="comida">Comida</option>
          <option value="bebida">Bebida</option>
          <option value="postre">Postre</option>
          <option value="coctel">Cóctel</option>
          <option value="vino">Vino</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="disponible"
          id="disponible"
          checked={form.disponible}
          onChange={handleChange}
          className="w-4 h-4 accent-green-500"
        />
        <label htmlFor="disponible" className="text-sm text-zinc-400">
          Disponible
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 transition text-white text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={cargando || subiendo}
          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition text-white text-sm font-semibold disabled:opacity-50"
        >
          {cargando ? "Guardando..." : itemInicial?._id ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}