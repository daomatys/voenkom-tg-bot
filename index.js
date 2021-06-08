const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();

const token = process.env.BOEHKOM_TOKEN;
const bot = new tgBot(token, {polling: true});

const getRandomInt = max => Math.floor( Math.random() * Math.floor(max) );


let otchislenList = [
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
  "— СКОЛЬКО, ГОВОРИШЬ, ММР У ТЕБЯ?"
];


//bot.on('message', msg => bot.sendMessage(msg.chat.id, regAnswers[getRandomInt(regAnswers.length)] ) );


bot.onText(/\/aaaaa/, msg => {
  const r = getRandomInt(otchislenList.length);
  
  otchislenList[r].count++;
  bot.sendMessage(msg.chat.id, `${otchislenList[r].name.toUpperCase()}! ВЫ - РЯДОВОЙ!`);
});


bot.onText(/\/pnh/, msg =>
  bot.sendMessage(msg.chat.id, 'САМ ИДИ НА;%:, ЩЕНОК, ТЫ КОГДА ПОД СЕБЯ ХОДИЛ, Я ЗА РОДИНУ ВАЕВАЛ МЕЖДУ ВЬЕТКОНГОМ И ЧЕРНИГОВЫМ!')
);


bot.onText(/\/otchislen/, msg => {
  if (otchislenList.some(item => item.name == msg.from.username)) {
    bot.sendMessage(msg.chat.id, `ВТОРОЙ РАЗ НЕ ПРИЗЫВАЮТ, БОЛВАН!`);
  } else {
    otchislenList.push({name: msg.from.username, count: 0});
    bot.sendMessage(msg.chat.id, `АХАХАХАХАХА, УВИДИМСЯ, @${msg.from.username.toUpperCase()}!`);
  }
});


bot.onText(/\/spisok/, msg => {
  const fixCountWord = a => Math.floor(a/10)==1 || a%10<2 || a%10>4 ? ` раз` : ` раза` ;
  const otchislenListGen = item => `• ${item.name} — <i>${item.count + fixCountWord(item.count)}!</i>`;
  
  bot.sendMessage(msg.chat.id, otchislenList.map(otchislenListGen).join('\n'), {parse_mode: 'HTML'});
});


bot.on('polling_error', console.log);
