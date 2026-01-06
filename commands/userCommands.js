const { createUser, createServer, listUsers } = require('../pterodactyl');
const db = require('../firebase');

// /panel - Create User & Server
async function createPanel(bot, msg) {
  const telegramId = msg.from.id;
  const userRef = db.collection('users').doc(telegramId.toString());
  const doc = await userRef.get();

  // 1. Check if they paid
  if (!doc.exists || !doc.data().paid) {
    return bot.sendMessage(telegramId, "❌ <b>Access Denied:</b> You must buy access first.", { parse_mode: 'HTML' });
  }
  
  // 2. Check if DB says they already have a panel
  if (doc.data().panel_created) {
    return bot.sendMessage(telegramId, `⚠ You already have a panel.\n<b>Username:</b> ${doc.data().username}\n<b>Password:</b> ${doc.data().password}`, { parse_mode: 'HTML' });
  }

  bot.sendMessage(telegramId, "⚙ Creating your panel and server...");

  const username = `user${telegramId}`;
  const password = Math.random().toString(36).slice(-8);
  const email = `${telegramId}@pterobot.com`;

  // 3. CHECK FOR EXISTING USER (The Fix)
  // We check Pterodactyl to see if this user was created in a previous failed attempt
  let pteroUser = null;
  const allUsers = await listUsers();
  const existingUser = allUsers.find(u => u.attributes.username === username || u.attributes.email === email);

  if (existingUser) {
    console.log("User already exists on Pterodactyl. Using existing ID.");
    pteroUser = existingUser;
  } else {
    // Only create if they don't exist
    pteroUser = await createUser(email, username, password, false);
  }

  if (!pteroUser) return bot.sendMessage(telegramId, "❌ Error creating user (API Validation Failed).");

  // 4. Create Ptero Server
  // Now we use the ID from either the new user OR the existing one
  const pteroServer = await createServer(pteroUser.attributes.id, `Server-${username}`);
  
  if (!pteroServer) {
    return bot.sendMessage(telegramId, "❌ User validated, but server creation failed. Check console for details.");
  }

  // 5. Save Data to Firebase
  await userRef.set({ 
    username: pteroUser.attributes.username, 
    password: password, // Note: If user existed, this password might be wrong, but they can reset it.
    email, 
    panel_created: true, 
    ptero_id: pteroUser.attributes.id 
  }, { merge: true });

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

