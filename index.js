//requires
const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
//init
const token = process.env.BOEHKOM_TOKEN;
const bot = new tgBot(token, {polling: true});
//misc
const getRandomInt = max => Math.floor( Math.random() * Math.floor(max) );


let otchislenList = [
  {name: 'Oxore', count: 0},
  {name: 'hopez', count: 0}
];

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

bot.onText(/\/aaaaa/, msg => {
  let r = getRandomInt(otchislenList.length);
  otchislenList[r].count++;
  bot.sendMessage(msg.chat.id, `@${otchislenList[r].name.toUpperCase()}! ВЫ - РЯДОВОЙ!`);
});

bot.onText(/\/pnh/, msg => bot.sendMessage(msg.chat.id, 'САМ ИДИ НА;%:, ЩЕНОК, ТЫ КОГДА ПОД СЕБЯ ХОДИЛ, Я ЗА РОДИНУ ВАЕВАЛ МЕЖДУ ВЬЕТКОНГОМ И ЧЕРНИГОВЫМ!'));

bot.onText(/\/otchislen/, msg => {
  if (otchislenList.some(item => item.name == msg.from.username)) {
    bot.sendMessage(msg.chat.id, `ВТОРОЙ РАЗ НЕ ПРИЗЫВАЮТ, БОЛВАН!`);
  } else {
    otchislenList.push({name: msg.from.username, count: 0});
    bot.sendMessage(msg.chat.id, `АХАХАХАХАХА, УВИДИМСЯ, @${msg.from.username.toUpperCase()}!`);
  }
});
  

