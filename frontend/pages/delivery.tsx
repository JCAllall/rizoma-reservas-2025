import Link from "next/link";
import { ArrowLeft, MapPin, Clock, ExternalLink } from "lucide-react";

const PEDIDOS_YA_URL = "https://www.pedidosya.com.ar/restaurantes/rosario/rizoma";

const ZONA_COBERTURA = ["Centro", "Pichincha", "Echesortu", "Refinería", "República de la Sexta"];

const HORARIOS = [
  { dia: "Martes a Jueves", hora: "20:00 a 23:00" },
  { dia: "Viernes y Sábado", hora: "20:00 a 00:00" },
  { dia: "Domingo", hora: "20:00 a 23:00" },
];

export default function Delivery() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-sm mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Delivery</h1>
            <p className="text-zinc-400 text-sm">Rizoma en tu casa</p>
          </div>
        </div>
        <a href={PEDIDOS_YA_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full bg-[#FA0050] hover:bg-[#d4003f] transition p-5 rounded-2xl text-white font-semibold text-lg">
          <div className="flex items-center gap-3">
            <img src="https://logodownload.org/wp-content/uploads/2019/07/pedidos-ya-logo.png" alt="PedidosYa" className="w-8 h-8 object-contain rounded" />
            Pedir por PedidosYa
          </div>
          <ExternalLink size={20} />
        </a>
        <div className="bg-zinc-900 rounded-2xl p-5 space-y-3 border border-zinc-800">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-green-500" />
            <p className="font-semibold">Horarios de delivery</p>
          </div>
          <div className="space-y-2">
            {HORARIOS.map(({ dia, hora }) => (
              <div key={dia} className="flex justify-between text-sm">
                <span className="text-zinc-400">{dia}</span>
                <span className="text-white font-medium">{hora}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 pt-1">* Los lunes no hay delivery</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-5 space-y-3 border border-zinc-800">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-green-500" />
            <p className="font-semibold">Zona de cobertura</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ZONA_COBERTURA.map((barrio) => (
              <span key={barrio} className="bg-zinc-800 text-zinc-300 text-sm px-3 py-1 rounded-full">{barrio}</span>
            ))}
          </div>
          <p className="text-xs text-zinc-500">¿No encontrás tu barrio? Consultanos por WhatsApp.</p>
        </div>
        <Link href="/" className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 transition px-4 py-3 rounded-2xl text-white font-semibold">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}