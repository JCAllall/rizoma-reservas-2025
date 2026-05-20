import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Link from "next/link";

const COMIDA = Array.from({ length: 5 }, (_, i) => ({
  src: `/carta/comida-0${i + 1}.jpg`,
  label: `Página ${i + 1}`,
}));

const BEBIDAS = Array.from({ length: 8 }, (_, i) => ({
  src: `/carta/bebidas-0${i + 1}.jpg`,
  label: `Página ${i + 1}`,
}));

type Tab = "comida" | "bebidas";

export default function Menu() {
  const [tab, setTab] = useState<Tab>("comida");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const items = tab === "comida" ? COMIDA : BEBIDAS;

  const switchTab = (t: Tab) => {
    if (t === tab) return;
    setTab(t);
    setIndex(0);
    setDirection(0);
  };

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) go(diff > 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const go = useCallback(
    (dir: 1 | -1) => {
      setDirection(dir);
      setIndex((prev) => (prev + dir + items.length) % items.length);
    },
    [items.length]
  );

  const goTo = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "60%" : "-60%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0 }),
  };

  return (
    <>
      <Head>
        <title>Carta — Rizoma Bar & Resto</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#0d0d0d] text-[#f0ebe0] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link
            href="/"
            className="text-sm tracking-widest uppercase text-[#c9b99a] hover:text-[#f0ebe0] transition-colors"
          >
            ← Volver
          </Link>
          <span
            className="text-xl tracking-[0.3em] uppercase font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Rizoma
          </span>
          <span className="text-sm text-[#c9b99a] tracking-widest uppercase">
            Carta
          </span>
        </header>

        {/* Tabs */}
        <div className="flex justify-center gap-0 mt-8">
          {(["comida", "bebidas"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`relative px-10 py-3 text-sm tracking-widest uppercase transition-all duration-300 ${
                tab === t
                  ? "text-[#f0ebe0]"
                  : "text-[#666] hover:text-[#999]"
              }`}
            >
              {t}
              {tab === t && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-[#c9b99a]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Carrusel */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {/* Contador */}
          <p className="text-xs tracking-widest text-[#555] uppercase mb-6">
            {index + 1} / {items.length}
          </p>

          {/* Imagen */}
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-sm"
            style={{ aspectRatio: "3/4" }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence custom={direction} mode="popLayout">
              <motion.img
                key={`${tab}-${index}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                src={items[index].src}
                alt={`${tab} ${items[index].label}`}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </AnimatePresence>

            {/* Botones laterales */}
            <button
              onClick={() => go(-1)}
              className="absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-start pl-4 group"
              aria-label="Anterior"
            >
              <span className="text-white/0 group-hover:text-white/60 transition-all duration-200 text-2xl select-none">
                ‹
              </span>
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-end pr-4 group"
              aria-label="Siguiente"
            >
              <span className="text-white/0 group-hover:text-white/60 transition-all duration-200 text-2xl select-none">
                ›
              </span>
            </button>
          </div>

          {/* Dots */}
          <div className="flex gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir a página ${i + 1}`}
                className="p-1"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    i === index
                      ? "bg-[#c9b99a] w-4 h-1"
                      : "bg-[#333] w-1 h-1 hover:bg-[#666]"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-[#333] tracking-widest uppercase border-t border-white/5">
          Rizoma Bar & Resto
        </footer>
      </div>
    </>
  );
}
