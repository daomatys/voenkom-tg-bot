const tgBot = require('node-telegram-bot-api'); 
const dotenv = require('dotenv').config();
const database = require('better-sqlite3');
const { JSDOM } = require('jsdom');
const MersenneTwister = require('mersenne-twister');

const bot = new tgBot( process.env.BOEHKOM_TOKEN, {polling: true} );
const db = new database( 'database.db', {verbose: console.log} );
const blessRNG = new MersenneTwister();

const dbRecruits = msg => db.prepare(`SELECT name, count FROM ${getChatId(msg)}`);
const dbRecruitById = msg => db.prepare(`SELECT name, count FROM ${getChatId(msg)} WHERE id = :id`); 
const dbRecruitWrite = msg => db.prepare(`INSERT INTO ${getChatId(msg)} (name) VALUES (:name)`);
const dbRecruitUpdate = msg => db.prepare(`UPDATE ${getChatId(msg)} SET count = count + 1 WHERE id = :id`);
const dbRecruitIsClone = msg => db.prepare(`SELECT id FROM ${getChatId(msg)} WHERE name = :name`);

const dbTalesImport = db.transaction( item => db.prepare('INSERT INTO tales (text) VALUES (:text)').run(item) );

const dbNarrators = () => db.prepare('SELECT state, lastcall FROM zx_narrators WHERE tablename = :tablename');
const dbNarratorNewTabname = () => db.prepare('INSERT OR IGNORE INTO zx_narrators (tablename) VALUES (:tablename)');
const dbNarratorSwitchState = () => db.prepare('UPDATE zx_narrators SET state = ((state | 1) - (state & 1)) WHERE tablename = :tablename');
const dbNarratorSetCalltime = (msg) => db.prepare(`UPDATE zx_narrators SET lastcall = ${msg.date} WHERE tablename = :tablename`);

const getRandomInt = max => 1 + Math.floor( blessRNG.random() * Math.floor(max) ); //[1, max]
const getChatId = msg => 'zxchat_' + msg.chat.id.toString(10).slice(1);

const dbAnyTableLength = table => db
  .prepare(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 1;`)
  .get()
  .id;

const dbAnyText = table => db
  .prepare(`SELECT text FROM ${table} WHERE id = :id`)
  .get({ id: getRandomInt( dbAnyTableLength(table) ) })
  .text;
  
const isChatNew = msg => db
  .prepare(`
    CREATE TABLE IF NOT EXISTS "${getChatId(msg)}" (
      "id"  INTEGER,
      "name"  TEXT,
      "count"  INTEGER DEFAULT 0,
    PRIMARY KEY("id" AUTOINCREMENT)
    );`)
  .run();

const heSpawnChance = 20; //deci-percents ( % / 10 )

const callCooldown = 3600; //unixtime seconds


bot.onText(/^\/coolstory/, msg => {
  bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('tales')}</i>`, {parse_mode: 'HTML'} );
});


bot.onText(/^[^/]/, msg => {
  const idTable = getChatId(msg);
  
  dbNarratorNewTabname().run({ tablename: idTable });
  
  const heComes = dbNarrators()
    .get({ tablename: idTable })
    .state;
  
  if ( heComes ) {
    bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('answersRegular')}!</i>`, {parse_mode: 'HTML'} );
  }
  if ( !heComes && getRandomInt(1000) <= heSpawnChance ) {
    dbNarratorSwitchState().run({ tablename: idTable });
    bot.sendMessage( msg.chat.id, `<b>*${dbAnyText('answersSpawn')}*</b>`, {parse_mode: 'HTML'} );
  }
});


bot.onText(/^\/pnh/, msg => {
  const idTable = getChatId(msg);
  
  dbNarratorNewTabname().run({ tablename: idTable });
  
  const heComes = dbNarrators()
    .get({ tablename: idTable })
    .state;
  
  if ( heComes ) {
    dbNarratorSwitchState().run({ tablename: idTable });
    bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('answersQuit')}!</i>`, {parse_mode: 'HTML'} );
  }
});


bot.onText(/^\/otchislen/, msg => {
  isChatNew(msg);
  
  const recruitNameOps = msg.from.username;
  const recruitName = recruitNameOps.toUpperCase();
  const recruitClone = dbRecruitIsClone(msg).get({ name: recruitNameOps });
  
  if ( recruitClone === undefined) {
    dbRecruitWrite(msg).run({ name: recruitNameOps });
    
    bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('recruitMarked')}, @${recruitName}!</i>` , {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— @${recruitName}, ${dbAnyText('recruitOnDuty')}</i>`, {parse_mode: 'HTML'} );
  }
});


bot.onText(/^\/aaaa/, msg => {
  isChatNew(msg);
  
  const idTable = getChatId(msg);
  
  dbNarratorNewTabname().run({ tablename: idTable });
  
  const calledAt = dbNarrators()
    .get({ tablename: idTable })
    .lastcall;
  
  if ( msg.date > calledAt + callCooldown ) {
    const r = getRandomInt( dbAnyTableLength( idTable ) );
    const privateName = dbRecruitById(msg)
      .get({ id: r })
      .name
      .toUpperCase();
    
    dbRecruitUpdate(msg).run({ id: r });
    dbNarratorSetCalltime(msg).run({ tablename: idTable });
    
    bot.sendMessage( msg.chat.id, `<i>— @${privateName}, ${dbAnyText('privateJoin')}</i>`, {parse_mode: 'HTML'} );
  } else {
    bot.sendMessage( msg.chat.id, `<i>— ${dbAnyText('privateWait')}</i>`, {parse_mode: 'HTML'} )
  }
});


bot.onText(/^\/spisok/, msg => {
  isChatNew(msg);
  
  const setCountWord = a => 
    ( Math.floor(a / 10) == 1 ) ||
    ( a % 10 < 2 ) ||
    ( a % 10 > 4 )
      ? 'раз'
      : 'раза' ;
      
  const spisokTitle = `ЛИЧНЫЙ СОСТАВ В/Ч 1337\nЗАЩИТИЛ САПОГИ:\n\n`;
  const spisokBody = dbRecruits(msg)
    .all()
    .map(item => `• ${item.name} — ${item.count} ${setCountWord(item.count)}!`)
    .join('\n');
  
  bot.sendMessage( msg.chat.id, '<code>' + spisokTitle + spisokBody + '</code>', {parse_mode: 'HTML'} );
});


/*//don't touch if you've no idea what's that
  bot.onText(/^\/import/, msg => {
  const url = '';
  let urlTalesPack = '';
  
  JSDOM.fromURL(url).then( dom => {
    urlTalesPack = dom
      .window
      .document
      .getElementById('1028')
      .getElementsByClassName('post_message');
      
    for (let i = 1; i <= urlTalesPack.length; i++) {
      dbTalesImport( {text: urltalesPack.item(i).innerHTML} );
    }
    bot.sendMessage( msg.chat.id, 'Done' );
  });
});*/


bot.on('polling_error', console.log);
