const nodemailer = require("nodemailer");

// Se crea una sola vez al iniciar el servidor
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"Rizoma Reservas" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;