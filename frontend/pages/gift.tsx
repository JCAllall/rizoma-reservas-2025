import { useState, FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import { ArrowLeft, Gift } from "lucide-react";

const WHATSAPP_NUMBER = "5493416007875"; // ← reemplazá con tu número

export default function GiftCard() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    monto: "",
    mensaje: "",
  });
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Number(form.monto) <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }
    setCargando(true);
    try {
      // Enviar por WhatsApp directamente
      const mensaje =
        `🎁 *Solicitud de Gift Card - Rizoma*\n\n` +
        `👤 Nombre: ${form.nombre}\n` +
        `✉️ Email: ${form.email}\n` +
        `💰 Monto: $${Number(form.monto).toLocaleString("es-AR")}\n` +
        `💬 Mensaje: ${form.mensaje || "—"}`;

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
        "_blank"
      );
      setEnviado(true);
    } catch (err) {
      toast.error("Error al procesar la solicitud");
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
          <Gift size={64} className="text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">¡Solicitud enviada!</h2>
          <p className="text-zinc-400 text-sm">
            Te redirigimos a WhatsApp para coordinar tu Gift Card. Nos ponemos
            en contacto a la brevedad.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setEnviado(false);
                setForm({ nombre: "", email: "", monto: "", mensaje: "" });
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-700 transition px-4 py-3 rounded-2xl text-white font-semibold"
            >
              Solicitar otra Gift Card
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
            <h1 className="text-2xl font-bold">Gift Card</h1>
            <p className="text-zinc-400 text-sm">Regalá una experiencia</p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-zinc-900 rounded-2xl p-5 space-y-3 border border-zinc-800">
          <Gift size={32} className="text-green-500" />
          <p className="font-semibold text-lg">¿Cómo funciona?</p>
          <ul className="text-zinc-400 text-sm space-y-2">
            <li>🎁 Completá el formulario con el monto que querés regalar</li>
            <li>📱 Te contactamos por WhatsApp para coordinar el pago</li>
            <li>✉️ Enviamos la Gift Card al email del destinatario</li>
            <li>🍷 Se puede usar en cualquier visita a Rizoma</li>
          </ul>
        </div>

        {/* Formulario */}
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
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold">
              $
            </span>
            <input
              name="monto"
              type="number"
              placeholder="Monto"
              value={form.monto}
              onChange={handleChange}
              min={1}
              className={`${inputClass} pl-8`}
              required
            />
          </div>
          <textarea
            name="mensaje"
            placeholder="Mensaje para el destinatario (opcional)"
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
            {cargando ? "Procesando..." : "Solicitar Gift Card 🎁"}
          </button>
        </form>
      </div>
    </div>
  );
}