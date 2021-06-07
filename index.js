//requires
const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
//init
const token = process.env.BOEHKOM_TOKEN;
const bot = new tgBot(token, {polling: true});
//misc
const getRandomInt = max => Math.floor( Math.random() * Math.floor(max) );


let regAnswers = [
  "— ОТКРОЙТЕ, А ТО В АРМИЮ ЗАБЕРУ!",
  "*DOOR INTENSIFIES*",
  "— О, ЭТО ВЫ УДАЧНО ДОМОЙ ЗАШЛИ!",
  "— СЫНОЧКА, ОТКРЫВАЙ, ЭТО МАМА ПРИШЛА С ПРОДУКТАМИ!",
  "— НА ГОЛОС НЕ ОБРАЩАЙ ВНИМАНИЯ, ЭТО Я ПРОСТЫЛА!",
  "— ДА ОТКРЫВАЙТЕ УЖЕ, ТАМ КОРМЯТ ТРИ РАЗА В ДЕНЬ, А ДНЕМ — СОНЧАС!"
];

//bot.on('message', msg => bot.sendMessage( msg.chat.id, regAnswers[getRandomInt(regAnswers.length)] ) );

bot.onText(/\/aaaaa/, msg => bot.sendMessage(msg.chat.id, 'RABOTAET, EPTA!'));
