const { createUser, createServer } = require('../pterodactyl');
const db = require('../firebase');

// /panel - Create User & Server
async function createPanel(bot, msg) {
  const telegramId = msg.from.id;
  const userRef = db.collection('users').doc(telegramId.toString());
  const doc = await userRef.get();

  if (!doc.exists || !doc.data().paid) {
    return bot.sendMessage(telegramId, "❌ <b>Access Denied:</b> You must buy access first.", { parse_mode: 'HTML' });
  }
  if (doc.data().panel_created) {
    return bot.sendMessage(telegramId, `⚠ You already have a panel.\n<b>Username:</b> ${doc.data().username}\n<b>Password:</b> ${doc.data().password}`, { parse_mode: 'HTML' });
  }

  bot.sendMessage(telegramId, "⚙ Creating your panel and server...");

  const username = `user${telegramId}`;
  const password = Math.random().toString(36).slice(-8);
  const email = `${telegramId}@pterobot.com`;

  // 1. Create Ptero User
  const pteroUser = await createUser(email, username, password, false);
  if (!pteroUser) return bot.sendMessage(telegramId, "❌ Error creating user.");

  // 2. Create Ptero Server
  const pteroServer = await createServer(pteroUser.attributes.id, `Server-${username}`);
  if (!pteroServer) return bot.sendMessage(telegramId, "❌ User created, but server failed.");

  // 3. Save Data
  await userRef.set({ username, password, email, panel_created: true, ptero_id: pteroUser.attributes.id }, { merge: true });

  bot.sendMessage(telegramId, `✅ <b>Panel Created!</b>\n\n🔗 <b>URL:</b> https://hero.brevo.host\n👤 <b>User:</b> ${username}\nKZ <b>Pass:</b> ${password}`, { parse_mode: 'HTML' });
}

// /info - Show User Details
async function userInfo(bot, msg) {
  const telegramId = msg.from.id;
  const doc = await db.collection('users').doc(telegramId.toString()).get();

  if (!doc.exists) return bot.sendMessage(telegramId, "❌ You are not registered.");
  
  const data = doc.data();
  bot.sendMessage(telegramId, `👤 <b>User Information</b>\n\n<b>Paid:</b> ${data.paid ? 'Yes' : 'No'}\n<b>Username:</b> ${data.username || 'N/A'}\n<b>Password:</b> ${data.password || 'N/A'}`, { parse_mode: 'HTML' });
}

// /cancel
async function cancelOp(bot, msg) {
  bot.sendMessage(msg.chat.id, "🚫 Operation cancelled.");
}

module.exports = { createPanel, userInfo, cancelOp };

