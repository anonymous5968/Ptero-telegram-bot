const { createUser } = require('../pterodactyl');
const db = require('../firebase');
const { isPaid } = require('../utils/helpers');

async function start(bot, msg) {
  bot.sendMessage(msg.chat.id, "Welcome! Use /createpanel to create your Pterodactyl panel.");
}

async function createPanel(bot, msg) {
  const telegramId = msg.from.id;
  const paid = await isPaid(telegramId);

  if (!paid) return bot.sendMessage(telegramId, "Payment pending. Contact admin to approve.");

  const email = `${telegramId}@pterobot.com`;
  const username = `user${telegramId}`;
  const password = Math.random().toString(36).slice(-8);

  const user = await createUser(email, username, password);
  if (!user) return bot.sendMessage(telegramId, "Error creating panel.");

  await db.collection('users').doc(telegramId.toString()).set({
    username,
    email,
    password,
    paid: true
  }, { merge: true });

  bot.sendMessage(telegramId, `Panel created!\nUsername: ${username}\nPassword: ${password}`);
}

module.exports = { start, createPanel };
