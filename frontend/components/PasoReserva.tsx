import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const PASOS = ["Sector y Fecha", "Horario", "Personas", "Datos", "Confirmar"];
const HORARIOS = ["19:30", "20:00", "20:30", "21:00", "21:30", "21:45"];
const LIMITE_HORARIO = 12;

interface FormReserva {
  fecha: string;
  sector: "Patio" | "Esquina";
  hora: string;
  personas: number;
  nombre: string;
  email: string;
  telefono: string;
  comentario: string;
}

const FORM_INICIAL: FormReserva = {
  fecha: "",
  sector: "Patio",
  hora: "",
  personas: 1,
  nombre: "",
  email: "",
  telefono: "",
  comentario: "",
};

export default function PasoReserva() {
  const [paso, setPaso] = useState(0);
  const [form, setForm] = useState<FormReserva>(FORM_INICIAL);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const obtenerHorarios = async () => {
      if (!form.fecha || !form.sector) return;
      setLoadingHorarios(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/capacidad-horaria?fecha=${form.fecha}&sector=${form.sector}`
        );
        const data = await res.json();
        const validos = HORARIOS.filter(
          (h) => (data.personasPorHorario?.[h] || 0) < LIMITE_HORARIO
        );
        setHorariosDisponibles(validos);
      } catch {
        toast.error("Error al cargar horarios");
      } finally {
        setLoadingHorarios(false);
      }
    };
    obtenerHorarios();
  }, [form.fecha, form.sector]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "personas" ? Number(value) : value,
    }));
  };

  const avanzarPaso = () => setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  const retrocederPaso = () => setPaso((p) => Math.max(p - 1, 0));

  const validarPasoActual = () => {
    switch (paso) {
      case 0: return !!form.fecha && !!form.sector;
      case 1: return !!form.hora;
      case 2: return form.personas > 0 && form.personas <= 8;
      case 3: return (
        form.nombre.trim() !== "" &&
        /\S+@\S+\.\S+/.test(form.email) &&
        form.telefono.trim() !== ""
      );
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setCargando(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la reserva");
      toast.success("¡Reserva creada con éxito!");
      setReservaConfirmada(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  };

  const inputClass = "w-full p-3 rounded-xl bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500";

  if (reservaConfirmada) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-zinc-800 rounded-2xl shadow-xl text-center space-y-4">
        <h2 className="text-2xl font-semibold text-green-500">¡Reserva confirmada!</h2>
        <p className="text-zinc-300">
          Gracias, <strong>{form.nombre}</strong>. Tu reserva fue realizada con éxito.
        </p>
        <div className="bg-zinc-700 p-4 rounded-xl text-sm text-left space-y-2 text-zinc-200">
          <p><strong>📅 Fecha:</strong> {form.fecha}</p>
          <p><strong>📍 Sector:</strong> {form.sector}</p>
          <p><strong>⏰ Horario:</strong> {form.hora}</p>
          <p><strong>👥 Personas:</strong> {form.personas}</p>
          <p><strong>✉️ Email:</strong> {form.email}</p>
          <p><strong>📱 Teléfono:</strong> {form.telefono}</p>
          {form.comentario && (
            <p><strong>💬 Comentario:</strong> {form.comentario}</p>
          )}
        </div>
        <button
          onClick={() => {
            setForm(FORM_INICIAL);
            setPaso(0);
            setReservaConfirmada(false);
          }}
          className="mt-4 bg-green-600 hover:bg-green-700 transition text-white px-6 py-2 rounded-xl font-semibold"
        >
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-zinc-800 rounded-2xl shadow-xl">

      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="w-full bg-zinc-700 h-2 rounded-full">
          <motion.div
            className="bg-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((paso + 1) / PASOS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-center text-sm mt-2 text-zinc-400">
          Paso {paso + 1} de {PASOS.length}: {PASOS[paso]}
        </p>
      </div>

      {/* Contenido por paso */}
      <div className="space-y-4">

        {paso === 0 && (
          <>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              className={inputClass}
            />
            <select
              name="sector"
              value={form.sector}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Patio">Patio</option>
              <option value="Esquina">Esquina</option>
            </select>
          </>
        )}

        {paso === 1 && (
          <>
            <p className="text-sm text-zinc-400">Seleccioná un horario</p>
            {loadingHorarios ? (
              <p className="text-sm text-zinc-400">Cargando horarios...</p>
            ) : horariosDisponibles.length === 0 ? (
              <p className="text-sm text-red-400">No hay horarios disponibles</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {HORARIOS.map((h) => {
                  const disponible = horariosDisponibles.includes(h);
                  const seleccionado = form.hora === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={!disponible}
                      onClick={() => setForm((prev) => ({ ...prev, hora: h }))}
                      className={`px-3 py-2 rounded-xl text-sm text-center transition
                        ${seleccionado ? "bg-green-600 text-white" : ""}
                        ${!disponible
                          ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                          : !seleccionado ? "bg-zinc-700 hover:bg-zinc-600 text-white" : ""
                        }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {paso === 2 && (
          <input
            type="number"
            name="personas"
            value={form.personas}
            onChange={handleChange}
            min={1}
            max={8}
            className={inputClass}
          />
        )}

        {paso === 3 && (
          <>
            <input
              type="text"
              name="nombre"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="email"
              name="email"
              placeholder="Tu email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="tel"
              name="telefono"
              placeholder="Tu teléfono"
              value={form.telefono}
              onChange={handleChange}
              className={inputClass}
            />
            <textarea
              name="comentario"
              placeholder="Comentario o nota (opcional)"
              value={form.comentario}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </>
        )}

        {paso === 4 && (
          <div className="space-y-4 text-sm text-zinc-200">
            <h2 className="text-lg font-semibold text-center">Revisá tu reserva</h2>
            <div className="bg-zinc-700 p-4 rounded-xl space-y-2">
              <p><strong>📅 Fecha:</strong> {form.fecha}</p>
              <p><strong>📍 Sector:</strong> {form.sector}</p>
              <p><strong>⏰ Horario:</strong> {form.hora}</p>
              <p><strong>👥 Personas:</strong> {form.personas}</p>
              <p><strong>🙋 Nombre:</strong> {form.nombre}</p>
              <p><strong>✉️ Email:</strong> {form.email}</p>
              <p><strong>📱 Teléfono:</strong> {form.telefono}</p>
              {form.comentario && (
                <p><strong>💬 Comentario:</strong> {form.comentario}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <button
                type="button"
                onClick={retrocederPaso}
                className="border border-zinc-600 px-4 py-2 rounded-xl hover:bg-zinc-700 transition text-white"
              >
                Modificar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={cargando}
                className="bg-green-600 hover:bg-green-700 transition text-white px-6 py-2 rounded-xl font-semibold disabled:opacity-50"
              >
                {cargando ? "Confirmando..." : "Confirmar reserva"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navegación */}
      {paso < PASOS.length - 1 && (
        <div className="flex justify-between mt-6">
          {paso > 0 ? (
            <button
              type="button"
              onClick={retrocederPaso}
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              ← Atrás
            </button>
          ) : <div />}
          <button
            type="button"
            onClick={avanzarPaso}
            disabled={!validarPasoActual()}
            className="ml-auto px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}