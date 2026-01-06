const { createUser, createServer, listUsers } = require('../pterodactyl');
const db = require('../firebase');

// /panel - Create User & Server
async function createPanel(bot, msg) {
  const telegramId = msg.from.id;
  const userRef = db.collection('users').doc(telegramId.toString());
  
  // Database Error Handling
  let doc;
  try {
    doc = await userRef.get();
  } catch (e) {
    return bot.sendMessage(telegramId, `❌ Database Error: ${e.message}`);
  }

  // 1. Check if paid
  if (!doc.exists || !doc.data().paid) {
    return bot.sendMessage(telegramId, "❌ <b>Access Denied:</b> You must buy access first.", { parse_mode: 'HTML' });
  }
  
  // 2. Check DB record
  if (doc.data().panel_created) {
    return bot.sendMessage(telegramId, `⚠ You already have a panel.\n<b>Username:</b> ${doc.data().username}\n<b>Password:</b> ${doc.data().password}`, { parse_mode: 'HTML' });
  }

  bot.sendMessage(telegramId, "⚙ Creating your panel and server...");

  const username = `user${telegramId}`;
  const password = Math.random().toString(36).slice(-8);
  const email = `${telegramId}@pterobot.com`;

  // 3. CHECK FOR EXISTING USER
  let pteroUserId = null;
  const allUsers = await listUsers();
  const existingUser = allUsers.find(u => u.attributes.username === username || u.attributes.email === email);

  if (existingUser) {
    pteroUserId = existingUser.attributes.id;
  } else {
    // Create new user
    const userResult = await createUser(email, username, password, false);
    if (!userResult.success) {
      return bot.sendMessage(telegramId, `❌ Error creating user: ${userResult.error}`);
    }
    pteroUserId = userResult.data.attributes.id;
  }

  // 4. Create Ptero Server
  const serverResult = await createServer(pteroUserId, `Server-${username}`);
  
  // 🚨 ERROR REPORTING TO USER 🚨
  if (!serverResult.success) {
    return bot.sendMessage(telegramId, `❌ <b>Server Creation Failed:</b>\n${serverResult.error}\n\n<i>Possible fixes: Check Location ID or Nest/Egg IDs.</i>`, { parse_mode: 'HTML' });
  }

  // 5. Save Data
  await userRef.set({ 
    username: username, 
    password: password, 
    email, 
    panel_created: true, 
    ptero_id: pteroUserId 
  }, { merge: true });

  bot.sendMessage(telegramId, `✅ <b>Panel Created!</b>\n\n🔗 <b>URL:</b> https://hero.brevo.host\n👤 <b>User:</b> ${username}\nKZ <b>Pass:</b> ${password}`, { parse_mode: 'HTML' });
}

async function userInfo(bot, msg) {
  const telegramId = msg.from.id;
  const doc = await db.collection('users').doc(telegramId.toString()).get();
  if (!doc.exists) return bot.sendMessage(telegramId, "❌ You are not registered.");
  const data = doc.data();
  bot.sendMessage(telegramId, `👤 <b>User Information</b>\n\n<b>Paid:</b> ${data.paid ? 'Yes' : 'No'}\n<b>Username:</b> ${data.username || 'N/A'}\n<b>Password:</b> ${data.password || 'N/A'}`, { parse_mode: 'HTML' });
}

async function cancelOp(bot, msg) {
  bot.sendMessage(msg.chat.id, "🚫 Operation cancelled.");
}

module.exports = { createPanel, userInfo, cancelOp };

