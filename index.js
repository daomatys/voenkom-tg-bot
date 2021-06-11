const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
const database = require('better-sqlite3');

const bot = new tgBot(process.env.BOEHKOM_TOKEN, {polling: true});
const db = new database('database.db', {verbose: console.log});

const dbOtchisList = db.prepare('SELECT name, count FROM otchisList WHERE id = :id');
const dbOtchisListLength = db.prepare('SELECT id FROM otchisList').all().length;

const dbAnswersQuit = db.prepare('SELECT answer FROM answersQuit WHERE id = :id');
const dbAnswersSpawn = db.prepare('SELECT answer FROM answersSpawn WHERE id = :id');
const dbAnswersRegular = db.prepare('SELECT answer FROM answersRegular WHERE id = :id');

const dbUpdate = db.prepare('UPDATE otchisList SET count = count + 1 WHERE id = :id');
const dbUpdateTran = db.transaction(item => dbUpdate.run(item));

const dbWrite = db.prepare('INSERT INTO otchisList (id, name, count) VALUES (:id, :name, :count)');
const dbWriteTran = db.transaction(item => dbWrite.run(item));

const getRandomInt = max => Math.floor(Math.random() * Math.floor(max)); //[0, max)
const getRandomAnswer = (a, i) => a.get({id: getRandomInt(i)}).answer;

const setCountWord = a => (Math.floor(a / 10) == 1) || (a % 10 < 2) || (a % 10 > 4) ? `раз` : `раза` ;

let heComes = false;
let callLimiterByDate = 0;


bot.onText(/\/pnh/, msg => {
  if (heComes) bot.sendMessage( msg.chat.id, '<i>— ' + getRandomAnswer(dbAnswersQuit, 11) + '!</i>', {parse_mode: 'HTML'} );
  heComes = false;
});


bot.onText(/^[^/]/, msg => {
  if (heComes) bot.sendMessage( msg.chat.id, '<i>— ' + getRandomAnswer(dbAnswersRegular, 29) + '!</i>', {parse_mode: 'HTML'} );
  if (getRandomInt(20) == 1) {
    bot.sendMessage( msg.chat.id, '<b>*' + getRandomAnswer(dbAnswersSpawn, 14) + '*</b>', {parse_mode: 'HTML'} );
    heComes = true;
  }
});


bot.onText(/\/aaaaa/, msg => {
  if (msg.date > callLimiterByDate + 43200) {
    const r = getRandomInt(dbOtchisListLength) + 1;
    const recruitName = dbOtchisList.get({id: r}).name.toUpperCase();
    
    dbUpdateTran({id: r});
    callLimiterByDate = msg.date;
    bot.sendMessage( msg.chat.id, `<i>— @${recruitName}, ВЫ ТЕРЬ РЯДОВОЙ! НА ПЛАЦ БЕГОМ МАРШ!!!!!!! МВА-ХА-ХА-ХА-ХА!!</i>`, {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— НА СЕГОДНЯ ПРИЗЫВ ОКОНЧЕН!</i>`, {parse_mode: 'HTML'} )
  }
});


bot.onText(/\/otchislen/, msg => {
  for (let i = 1; i <= dbOtchisListLength; i++) {
    let item = dbOtchisList.get({id: i});
    
    if (item.name != msg.from.username) {
      dbWriteTran( {id: dbOtchisListLength + 1, name: msg.from.username, count: 0} );
      bot.sendMessage( msg.chat.id, `<i>— МВА-ХА-ХА-ХА-ХА. ДОБРО ПОЖАЛОВАТЬ В АД, @${msg.from.username.toUpperCase()}!</i>` , {parse_mode: 'HTML'} );
    } else {
      bot.sendMessage( msg.chat.id, `<i>— ВТОРОЙ РАЗ НЕ ПРИЗЫВАЮТ, И-ДИ-ОТ!</i>`, {parse_mode: 'HTML'} );
      break;
    }
  }
});


bot.onText(/\/spisok/, msg => {
  let otchisListTitle = `ЛИЧНЫЙ СОСТАВ В/Ч 1337\nЗАЩИТИЛ САПОГИ:\n\n`;
  let otchisListBody = '';
  
  for (let i = 1; i <= dbOtchisListLength; i++) {
    let item = dbOtchisList.get({id: i});
    otchisListBody += `• ${item.name} — ${item.count} ${setCountWord(item.count)}!\n`;
  }
  bot.sendMessage( msg.chat.id, '<code>' + otchisListTitle + otchisListBody + '</code>', {parse_mode: 'HTML'} );
});


bot.on('polling_error', console.log);
