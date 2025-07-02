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

module.exports = sendEmail;
