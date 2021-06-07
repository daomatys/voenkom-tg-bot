const tgBot = require('node-telegram-bot-api'); 

const dotenv = require('dotenv').config();

const token = process.env.BOEHKOM_TOKEN;

const bot = new tgBot(token, {polling: true});


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


let regAnswers = [
  "ЦЫЦ, А ТО В АРМИЮ ЗАБЕРУ",
  "*DOOR INTENSIFIES*",
  "О, ЭТО ВЫ УДАЧНО ДОМОЙ ЗАШЛИ",
  "ОТКРЫВАЙ, ЭТО МАМА ПРИШЛА С ПРОДУКТАМИ",
  "НА ГОЛОС НЕ ОБРАЩАЙ ВНИМАНИЯ, ЭТО Я ПРОСТЫЛА"
];


bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, `— ${regAnswers[getRandomInt(regAnswers.length)]}!`);
});


