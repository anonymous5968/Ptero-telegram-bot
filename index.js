const TelegramBot = require('node-telegram-bot-api');
const userCmds = require('./commands/userCommands');
const adminCmds = require('./commands/adminCommands');

// --- HARDCODED TOKEN ---
const BOT_TOKEN = "8583326462:AAH03fQz7mjPp7PbLWkasXPn9QGyrWOCy6M";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("✅ Bot is running with hardcoded credentials...");

// --- MENU BUTTONS ---
bot.setMyCommands([
  { command: '/panel', description: 'Create panel' },
  { command: '/addsrv', description: 'Add server' },
  { command: '/delsrv', description: 'delete serve' },
  { command: '/cancel', description: 'cancel' },
  { command: '/info', description: 'user information' },
  { command: '/admin', description: 'create admin User' },
  { command: '/listsrv', description: 'list servers' },
  { command: '/listusr', description: 'list users' },
  { command: '/delusr', description: 'delete users' }
]);

// --- COMMAND ROUTES ---
bot.onText(/\/panel/, (msg) => userCmds.createPanel(bot, msg));
bot.onText(/\/info/, (msg) => userCmds.userInfo(bot, msg));
bot.onText(/\/cancel/, (msg) => userCmds.cancelOp(bot, msg));

bot.onText(/\/listsrv/, (msg) => adminCmds.listServers(bot, msg));
bot.onText(/\/listusr/, (msg) => adminCmds.listUsers(bot, msg));
bot.onText(/\/admin/, (msg) => adminCmds.createAdmin(bot, msg));

bot.onText(/\/addsrv (.+)/, (msg, match) => adminCmds.addServer(bot, msg, match[1].split(' ')));
bot.onText(/\/delsrv (.+)/, (msg, match) => adminCmds.delServer(bot, msg, match[1].split(' ')));
bot.onText(/\/delusr (.+)/, (msg, match) => adminCmds.delUser(bot, msg, match[1].split(' ')));

// Error handling for missing arguments
bot.onText(/\/addsrv$/, (msg) => bot.sendMessage(msg.chat.id, "⚠ Usage: /addsrv <PteroUserID> <Name>"));
bot.onText(/\/delsrv$/, (msg) => bot.sendMessage(msg.chat.id, "⚠ Usage: /delsrv <ServerID>"));
bot.onText(/\/delusr$/, (msg) => bot.sendMessage(msg.chat.id, "⚠ Usage: /delusr <UserID>"));
   
