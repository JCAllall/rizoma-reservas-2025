// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Rizoma" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`📩 Email enviado a ${to}`);
  } catch (error) {
    console.error("❌ Error al enviar el email:", error.message);
  }
};
module.exports = async (to, subject, message) => {
  console.log(
    `📧 Enviando mail a ${to} con asunto "${subject}" y mensaje: ${message}`
  );
  // En producción, usar nodemailer u otro servicio real
};
module.exports = sendEmail;
