const TelegramBot = require('node-telegram-bot-api');
const { start, createPanel } = require('./commands/userCommands');
const { approveUser } = require('./commands/adminCommands');

const BOT_TOKEN = "8583326462:AAH03fQz7mjPp7PbLWkasXPn9QGyrWOCy6M";
const ADMIN_IDS = ["5333338062"];

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// User commands
bot.onText(/\/start/, (msg) => start(bot, msg));
bot.onText(/\/createpanel/, (msg) => createPanel(bot, msg));

// Admin-only commands
bot.onText(/\/approve (.+)/, (msg, match) => {
  if (!ADMIN_IDS.includes(msg.from.id.toString())) return;
  const args = match[1].split(' ');
  approveUser(bot, msg, args);
});

console.log("Bot is running...");
