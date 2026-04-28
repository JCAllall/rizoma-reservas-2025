import Link from "next/link";
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
        src="/rizoma-logo.PNG"
        alt="Rizoma"
        className="w-28 h-auto opacity-90"
      />

      {/* Nombre y frase */}
      <h1 className="text-2xl font-bold mt-2">Rizoma</h1>
      <p className="text-sm text-gray-400 italic">* Momentos que conectan *</p>

      {/* Redes sociales */}
      <div className="flex gap-5 text-2xl mt-2">
        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          <Instagram />
        </a>
        <a href="https://rizoma.com.ar" target="_blank" rel="noreferrer">
          <Globe />
        </a>
      </div>

      {/* Botones principales */}
      <div className="flex flex-col gap-4 w-full max-w-sm mt-4">
        <Boton
          icono={<MapPin />}
          texto="¿Dónde estamos?"
          href="https://maps.google.com"
          externo
        />
        <Boton icono={<CalendarDays />} texto="Reservá" href="/nuevaReserva" />
        <Boton icono={<Gift />} texto="Gift Card" href="/gift" />
        <Boton icono={<ScrollText />} texto="Menú" href="/menu" />
        <Boton icono={<ClipboardList />} texto="Delivery" href="/delivery" />
      </div>

      {/* Contacto */}
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
  externo = false,
}: {
  icono?: React.ReactNode;
  texto: string;
  href: string;
  externo?: boolean;
}) {
  const clase =
    "flex items-center gap-3 w-full justify-center bg-zinc-800 hover:bg-zinc-700 transition p-4 rounded-2xl text-white text-base font-medium shadow";

  if (externo) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={clase}>
        {icono && <span className="text-xl">{icono}</span>}
        {texto}
      </a>
    );
  }

  return (
    <Link href={href} className={clase}>
      {icono && <span className="text-xl">{icono}</span>}
      {texto}
    </Link>
  );
}