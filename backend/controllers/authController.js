// backend/controllers/authController.js
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verifica si ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "El usuario ya existe" });

    // Encripta la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Guarda el usuario
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Envía el email
    await sendEmail(
      email,
      "Bienvenido a Rizoma 🍸",
      `Hola ${name}, tu cuenta fue creada con éxito.`
    );

    // Crea el token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ message: "Usuario creado", token });
  } catch (err) {
    console.error("Error al registrar:", err.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = { register };

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Usuario o contraseña incorrectos" });

    // Comparar contraseña ingresada vs encriptada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Usuario o contraseña incorrectos" });

    // Crear token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login exitoso",
      token,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Error al loguear:", err.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = { register, login };
