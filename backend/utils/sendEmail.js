const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Rizoma Reservas" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text,
    html, // 🆕 soporta HTML
  });
};

module.exports = sendEmail;
