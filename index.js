const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
const database = require('better-sqlite3');

const token = process.env.BOEHKOM_TOKEN;
const bot = new tgBot(token, {polling: true});

const db = new database('database.db', {verbose: console.log});
const dbRead = db.prepare('SELECT name, count FROM otchisBase');
const dbUpdate = db.prepare('UPDATE otchisBase SET count = count + 1 WHERE id = :id');
const dbWrite = db.prepare('INSERT INTO otchisBase (id, name, count) VALUES (:id, :name, :count)');

const dbUpdateTran = db.transaction(item => dbUpdate.run(item));
const dbWriteTran = db.transaction(item => dbWrite.run(item));

const getRandomInt = max => Math.floor( Math.random() * Math.floor(max) );


let otchisList = dbRead.all();

let heComes = false;

let regAnswers = [
  "— ОТКРОЙТЕ, А ТО В АРМИЮ ЗАБЕРУ!",
  "*DOOR INTENSIFIES*",
  "*БУМ-БУМ-БУМ-ДЫЩ-ДЫН-БАЦ*",
  "— СЫНОЧКА, ОТКРЫВАЙ, ЭТО МАМА ПРИШЛА С ПРОДУКТАМИ!",
  "*ЗВУКИ ПОДСЛУШИВАНИЯ ВХОДНОЙ ДВЕРИ*",
  "— ТУК-ТУК, ДОСТАВКА ПИЦЦЫ, КОТОРУЮ ВЫ НЕ ЗАКАЗЫВАЛИ! ПОДАРОЧНОЙ ПИЦЦЫ!",
  "— ДА ОТКРЫВАЙТЕ УЖЕ, ТАМ КОРМЯТ ТРИ РАЗА В ДЕНЬ, А ДНЕМ ВАБЩЕ СОНЧАС!",
  "— ЗАКРОЙ ГЛАЗА, ОТКРОЙ ДВЕРЬ, КЕ-КЕ-КЕ"
];

let leftAnswers = [
  "— САМ ИДИ НА;%:, ЩЕНОК, ТЫ КОГДА ПОД СЕБЯ ХОДИЛ, Я ВАЕВАЛ!! МЕЖДУ ВЬЕТКОНГОМ И ЧЕРНИГОВЫМ!",
  "— Я ЕЩЕ ВЕРНУСЬ!!!",
  "— ТЫ АБ ЭТОМ ПАЖЕЛЕЕШЬ!",
  "— НУ, ПОГОДИ У МЕНЯ!",
];


bot.onText(/\/pnh/, msg => {
  if (heComes) bot.sendMessage(msg.chat.id, leftAnswers[getRandomInt(leftAnswers.length)]);
  heComes = false;
});


bot.onText(/^[^/]/, msg => {
  if (getRandomInt(20) == 1) heComes = true;
  if (heComes) bot.sendMessage(msg.chat.id, regAnswers[getRandomInt(regAnswers.length)]);
});


bot.onText(/\/aaaaa/, msg => {
  const r = getRandomInt(otchisList.length) + 1;
  
  dbUpdateTran( {id: r} )
  otchisList[r - 1].count++;
  bot.sendMessage(msg.chat.id, `${otchisList[r - 1].name.toUpperCase()}! ВЫ — РЯДОВОЙ!`);
});


bot.onText(/\/otchis/, msg => {
  if (otchisList.some(item => item.name == msg.from.username)) {
    bot.sendMessage(msg.chat.id, `ВТОРОЙ РАЗ НЕ ПРИЗЫВАЮТ, БОЛВАН!`);
  } else {
    dbWriteTran( {id: otchisList.length + 1, name: msg.from.username, count: 0} );
    otchisList.push( {id: otchisList.length + 1, name: msg.from.username, count: 0} );
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
