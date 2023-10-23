import TelegramBot from 'node-telegram-bot-api';

import { db } from './db/index.js';

const token = process.env.P2P_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  console.log(msg);

  if (messageText.toLowerCase().includes('getchatid')) {
    bot.sendMessage(chatId, chatId);
  }

  if (messageText.toLowerCase().includes('addchat')) {
    const telegramUserId = msg.from.id.toString();
    const isAdmin = await db?.collection('users')?.findOne({ telegramId: telegramUserId, isAdmin: true }).catch(() => false);
    if (!isAdmin) {
      bot.sendMessage(chatId, 'you are not admin');
      return;
    }

    const isSuccess = await db?.collection('chats')?.insertOne({ chatId }).catch(() => false);

    if (!isSuccess) {
      bot.sendMessage(chatId, 'error adding chat to whitelist');
      return;
    }

  }

  if (messageText.toLowerCase() === 'start') {
    const isChatInWhitelist = await db?.collection('chats')?.findOne({ chatId }).catch(() => false);
    if (!isChatInWhitelist) {
      bot.sendMessage(chatId, 'chat is not in a whitelist');
      return;
    }
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
