const { createUser, updateUser, createServer, listUsers } = require('../pterodactyl');
const db = require('../firebase');

// /panel - Create User & Server
async function createPanel(bot, msg) {
  const telegramId = msg.from.id;
  const userRef = db.collection('users').doc(telegramId.toString());
  
  let doc;
  try { doc = await userRef.get(); } catch (e) { return bot.sendMessage(telegramId, `❌ DB Error: ${e.message}`); }

  // 1. Check Payment
  if (!doc.exists || !doc.data().paid) {
    return bot.sendMessage(telegramId, "❌ <b>Access Denied:</b> You must buy access first.", { parse_mode: 'HTML' });
  }
  
  // 2. SMART CHECK: Verify if user ACTUALLY exists on Pterodactyl
  // If DB says "panel_created: true", we double-check with the API.
  if (doc.data().panel_created) {
    const allUsers = await listUsers();
    // specific check: does a user with this username actually exist?
    const pteroUserExists = allUsers.find(u => u.attributes.username === doc.data().username);

    if (pteroUserExists) {
      // It really exists, so we stop.
      return bot.sendMessage(telegramId, `⚠ You already have a panel.\n<b>Username:</b> ${doc.data().username}\n<b>Password:</b> ${doc.data().password}`, { parse_mode: 'HTML' });
    } else {
      // DB says yes, but Pterodactyl says no. You must have deleted it manually!
      bot.sendMessage(telegramId, "ℹ <b>System:</b> Detected manual deletion. Resetting your account status...", { parse_mode: 'HTML' });
      // We continue down to create a new one...
    }
  }

  bot.sendMessage(telegramId, "⚙ Creating your panel and server...");

  const username = `user${telegramId}`;
  const password = Math.random().toString(36).slice(-8);
  const email = `${telegramId}@pterobot.com`;

  // 3. Create or Update User
  let pteroUserId = null;
  const allUsers = await listUsers();
  const existingUser = allUsers.find(u => u.attributes.username === username || u.attributes.email === email);

  if (existingUser) {
    console.log(`User found (ID: ${existingUser.attributes.id}). Updating password...`);
    pteroUserId = existingUser.attributes.id;
    await updateUser(pteroUserId, email, username, password);
  } else {
    const userResult = await createUser(email, username, password, false);
    if (!userResult.success) {
      return bot.sendMessage(telegramId, `❌ Error creating user: ${userResult.error}`);
    }
    pteroUserId = userResult.data.attributes.id;
  }

  // 4. Create Server
  const serverResult = await createServer(pteroUserId, `Server-${username}`);
  
  if (!serverResult.success) {
    return bot.sendMessage(telegramId, `❌ <b>Server Creation Failed:</b>\n${serverResult.error}`, { parse_mode: 'HTML' });
  }

  // 5. Save Data (Set panel_created to true)
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
                                     
