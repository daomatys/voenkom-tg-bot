const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
const database = require('better-sqlite3');
const { JSDOM } = require('jsdom');

const bot = new tgBot(process.env.BOEHKOM_TOKEN, {polling: true});
const db = new database('database.db', {verbose: console.log});

const dbUpdate = db.prepare('UPDATE otchisList SET count = count + 1 WHERE id = :id');
const dbUpdateTran = db.transaction(item => dbUpdate.run(item));

const dbWrite = db.prepare('INSERT INTO otchisList (id, name, count) VALUES (:id, :name, :count)');
const dbWriteTran = db.transaction(item => dbWrite.run(item));

const dbStory = db.prepare('INSERT INTO coolStorage (id, text) VALUES (:id, :text)');
const dbStoryTran = db.transaction(item => dbStory.run(item));
const dbStoryRead = db.prepare('SELECT text FROM coolStorage WHERE id = :id');
const dbStoryLength = db.prepare('SELECT * FROM coolStorage ORDER BY id DESC LIMIT 1;').get().id;

const dbAnswers = k => db.prepare('SELECT answer FROM answers' + k + ' WHERE id = :id');
const dbAntiClone = db.prepare('SELECT id FROM otchisList WHERE name = :name');

const getRandomInt = max => Math.floor(Math.random() * Math.floor(max)); //[0, max)
const getRandomAnswer = (k, r) => dbAnswers(k).get({id: getRandomInt(r)}).answer;

const setCountWord = a => (Math.floor(a / 10) == 1) || (a % 10 < 2) || (a % 10 > 4) ? `раз` : `раза` ;

const dbOtchisList = db.prepare('SELECT name, count FROM otchisList WHERE id = :id');

let dbOtchisListLength = db.prepare('SELECT id FROM otchisList').all().length;
let heComes = false;
let callLimiterByDate = 0;


bot.onText(/\/pnh/, msg => {
  if (heComes) bot.sendMessage( msg.chat.id, '<i>— ' + getRandomAnswer('Quit', 11) + '!</i>', {parse_mode: 'HTML'} );
  heComes = false;
});


bot.onText(/^[^/]/, msg => {
  if (heComes) bot.sendMessage( msg.chat.id, '<i>— ' + getRandomAnswer('Regular', 28) + '!</i>', {parse_mode: 'HTML'} );
  if (getRandomInt(20) == 1) {
    bot.sendMessage( msg.chat.id, '<b>*' + getRandomAnswer('Spawn', 14) + '*</b>', {parse_mode: 'HTML'} );
    heComes = true;
  }
});


bot.onText(/\/aaaaa/, msg => {
  if (msg.date > callLimiterByDate + 43200) {
    const r = getRandomInt(dbOtchisListLength);
    const recruitName = dbOtchisList.get({id: r}).name.toUpperCase();
    
    dbUpdateTran({id: r});
    callLimiterByDate = msg.date;
    bot.sendMessage( msg.chat.id, `<i>— @${recruitName}, ВЫ ТЕРЬ РЯДОВОЙ! НА ПЛАЦ БЕГОМ МАРШ!!!!!!! МВА-ХА-ХА-ХА-ХА!!</i>`, {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— НА СЕГОДНЯ ПРИЗЫВ ОКОНЧЕН!</i>`, {parse_mode: 'HTML'} )
  }
});


bot.onText(/\/otchislen/, msg => { 
  if (dbAntiClone.get({name: msg.from.username}) === undefined) {
    dbWriteTran( {id: dbOtchisListLength , name: msg.from.username, count: 0} );
    dbOtchisListLength++;
    bot.sendMessage( msg.chat.id, `<i>— МВА-ХА-ХА-ХА-ХА. ДОБРО ПОЖАЛОВАТЬ В АД, @${msg.from.username.toUpperCase()}!</i>` , {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— ВТОРОЙ РАЗ НЕ ПРИЗЫВАЮТ, И-ДИ-ОТ!</i>`, {parse_mode: 'HTML'} );
  }
});


bot.onText(/\/spisok/, msg => {
  let otchisListTitle = `ЛИЧНЫЙ СОСТАВ В/Ч 1337\nЗАЩИТИЛ САПОГИ:\n\n`;
  let otchisListBody = '';
  
  for (let i = 0; i < dbOtchisListLength; i++) {
    let item = dbOtchisList.get({id: i});
    otchisListBody += `• ${item.name} — ${item.count} ${setCountWord(item.count)}!\n`;
  }
  
  bot.sendMessage( msg.chat.id, '<code>' + otchisListTitle + otchisListBody + '</code>', {parse_mode: 'HTML'} );
});


bot.onText(/\/import/, msg => {
  const url = '';
  
  JSDOM.fromURL(url).then( dom => {
    randomStoriesPack = dom
      .window
      .document
      .getElementById('mw-content-text')
      .getElementsByTagName('p');
    for (let i = 0; i < randomStoriesPack.length; i++) dbStoryTran({id: i, text: randomStoriesPack.item(i).innerHTML});
  })
});


bot.onText(/\/coolstory/, msg => {
  const randomStory = dbStoryRead.get({id: getRandomInt(dbStoryLength)}).text;
  
  bot.sendMessage( msg.chat.id, '<i>— ' + randomStory + '</i>', {parse_mode: 'HTML'} );
});


bot.on('polling_error', console.log);
