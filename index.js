const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
const database = require('better-sqlite3');
const { JSDOM } = require('jsdom');

const bot = new tgBot( process.env.BOEHKOM_TOKEN, {polling: true} );
const db = new database( 'database.db', {verbose: console.log} );

const dbRecruits = db.prepare('SELECT name, count FROM recruits WHERE id = :id');
const dbRecruitsUpdate = db.prepare('UPDATE recruits SET count = count + 1 WHERE id = :id');
const dbRecruitsUpdateTran = db.transaction(item => dbRecruitsUpdate.run(item));
const dbRecruitsWrite = db.prepare('INSERT INTO recruits (id, name, count) VALUES (:id, :name, :count)');
const dbRecruitsWriteTran = db.transaction(item => dbRecruitsWrite.run(item));
const dbRecruitsFindClone = db.prepare('SELECT id FROM recruits WHERE name = :name');

const dbTales = db.prepare('INSERT INTO tales (id, text) VALUES (:id, :text)');
const dbTalesTran = db.transaction(item => dbTales.run(item));
const dbTalesRead = db.prepare('SELECT text FROM tales WHERE id = :id');

const getRandomInt = max => Math.floor( Math.random() * Math.floor(max) ); //[0, max)
const getRandomAnswer = (k, r) => db
  .prepare('SELECT answer FROM answers' + k + ' WHERE id = :id')
  .get( {id: getRandomInt(r)} )
  .answer;

const setCountWord = a => (Math.floor(a / 10) == 1) || (a % 10 < 2) || (a % 10 > 4) ? `раз` : `раза` ;
const dbAnyTableLength = k => db
  .prepare('SELECT * FROM ' + k + ' ORDER BY id DESC LIMIT 1;')
  .get()
  .id + 1;

let dbRecruitsLength = dbAnyTableLength('recruits');
let dbTalesLength = dbAnyTableLength('tales');

let callLimiterByDate = 0;
let heComes = false;
let recruitName;


bot.onText(/^[^/]/, msg => {
  if (heComes) {
    bot.sendMessage( msg.chat.id, '<i>— ' + getRandomAnswer('Regular', 28) + '!</i>', {parse_mode: 'HTML'} );
  }
  if (getRandomInt(20) == 1) {
    bot.sendMessage( msg.chat.id, '<b>*' + getRandomAnswer('Spawn', 14) + '*</b>', {parse_mode: 'HTML'} );
    heComes = true;
  }
});


bot.onText(/\/pnh/, msg => {
  if (heComes) {
    bot.sendMessage( msg.chat.id, '<i>— ' + getRandomAnswer('Quit', 11) + '!</i>', {parse_mode: 'HTML'} );
  }
  heComes = false;
});


bot.onText(/\/aaaa/, msg => {
  const r = getRandomInt( dbRecruitsLength );
  
  recruitName = dbRecruits.get( {id: r} ).name.toUpperCase();
  
  if (msg.date > callLimiterByDate + 43200) {
    
    callLimiterByDate = msg.date;
    
    dbRecruitsUpdateTran( {id: r} );
    
    bot.sendMessage( msg.chat.id, `<i>— @${recruitName}, ВЫ ТЕРЬ РЯДОВОЙ! ПО МАШИНАМ!!! БЕГОМ МА-А-АРШ!!!!</i>`, {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— В УАЗИК ПОМЕЩАЕТСЯ ТОЛЬКО ОДИН ПРИЗЫВНИК! ЗА ОСТАЛЬНЫМИ ПОЗЖЕ ЗАЕДУ!</i>`, {parse_mode: 'HTML'} )
  }
});


bot.onText(/\/otchislen/, msg => { 
  recruitName = msg.from.username.toUpperCase()
  
  if (dbRecruitsFindClone.get( {name: msg.from.username} ) === undefined) {
    
    dbRecruitsWriteTran( {id: dbRecruitsLength , name: msg.from.username, count: 0} );
    
    dbRecruitsLength++;
    
    bot.sendMessage( msg.chat.id, `<i>— ОЖИДАЙТЕ ПОВЕСТОЧКИ, @${recruitName}!</i>` , {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— @${recruitName}, К МОЕМУ СЧАСТЬЮ, ТОВАРИЩ МЛАДШИЙ РЯДОВОЙ, ОТЧИСЛИТЬСЯ ИЗ ВОЙСК — НЕ-ВО-ЗМО-ЖНО!!!</i>`, {parse_mode: 'HTML'} );
  }
});


bot.onText(/\/spisok/, msg => {
  const dbRecruitsTitle = `ЛИЧНЫЙ СОСТАВ В/Ч 1337\nЗАЩИТИЛ САПОГИ:\n\n`;
  let dbRecruitsList = '';
  
  for (let i = 0; i < dbRecruitsLength; i++) {
    let item = dbRecruits.get( {id: i} );
    dbRecruitsList += `• ${item.name} — ${item.count} ${setCountWord(item.count)}!\n`;
  }
  bot.sendMessage( msg.chat.id, '<code>' + dbRecruitsTitle + dbRecruitsList + '</code>', {parse_mode: 'HTML'} );
});


bot.onText(/\/coolstory/, msg => {
  const randomStory = dbTalesRead.get( {id: getRandomInt(dbTalesLength)} ).text;
  bot.sendMessage( msg.chat.id, '<i>— ' + randomStory + '</i>', {parse_mode: 'HTML'} );
});


bot.onText(/\/import/, msg => {
  const url = '';
  let urlTalesPack = '';
  
  JSDOM.fromURL(url).then( dom => {
    urlTalesPack = dom
      .window
      .document
      .getElementById('mw-content-text')
      .getElementsByTagName('p');
      
    for (let i = 0; i < urlTalesPack.length; i++) 
      dbTalesTran( {id: i, text: urltalesPack.item(i).innerHTML} );
  });
  dbTalesLength += urlTalesPack.length;
});


bot.on('polling_error', console.log);
