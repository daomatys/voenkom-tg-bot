const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
const database = require('better-sqlite3');
const { JSDOM } = require('jsdom');

const bot = new tgBot( process.env.BOEHKOM_TOKEN, {polling: true} );
const db = new database( 'database.db', {verbose: console.log} );

const dbRecruits = db.prepare('SELECT name, count FROM recruits WHERE id = :id');
const dbRecruitsWrite = db.transaction( item => db.prepare('INSERT INTO recruits (name, count) VALUES (:name, :count)').run(item));
const dbRecruitsUpdate = db.transaction( item => db.prepare('UPDATE recruits SET count = count + 1 WHERE id = :id').run(item));
const dbRecruitsFindClone = db.prepare('SELECT id FROM recruits WHERE name = :name');

const dbTalesImport = db.transaction( item => db.prepare('INSERT INTO tales (text) VALUES (:text)').run(item));

const getRandomInt = max => Math.floor( Math.random() * Math.floor(max) ); //[0, max)

const dbAnyTableLength = k => db.prepare('SELECT * FROM ' + k + ' ORDER BY id DESC LIMIT 1;').get().id + 1;
const dbAnyText = k => db
  .prepare('SELECT text FROM ' + k + ' WHERE id = :id')
  .get( {id: getRandomInt( dbAnyTableLength(k) )} )
  .text;

let dbRecruitsLength = dbAnyTableLength('recruits');
let dbTalesLength = dbAnyTableLength('tales');

let callLimiterByDate = 0;
let heComes = false;


bot.onText(/^[^/]/, msg => {
  if (heComes) {
    bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('answersRegular')}!</i>`, {parse_mode: 'HTML'} );
  }
  if (getRandomInt(20) == 1) {
    heComes = true;
    bot.sendMessage( msg.chat.id, `<b>*${dbAnyText('answersSpawn')}*</b>`, {parse_mode: 'HTML'} );
  }
});


bot.onText(/\/pnh/, msg => {
  if (heComes) {
    heComes = false;
    bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('answersQuit')}!</i>`, {parse_mode: 'HTML'} );
  }
});


bot.onText(/\/otchislen/, msg => { 
  const recruitNameOps = msg.from.username;
  const recruitName = recruitNameOps.toUpperCase();
  
  if (dbRecruitsFindClone.get( {name: recruitNameOps} ) === undefined) {
    
    dbRecruitsWrite( {name: recruitNameOps, count: 0} );
    
    bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('recruitMarked')}, @${recruitName}!</i>` , {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— @${recruitName}, ${dbAnyText('recruitOnDuty')}</i>`, {parse_mode: 'HTML'} );
  }
});


bot.onText(/\/aaaa/, msg => {
  if (msg.date > callLimiterByDate + 3600) {
    const r = getRandomInt( dbRecruitsLength );
    const privateName = dbRecruits.get( {id: r} ).name.toUpperCase();
    
    callLimiterByDate = msg.date;
    dbRecruitsUpdate( {id: r} );
    
    bot.sendMessage( msg.chat.id, `<i>— @${privateName}, ${dbAnyText('privateJoin')}</i>`, {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('privateWait')}</i>`, {parse_mode: 'HTML'} )
  }
});


bot.onText(/\/spisok/, msg => {
  const setCountWord = a => (Math.floor(a / 10) == 1) || (a % 10 < 2) || (a % 10 > 4) ? `раз` : `раза` ;
  const dbRecruitsTitle = `ЛИЧНЫЙ СОСТАВ В/Ч 1337\nЗАЩИТИЛ САПОГИ:\n\n`;
  let dbRecruitsList = '';
  
  for (let i = 0; i < dbRecruitsLength; i++) {
    let item = dbRecruits.get( {id: i} );
    dbRecruitsList += `• ${item.name} — ${item.count} ${setCountWord(item.count)}!\n`;
  }
  
  bot.sendMessage( msg.chat.id, '<code>' + dbRecruitsTitle + dbRecruitsList + '</code>', {parse_mode: 'HTML'} );
});


bot.onText(/\/coolstory/, msg => {
  bot.sendMessage( msg.chat.id, '<i>— ' + dbAnyText('tales') + '</i>', {parse_mode: 'HTML'} );
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
      
    for (let i = 0; i < urlTalesPack.length; i++) {
      dbTalesImport( {text: urltalesPack.item(i).innerHTML} );
    }
  });
  
  dbTalesLength += urlTalesPack.length;
});


bot.on('polling_error', console.log);
