const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
const database = require('better-sqlite3');
const { JSDOM } = require('jsdom');
const MersenneTwister = require('mersenne-twister');

const bot = new tgBot( process.env.BOEHKOM_TOKEN, {polling: true} );
const db = new database( 'database.db', {verbose: console.log} );
const blessRNG = new MersenneTwister();

const dbRecruits = db.prepare('SELECT name, count FROM recruits');
const dbRecruitsById = db.prepare('SELECT name, count FROM recruits WHERE id = :id'); 
const dbRecruitsWrite = db.transaction( item => db.prepare('INSERT INTO recruits (name, count) VALUES (:name, :count)').run(item) );
const dbRecruitsUpdate = db.transaction( item => db.prepare('UPDATE recruits SET count = count + 1 WHERE id = :id').run(item) );
const dbRecruitsFindClone = db.prepare('SELECT id FROM recruits WHERE name = :name');
const dbTalesImport = db.transaction( item => db.prepare('INSERT INTO tales (text) VALUES (:text)').run(item) );

const getRandomInt = max => 1 + Math.floor( blessRNG.random() * Math.floor(max) ); //[1, max]

const dbAnyTableLength = n => db
  .prepare(`SELECT seq FROM sqlite_sequence WHERE name = :name`)
  .get({name: n})
  .seq;

const dbAnyText = k => db
  .prepare('SELECT text FROM ' + k + ' WHERE id = :id')
  .get( {id: getRandomInt( dbAnyTableLength(k) )} )
  .text;

let callByDate = 0;
let callCooldown = 3600; //unixtime, seconds
let heComes = false;
let heComesChance = 2; //%

bot.onText(/^[^/]/, msg => {
  if (heComes) {
    bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('answersRegular')}!</i>`, {parse_mode: 'HTML'} );
  }
  if (getRandomInt(100) <= heComesChance) {
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
  if (msg.date > callByDate + callCooldown) {
    const r = getRandomInt( dbAnyTableLength('recruits') );
    const privateName = dbRecruitsById
      .get({id: r})
      .name
      .toUpperCase();
    
    callByDate = msg.date;
    dbRecruitsUpdate({id: r});
    bot.sendMessage( msg.chat.id, `<i>— @${privateName}, ${dbAnyText('privateJoin')}</i>`, {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('privateWait')}</i>`, {parse_mode: 'HTML'} )
  }
});

bot.onText(/\/spisok/, msg => {
  const setCountWord = a => (Math.floor(a / 10) == 1) || (a % 10 < 2) || (a % 10 > 4) ? `раз` : `раза` ;
  const recruitsTitle = `ЛИЧНЫЙ СОСТАВ В/Ч 1337\nЗАЩИТИЛ САПОГИ:\n\n`;
  const recruitsBody = dbRecruits
    .all()
    .map(item => `• ${item.name} — ${item.count} ${setCountWord(item.count)}!`)
    .join('\n');
  
  bot.sendMessage( msg.chat.id, '<code>' + recruitsTitle + recruitsBody + '</code>', {parse_mode: 'HTML'} );
});

bot.onText(/\/coolstory/, msg => {
  bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('tales')} </i>`, {parse_mode: 'HTML'} );
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
      
    for (let i = 1; i <= urlTalesPack.length; i++) {
      dbTalesImport( {text: urltalesPack.item(i).innerHTML} );
    }
    bot.sendMessage( msg.chat.id, 'Done' );
  });
  
  dbTalesLength += urlTalesPack.length;
});

bot.on('polling_error', console.log);
