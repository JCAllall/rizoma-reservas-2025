"use client";
import {
  Instagram,
  Globe,
  MapPin,
  CalendarDays,
  Gift,
  ScrollText,
  ClipboardList,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-10 space-y-6">
      {/* Logo */}
      <img
        src="/rizoma-app/public/rizoma-logo.PNG"
        alt="Rizoma"
        className="w-28 h-auto opacity-90"
      />

      {/* Nombre y frase */}
      <h1 className="text-2xl font-bold mt-2">Rizoma</h1>
      <p className="text-sm text-gray-400 italic">* Momentos que conectan *</p>

      {/* Redes sociales */}
      <div className="flex gap-5 text-2xl mt-2">
        <a href="https://instagram.com" target="_blank">
          <Instagram />
        </a>
        <a href="https://rizoma.com.ar" target="_blank">
          <Globe />
        </a>
      </div>

      {/* Botones principales */}
      <div className="flex flex-col gap-4 w-full max-w-sm mt-4">
        <Boton
          icono={<MapPin />}
          texto="¿Dónde estamos?"
          href="https://maps.google.com"
        />
        <Boton icono={<CalendarDays />} texto="Reservá" href="/nuevaReserva" />
        <Boton icono={<Gift />} texto="Gift Card" href="/gift" />
        <Boton icono={<ScrollText />} texto="Menú" href="/menu" />
        <Boton icono={<ClipboardList />} texto="Delivery" href="/delivery" />
      </div>

      {/* Sección final */}
      <div className="mt-10 w-full max-w-sm text-center space-y-2">
        <p className="font-semibold text-lg">Contactanos</p>
        <Boton texto="Celebraciones" href="/celebraciones" />
      </div>
    </div>
  );
}

function Boton({
  icono,
  texto,
  href,
}: {
  icono?: React.ReactNode;
  texto: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 w-full justify-center bg-zinc-800 hover:bg-zinc-700 transition p-4 rounded-2xl text-white text-base font-medium shadow"
    >
      {icono && <span className="text-xl">{icono}</span>}
      {texto}
    </a>
  );
}
