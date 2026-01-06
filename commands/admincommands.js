
const db = require('../firebase');

async function approveUser(bot, msg, args) {
  const telegramId = args[0];
  if (!telegramId) return bot.sendMessage(msg.chat.id, "Usage: /approve <telegramId>");

  await db.collection('users').doc(telegramId.toString()).set({ paid: true }, { merge: true });
  bot.sendMessage(msg.chat.id, `User ${telegramId} marked as paid.`);
}

module.exports = { approveUser };
