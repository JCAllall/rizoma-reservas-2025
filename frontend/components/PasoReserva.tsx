"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const pasos = ["Sector y Fecha", "Horario", "Personas", "Datos", "Confirmar"];

export default function PasoReserva() {
  const [paso, setPaso] = useState(0);
  const [form, setForm] = useState({
    fecha: "",
    sector: "Patio",
    hora: "",
    personas: 1,
    nombre: "",
    email: "",
  });

  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);

  useEffect(() => {
    const obtenerHorarios = async () => {
      if (!form.fecha || !form.sector) return;

      setLoadingHorarios(true);

      try {
        const res = await fetch(
          `/api/reservas/obtenerCapacidadHorariaYDiaria?fecha=${form.fecha}&sector=${form.sector}`
        );
        const data = await res.json();

        const todosLosHorarios = [
          "19:30",
          "20:00",
          "20:30",
          "21:00",
          "21:30",
          "21:45",
        ];
        const horariosValidos = todosLosHorarios.filter(
          (h) => (data.personasPorHorario?.[h] || 0) < 12
        );

        setHorariosDisponibles(horariosValidos);
      } catch (err) {
        toast.error("Error al cargar horarios");
      } finally {
        setLoadingHorarios(false);
      }
    };

    obtenerHorarios();
  }, [form.fecha, form.sector]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const avanzarPaso = () => {
    if (paso < pasos.length - 1) {
      setPaso(paso + 1);
    }
  };

  const retrocederPaso = () => {
    if (paso > 0) {
      setPaso(paso - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error");

      toast.success("Reserva creada con éxito");
      setReservaConfirmada(true);
      // paso final
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const validarPasoActual = () => {
    switch (paso) {
      case 0:
        return form.fecha && form.sector;
      case 1:
        return form.hora;
      case 2:
        return form.personas > 0;
      case 3:
        return form.nombre.trim() !== "" && /\S+@\S+\.\S+/.test(form.email);
      default:
        return true;
    }
  };

  if (reservaConfirmada) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl text-center space-y-4">
        <h2 className="text-2xl font-semibold text-green-600">
          ¡Reserva confirmada!
        </h2>
        <p className="text-neutral-700 dark:text-neutral-200">
          Gracias, <strong>{form.nombre}</strong>. Tu reserva fue realizada con
          éxito.
        </p>

        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl text-sm text-left space-y-2">
          <p>
            <strong>📅 Fecha:</strong> {form.fecha}
          </p>
          <p>
            <strong>📍 Sector:</strong> {form.sector}
          </p>
          <p>
            <strong>⏰ Horario:</strong> {form.hora}
          </p>
          <p>
            <strong>👥 Personas:</strong> {form.personas}
          </p>
          <p>
            <strong>✉️ Email:</strong> {form.email}
          </p>
        </div>

        <button
          onClick={() => {
            // Reiniciar formulario para nueva reserva
            setForm({
              fecha: "",
              sector: "Patio",
              hora: "",
              personas: 1,
              nombre: "",
              email: "",
            });
            setPaso(0);
            setReservaConfirmada(false);
          }}
          className="mt-4 bg-black text-white px-6 py-2 rounded hover:bg-neutral-800"
        >
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl">
      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="w-full bg-neutral-300 h-2 rounded-full">
          <motion.div
            className="bg-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((paso + 1) / pasos.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-center text-sm mt-2 text-neutral-500">
          Paso {paso + 1} de {pasos.length}: {pasos[paso] || "Completado"}
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
              className="w-full p-2 rounded border"
            />
            <select
              name="sector"
              value={form.sector}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            >
              <option value="Patio">Patio</option>
              <option value="Esquina">Esquina</option>
            </select>
          </>
        )}

        {paso === 1 && (
          <>
            <p className="text-sm mb-2 text-neutral-500">
              Seleccioná un horario
            </p>

            {loadingHorarios ? (
              <p className="text-sm text-neutral-400">
                Cargando horarios disponibles...
              </p>
            ) : horariosDisponibles.length === 0 ? (
              <p className="text-sm text-red-400">
                No hay horarios disponibles
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {["19:30", "20:00", "20:30", "21:00", "21:30", "21:45"].map(
                  (h) => {
                    const disponible = horariosDisponibles.includes(h);
                    const seleccionado = form.hora === h;

                    return (
                      <button
                        key={h}
                        disabled={!disponible}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            hora: h,
                          }))
                        }
                        className={`
                px-3 py-2 rounded text-sm text-center border
                ${seleccionado ? "bg-green-600 text-white" : ""}
                ${
                  !disponible
                    ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                    : "hover:bg-neutral-800 hover:text-white"
                }
              `}
                      >
                        {h}
                      </button>
                    );
                  }
                )}
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
            className="w-full p-2 rounded border"
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
              className="w-full p-2 rounded border"
            />
            <input
              type="email"
              name="email"
              placeholder="Tu email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            />
          </>
        )}

        {paso === 4 && (
          <div className="space-y-4 text-sm text-neutral-800 dark:text-neutral-200">
            <h2 className="text-lg font-semibold text-center">
              Revisá tu reserva
            </h2>

            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl shadow-inner space-y-2">
              <p>
                <strong>📅 Fecha:</strong> {form.fecha}
              </p>
              <p>
                <strong>📍 Sector:</strong> {form.sector}
              </p>
              <p>
                <strong>⏰ Horario:</strong> {form.hora}
              </p>
              <p>
                <strong>👥 Personas:</strong> {form.personas}
              </p>
              <p>
                <strong>🙋‍♂️ Nombre:</strong> {form.nombre}
              </p>
              <p>
                <strong>✉️ Email:</strong> {form.email}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <button
                onClick={retrocederPaso}
                className="border px-4 py-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                Modificar
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
              >
                Confirmar reserva
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Navegación */}
      <div className="flex justify-between mt-6">
        {paso > 0 && (
          <button onClick={retrocederPaso} className="text-sm text-neutral-500">
            ← Atrás
          </button>
        )}
        {paso < pasos.length - 1 && (
          <button
            onClick={avanzarPaso}
            disabled={!validarPasoActual()}
            className={`
      ml-auto px-4 py-1 rounded
      ${
        validarPasoActual()
          ? "bg-black text-white hover:bg-neutral-800"
          : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
      }
    `}
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
