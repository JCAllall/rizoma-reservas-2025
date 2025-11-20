// pages/reservas.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import PasoReserva from "../components/PasoReserva";
// Definimos el tipo de datos esperados para una reserva
interface Reserva {
  _id: string;
  nombre: string;
  email: string;
  fecha: string;
  hora: string;
  personas: number;
  sector: string;
  listaEspera: boolean;
}

export default function ListaReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const res = await axios.get<Reserva[]>(
          "http://localhost:5000/api/reservas"
        );
        setReservas(res.data);
      } catch (err) {
        console.error("Error al obtener reservas:", err);
        setError("No se pudieron cargar las reservas");
      }
    };

    fetchReservas();
  }, []);

  export default function PageReserva() {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <PasoReserva />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Lista de Reservas</h2>
      {error && <p>{error}</p>}
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Personas</th>
            <th>Sector</th>
            <th>Lista de Espera</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva._id}>
              <td>{reserva.nombre}</td>
              <td>{reserva.email}</td>
              <td>{new Date(reserva.fecha).toLocaleDateString()}</td>
              <td>{reserva.hora}</td>
              <td>{reserva.personas}</td>
              <td>{reserva.sector}</td>
              <td>{reserva.listaEspera ? "Sí" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
