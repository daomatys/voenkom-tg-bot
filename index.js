const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
const database = require('better-sqlite3');

const token = process.env.BOEHKOM_TOKEN;
const bot = new tgBot(token, {polling: true});

const db = new database('database.db', {verbose: console.log});
const dbRead = db.prepare('SELECT name, count FROM otchisBase');

const dbAnswersQuit = db.prepare('SELECT answer FROM answersQuit WHERE id = :id');
const dbAnswersSpawn = db.prepare('SELECT answer FROM answersSpawn WHERE id = :id');
const dbAnswersRegular = db.prepare('SELECT answer FROM answersRegular WHERE id = :id');

const dbUpdate = db.prepare('UPDATE otchisBase SET count = count + 1 WHERE id = :id');
const dbUpdateTran = db.transaction(item => dbUpdate.run(item));

const dbWrite = db.prepare('INSERT INTO otchisBase (id, name, count) VALUES (:id, :name, :count)');
const dbWriteTran = db.transaction(item => dbWrite.run(item));

const getRandomInt = max => Math.floor( Math.random() * Math.floor(max) ); //[0, max)
const getRandomAnswer = (a, i) => a.get({id: getRandomInt(i)}).answer;

const setCountWord = a => (Math.floor(a / 10) == 1) || (a % 10 < 2) || (a % 10 > 4) ? `раз` : `раза` ;
const otchisListTitle = `ЛИЧНЫЙ СОСТАВ В/Ч 1337\nЗАЩИТИЛ САПОГИ:\n\n`;


let otchisList = dbRead.all();
let heComes = false;


bot.onText(/\/pnh/, msg => {
  if (heComes) bot.sendMessage( msg.chat.id, '<i>— ' + getRandomAnswer(dbAnswersQuit, 8) + '!</i>', {parse_mode: 'HTML'} );
  heComes = false;
});

bot.onText(/^[^/]/, msg => {
  if (heComes) bot.sendMessage( msg.chat.id, '<i>— ' + getRandomAnswer(dbAnswersRegular, 8) + '!</i>', {parse_mode: 'HTML'} );
  if (getRandomInt(20) == 1) {
    bot.sendMessage( msg.chat.id, '<b>*' + getRandomAnswer(dbAnswersSpawn, 8) + '*</b>', {parse_mode: 'HTML'} );
    heComes = true;
  }
});

bot.onText(/\/aaaaa/, msg => {
  const r = getRandomInt(otchisList.length) + 1;
  
  dbUpdateTran( {id: r} );
  otchisList[r - 1].count++;
  bot.sendMessage( msg.chat.id, `${otchisList[r - 1].name.toUpperCase()}! ВЫ — РЯДОВОЙ!` );
});

bot.onText(/\/otchis/, msg => {
  if (otchisList.some(item => item.name == msg.from.username)) {
    bot.sendMessage(msg.chat.id, `ВТОРОЙ РАЗ НЕ ПРИЗЫВАЮТ, БОЛВАН!`);
  } else {
    dbWriteTran( {id: otchisList.length + 1, name: msg.from.username, count: 0} );
    otchisList.push( {id: otchisList.length + 1, name: msg.from.username, count: 0} );
    bot.sendMessage( msg.chat.id, `АХАХАХАХАХА, УВИДИМСЯ, @${msg.from.username.toUpperCase()}!` );
  }
});

bot.onText(/\/spisok/, msg => {
  const otchisListBody = otchisList.map(item => `• ${item.name} — ${item.count} ${setCountWord(item.count)}!`).join('\n');
  bot.sendMessage( msg.chat.id, '<code>' + otchisListTitle + otchisListBody + '</code>', {parse_mode: 'HTML'} );
});


bot.on('polling_error', console.log);
