// frontend/pages/login.tsx
import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      setMensaje("Login exitoso ✅");
      console.log("TOKEN:", res.data.token);
      // Podés guardar el token en localStorage si querés
    } catch (err: any) {
      console.error("Error al loguear:", err);
      setMensaje(err.response?.data?.message || "Error al loguear");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: 300,
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          required
        />
        <button type="submit">Ingresar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default LoginPage;
