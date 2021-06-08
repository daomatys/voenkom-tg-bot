const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();

const token = process.env.BOEHKOM_TOKEN;
const bot = new tgBot(token, {polling: true});

const getRandomInt = max => Math.floor( Math.random() * Math.floor(max) );


let otchisList = [
  {name: 'balls', count: 2},
  {name: 'kirsosichka', count: 24},
  {name: 'yobaneim', count: 15}
];

let regAnswers = [
  "— ОТКРОЙТЕ, А ТО В АРМИЮ ЗАБЕРУ!",
  "*DOOR INTENSIFIES*",
  "— О, ЭТО ВЫ УДАЧНО ДОМОЙ ЗАШЛИ!",
  "— СЫНОЧКА, ОТКРЫВАЙ, ЭТО МАМА ПРИШЛА С ПРОДУКТАМИ!",
  "— НА ГОЛОС НЕ ОБРАЩАЙ ВНИМАНИЯ, ЭТО Я ПРОСТЫЛА!",
  "— ДА ОТКРЫВАЙТЕ УЖЕ, ТАМ КОРМЯТ ТРИ РАЗА В ДЕНЬ, А ДНЕМ ВАБЩЕ СОНЧАС!",
  "— СКОЛЬКО, ГОВОРИШЬ, ММР У ТЕБЯ?",
  "— ЗАКРОЙ ГЛАЗА, ОТКРОЙ ДВЕРЬ :)"
];

let leftAnswers = [
  "— САМ ИДИ НА;%:, ЩЕНОК, ТЫ КОГДА ПОД СЕБЯ ХОДИЛ, Я ВАЕВАЛ!! МЕЖДУ ВЬЕТКОНГОМ И ЧЕРНИГОВЫМ!",
  "— Я ЕЩЕ ВЕРНУСЬ!!!",
  "— ТЫ АБ ЭТОМ ПАЖЕЛЕЕШЬ!",
  "— НУ, ПОГОДИ У МЕНЯ!",
];


//bot.on('message', msg => bot.sendMessage(msg.chat.id, regAnswers[getRandomInt(regAnswers.length)] ) );


bot.onText(/\/aaaaa/, msg => {
  const r = getRandomInt(otchisList.length);
  
  otchisList[r].count++;
  bot.sendMessage(msg.chat.id, `${otchisList[r].name.toUpperCase()}! ВЫ — РЯДОВОЙ!`);
});


bot.onText(/\/pnh/, msg => {
  bot.sendMessage(msg.chat.id,'under conscruction' )
});


bot.onText(/\/otchis/, msg => {
  if (otchisList.some(item => item.name == msg.from.username)) {
    bot.sendMessage(msg.chat.id, `ВТОРОЙ РАЗ НЕ ПРИЗЫВАЮТ, БОЛВАН!`);
  } else {
    otchisList.push({name: msg.from.username, count: 0});
    bot.sendMessage(msg.chat.id, `АХАХАХАХАХА, УВИДИМСЯ, @${msg.from.username.toUpperCase()}!`);
  }
});


bot.onText(/\/spisok/, msg => {
  const setCountWord = a => (Math.floor(a / 10) == 1) || (a % 10 < 2) || (a % 10 > 4) ? `раз` : `раза` ;
  
  const otchisListTitle = `ЛИЧНЫЙ СОСТАВ В/Ч 1337\nЗАЩИТИЛ САПОГИ:\n\n`;
  const otchisListBody = otchisList.map(item => `• ${item.name} — ${item.count} ${setCountWord(item.count)}!`).join('\n');
  
  bot.sendMessage(msg.chat.id, '<code>' + otchisListTitle + otchisListBody + '</code>', {parse_mode: 'HTML'});
});


bot.on('polling_error', console.log);
