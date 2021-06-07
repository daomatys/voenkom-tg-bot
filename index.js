const tgBot = require('node-telegram-bot-api'); 

const dotenv = require('dotenv').config();

const token = process.env.BOEHKOM_TOKEN;

const bot = new tgBot(token, {polling: true});


bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'НУ ЗДАРОВА, СЫНОК, ВОТ ПОВИСТКА!');
});