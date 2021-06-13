const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
const database = require('better-sqlite3');
const { JSDOM } = require('jsdom');

const bot = new tgBot(process.env.BOEHKOM_TOKEN, {polling: true});
const db = new database('database.db', {verbose: console.log});

const dbList = db.prepare('SELECT name, count FROM otchisList WHERE id = :id');
const dbListUpdate = db.prepare('UPDATE otchisList SET count = count + 1 WHERE id = :id');
const dbListUpdateTran = db.transaction(item => dbListUpdate.run(item));
const dbListWrite = db.prepare('INSERT INTO otchisList (id, name, count) VALUES (:id, :name, :count)');
const dbListWriteTran = db.transaction(item => dbListWrite.run(item));

const dbStory = db.prepare('INSERT INTO coolStorage (id, text) VALUES (:id, :text)');
const dbStoryTran = db.transaction(item => dbStory.run(item));
const dbStoryRead = db.prepare('SELECT text FROM coolStorage WHERE id = :id');
const dbStoryLength = db.prepare('SELECT * FROM coolStorage ORDER BY id DESC LIMIT 1;').get().id;

const dbAntiClone = db.prepare('SELECT id FROM otchisList WHERE name = :name');
const dbAnswers = k => db.prepare('SELECT answer FROM answers' + k + ' WHERE id = :id');

const getRandomInt = max => Math.floor(Math.random() * Math.floor(max)); //[0, max)
const getRandomAnswer = (k, r) => dbAnswers(k).get({id: getRandomInt(r)}).answer;

const setCountWord = a => (Math.floor(a / 10) == 1) || (a % 10 < 2) || (a % 10 > 4) ? `раз` : `раза` ;


let dbListLength = db.prepare('SELECT id FROM otchisList').all().length;
let callLimiterByDate = 0;
let heComes = false;


bot.onText(/^[^/]/, msg => {
  if (heComes) bot.sendMessage( msg.chat.id, '<i>— ' + getRandomAnswer('Regular', 28) + '!</i>', {parse_mode: 'HTML'} );
  if (getRandomInt(20) == 1) {
    bot.sendMessage( msg.chat.id, '<b>*' + getRandomAnswer('Spawn', 14) + '*</b>', {parse_mode: 'HTML'} );
    heComes = true;
  }
});


bot.onText(/\/pnh/, msg => {
  if (heComes) bot.sendMessage( msg.chat.id, '<i>— ' + getRandomAnswer('Quit', 11) + '!</i>', {parse_mode: 'HTML'} );
  heComes = false;
});


bot.onText(/\/aaaa/, msg => {
  if (msg.date > callLimiterByDate + 43200) {
    const r = getRandomInt(dbListLength);
    const recruitName = dbList.get({id: r}).name.toUpperCase();
    
    dbListUpdateTran({id: r});
    callLimiterByDate = msg.date;
    bot.sendMessage( msg.chat.id, `<i>— @${recruitName}, ВЫ ТЕРЬ РЯДОВОЙ! НА ПЛАЦ БЕГОМ МАРШ!!!!!!!</i>`, {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— НА СЕГОДНЯ ПРИЗЫВ ОКОНЧЕН!</i>`, {parse_mode: 'HTML'} )
  }
});


bot.onText(/\/otchislen/, msg => { 
  if (dbAntiClone.get({name: msg.from.username}) === undefined) {
    const recruitName = msg.from.username.toUpperCase();
    
    dbListWriteTran( {id: dbListLength , name: msg.from.username, count: 0} );
    dbListLength++;
    bot.sendMessage( msg.chat.id, `<i>— МВА-ХА-ХА-ХА-ХА. ДОБРО ПОЖАЛОВАТЬ В АД, @${recruitName}!</i>` , {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— ВТОРОЙ РАЗ НЕ ПРИЗЫВАЮТ, И-ДИ-ОТ!</i>`, {parse_mode: 'HTML'} );
  }
});


bot.onText(/\/spisok/, msg => {
  const otchisListTitle = `ЛИЧНЫЙ СОСТАВ В/Ч 1337\nЗАЩИТИЛ САПОГИ:\n\n`;
  let otchisListBody = '';
  
  for (let i = 0; i < dbListLength; i++) {
    let item = dbList.get({id: i});
    otchisListBody += `• ${item.name} — ${item.count} ${setCountWord(item.count)}!\n`;
  }
  bot.sendMessage( msg.chat.id, '<code>' + otchisListTitle + otchisListBody + '</code>', {parse_mode: 'HTML'} );
});


bot.onText(/\/coolstory/, msg => {
  const randomStory = dbStoryRead.get({id: getRandomInt(dbStoryLength)}).text;
  
  bot.sendMessage( msg.chat.id, '<i>— ' + randomStory + '</i>', {parse_mode: 'HTML'} );
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
  });
});


bot.on('polling_error', console.log);
