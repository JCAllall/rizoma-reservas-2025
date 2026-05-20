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
    <div className="min-h-screen flex flex-col items-center px-6 py-10 space-y-6"
      style={{ background: "#f5f0e8" }}>

      {/* Logo */}
      <img
  src="/rizoma-logo.jpeg"
  alt="Rizoma"
  className="w-28 h-auto"
  style={{ mixBlendMode: "multiply" }}
/>

      {/* Nombre y frase */}
      <h1
  className="text-2xl font-bold mt-2 tracking-widest text-[#2a1f0a]"
  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: "0.3em" }}
>
  RIZOMA
</h1>
      <p className="text-sm italic text-[#7a6040]">* Momentos que conectan *</p>

      {/* Redes sociales */}
      <div className="flex gap-5 text-2xl mt-2 text-[#5a3e1b]">
        <a href="https://instagram.com" target="_blank" rel="noreferrer"
          className="hover:text-[#2a1f0a] transition-colors">
          <Instagram />
        </a>
        <a href="https://rizoma.com.ar" target="_blank" rel="noreferrer"
          className="hover:text-[#2a1f0a] transition-colors">
          <Globe />
        </a>
      </div>

      {/* Botones principales */}
      <div className="flex flex-col gap-4 w-full max-w-sm mt-4">
        <Boton icono={<MapPin />}       texto="¿Dónde estamos?" href="https://maps.google.com" externo />
        <Boton icono={<CalendarDays />} texto="Reservá"         href="/nuevaReserva" />
        <Boton icono={<Gift />}         texto="Gift Card"        href="/gift" />
        <Boton icono={<ScrollText />}   texto="Menú"             href="/menu" />
        <Boton icono={<ClipboardList />}texto="Delivery"         href="/delivery" />
      </div>

      {/* Contacto */}
      <div className="mt-10 w-full max-w-sm text-center space-y-2">
        <p className="font-semibold text-lg text-[#2a1f0a]"
          style={{ fontFamily: "Georgia, serif" }}>
          Contactanos
        </p>
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
    "flex items-center gap-3 w-full justify-center border border-[#c4a882] hover:bg-[#ede5d6] transition p-4 rounded-2xl text-[#2a1f0a] text-base font-medium"
    + " " + "bg-[#eee8dc]";

  if (externo) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={clase}>
        {icono && <span className="text-xl text-[#7a6040]">{icono}</span>}
        {texto}
      </a>
    );
  }

  return (
    <Link href={href} className={clase}>
      {icono && <span className="text-xl text-[#7a6040]">{icono}</span>}
      {texto}
    </Link>
  );
}
