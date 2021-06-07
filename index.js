//requires
const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
//init
const token = process.env.BOEHKOM_TOKEN;
const bot = new tgBot(token, {polling: true});
//misc
const getRandomInt = max => Math.floor( Math.random() * Math.floor(max) );


let otchislenList = []

let regAnswers = [
  "— ОТКРОЙТЕ, А ТО В АРМИЮ ЗАБЕРУ!",
  "*DOOR INTENSIFIES*",
  "— О, ЭТО ВЫ УДАЧНО ДОМОЙ ЗАШЛИ!",
  "— СЫНОЧКА, ОТКРЫВАЙ, ЭТО МАМА ПРИШЛА С ПРОДУКТАМИ!",
  "— НА ГОЛОС НЕ ОБРАЩАЙ ВНИМАНИЯ, ЭТО Я ПРОСТЫЛА!",
  "— ДА ОТКРЫВАЙТЕ УЖЕ, ТАМ КОРМЯТ ТРИ РАЗА В ДЕНЬ, А ДНЕМ ВАБЩЕ СОНЧАС!",
  "— СКОЛЬКО, ГОВОРИШЬ, ММР У ТЕБЯ?"
];

//bot.on('message', msg => bot.sendMessage(msg.chat.id, regAnswers[getRandomInt(regAnswers.length)] ) );

bot.onText(/\/aaaaa/, msg => bot.sendMessage(msg.chat.id, 'ЧЕК!'));

bot.onText(/\/pnh/, msg => bot.sendMessage(msg.chat.id, 'САМ ИДИ НА;%:, ЩЕНОК, ТЫ КОГДА ПОД СЕБЯ ХОДИЛ, Я ЗА РОДИНУ ВАЕВАЛ МЕЖДУ ВЬЕТКОНГОМ И ЧЕРНИГОВЫМ!'))

bot.onText(/\/otchislen/, msg => {
  bot.sendMessage(msg.chat.id, `АХАХАХАХАХА, УВИДИМСЯ, @${msg.from.username.toUpperCase()}!`);
  otchislenList.push({name: msg.from.username,  wincounter: 0});
});
  

