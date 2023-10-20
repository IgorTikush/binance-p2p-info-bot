const TelegramBot = require('node-telegram-bot-api');
const https = require('https');

const token = process.env.P2P_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText.toLowerCase() === 'start') {
    const p2pInfo = await getP2PData().catch(() => 'error');
    bot.sendMessage(chatId, p2pInfo);
  }
})

const getP2PData = () => {
  return new Promise((resolve, reject) => {
    const baseObj = {
      page: 1,
      rows: 3,
      publisherType: null,
      asset: 'USDT',
      tradeType: "BUY",
      fiat: "UAH",
      payTypes: ['Monobank', 'PrivatBank', 'ABank', 'PUMBBank', 'izibank', 'Sportbank'],
    };

    const stringData = JSON.stringify(baseObj);

    const options = {
      hostname: "p2p.binance.com",
      port: 443,
      path: "/bapi/c2c/v2/friendly/c2c/adv/search",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": stringData.length,
      },
    };
    // console.log(https)
    const req = https.request(options, (res) => {
      let output = "";
      res.on("data", (d) => {
        output += d;
      });

      res.on('end', () => {
        try {
          const jsonOuput = JSON.parse(output);
          resolve(jsonOuput.data[0].adv.price);
          // console.log(jsonOuput);
          // resolve(jsonOuput);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(stringData);
    req.end();
  });
}
