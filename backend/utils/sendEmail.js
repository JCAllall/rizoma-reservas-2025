const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const sendEmail = async ({ to, subject, text, html }) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    sender: { name: "Rizoma Bar & Resto", email: "allalijuancruz@gmail.com" },
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html,
  };

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = sendEmail;