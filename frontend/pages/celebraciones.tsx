import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, PartyPopper } from "lucide-react";
import toast from "react-hot-toast";

const WHATSAPP_NUMBER = "5493416007875"; // ← reemplazá con tu número

const TIPOS_CELEBRACION = [
  { valor: "cumpleaños", label: "🎂 Cumpleaños" },
  { valor: "aniversario", label: "💑 Aniversario" },
  { valor: "corporativo", label: "💼 Evento corporativo" },
  { valor: "otro", label: "✨ Otro" },
];

const SERVICIOS = [
  { icono: "🎂", titulo: "Torta personalizada", descripcion: "Coordinamos con pastelería de confianza" },
  { icono: "🥂", titulo: "Brindis de bienvenida", descripcion: "Copa de champagne para todos los invitados" },
  { icono: "🌸", titulo: "Decoración", descripcion: "Ambientamos la mesa para la ocasión" },
  { icono: "📸", titulo: "Sector reservado", descripcion: "Espacio privado para tu grupo" },
  { icono: "🎵", titulo: "Música especial", descripcion: "Playlist personalizada para el evento" },
];

export default function Celebraciones() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipo: "",
    fecha: "",
    personas: "",
    mensaje: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleChange = (
    e: React.ChangeEvent
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);

    try {
      const mensaje =
        `🎉 *Consulta de Celebración - Rizoma*\n\n` +
        `👤 Nombre: ${form.nombre}\n` +
        `✉️ Email: ${form.email}\n` +
        `📱 Teléfono: ${form.telefono}\n` +
        `🎊 Tipo: ${form.tipo}\n` +
        `📅 Fecha: ${form.fecha}\n` +
        `👥 Personas: ${form.personas}\n` +
        `💬 Mensaje: ${form.mensaje || "—"}`;

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
        "_blank"
      );
      setEnviado(true);
    } catch {
      toast.error("Error al enviar la consulta");
    } finally {
      setCargando(false);
    }
  };

  const inputClass =
    "w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500";

  if (enviado) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <PartyPopper size={64} className="text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">¡Consulta enviada!</h2>
          <p className="text-zinc-400 text-sm">
            Te redirigimos a WhatsApp para coordinar tu celebración. ¡Nos
            ponemos en contacto a la brevedad!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setEnviado(false);
                setForm({
                  nombre: "",
                  email: "",
                  telefono: "",
                  tipo: "",
                  fecha: "",
                  personas: "",
                  mensaje: "",
                });
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-700 transition px-4 py-3 rounded-2xl text-white font-semibold"
            >
              Hacer otra consulta
            </button>
            <Link
              href="/"
              className="block w-full bg-green-600 hover:bg-green-700 transition px-4 py-3 rounded-2xl text-white font-semibold text-center"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-sm mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Celebraciones</h1>
            <p className="text-zinc-400 text-sm">Momentos especiales en Rizoma</p>
          </div>
        </div>

        {/* Servicios */}
        <div className="space-y-3">
          <p className="font-semibold text-lg">¿Qué ofrecemos?</p>
          <div className="space-y-2">
            {SERVICIOS.map(({ icono, titulo, descripcion }) => (
              <div
                key={titulo}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3"
              >
                <span className="text-2xl">{icono}</span>
                <div>
                  <p className="font-semibold text-sm">{titulo}</p>
                  <p className="text-zinc-400 text-xs">{descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <p className="font-semibold text-lg">Consultanos</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="nombre"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Tu email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <input
              name="telefono"
              type="tel"
              placeholder="Tu teléfono"
              value={form.telefono}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="" disabled>
                Tipo de celebración
              </option>
              {TIPOS_CELEBRACION.map(({ valor, label }) => (
                <option key={valor} value={valor}>
                  {label}
                </option>
              ))}
            </select>
            <input
              name="fecha"
              type="date"
              value={form.fecha}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <input
              name="personas"
              type="number"
              placeholder="Cantidad de personas"
              value={form.personas}
              onChange={handleChange}
              min={1}
              className={inputClass}
              required
            />
            <textarea
              name="mensaje"
              placeholder="Contanos más sobre tu celebración (opcional)"
              value={form.mensaje}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} resize-none`}
            />
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-green-600 hover:bg-green-700 transition p-3 rounded-2xl text-white font-semibold disabled:opacity-50"
            >
              {cargando ? "Enviando..." : "Consultar 🎉"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}