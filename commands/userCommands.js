// commands/userCommands.js
const { createUser, updateUser, createServer, listUsers } = require('../pterodactyl');
const { sendStkPush } = require('../utils/mpesa');
const db = require('../firebase');

// 1. Create Panel
async function createPanel(bot, msg) {
  const telegramId = msg.from.id;
  const userRef = db.collection('users').doc(telegramId.toString());
  
  let doc;
  try { doc = await userRef.get(); } catch (e) { return bot.sendMessage(telegramId, `❌ DB Error: ${e.message}`); }

  // Check Payment
  if (!doc.exists || !doc.data().paid) {
    return bot.sendMessage(telegramId, "❌ <b>Access Denied:</b> You must pay first.\nUse /pay 2547XXXXXXXX", { parse_mode: 'HTML' });
  }
  
  // Verify if user already has a panel
  if (doc.data().panel_created) {
    return bot.sendMessage(telegramId, `⚠ You already have a panel.\n<b>Username:</b> ${doc.data().username}\n<b>Password:</b> ${doc.data().password}`, { parse_mode: 'HTML' });
  }

  bot.sendMessage(telegramId, "⚙ <b>Creating your server...</b>\nPlease wait up to 30 seconds.", { parse_mode: 'HTML' });

  // Generate Credentials
  const username = `user${telegramId}`;
  const password = Math.random().toString(36).slice(-8) + "1!";
  const email = `${username}@panel.com`;

  // Create Pterodactyl User
  let pteroUserId = doc.data().ptero_id;
  if (!pteroUserId) {
    const userResult = await createUser(email, username, password, false);
    if (!userResult.success) {
      // Check if user exists but we lost the ID
      if(userResult.error.includes("exists")) {
          // Try to find them
          const allUsers = await listUsers();
          const existing = allUsers.find(u => u.attributes.email === email);
          if(existing) pteroUserId = existing.attributes.id;
          else return bot.sendMessage(telegramId, `❌ Error: User exists but ID not found.`);
      } else {
          return bot.sendMessage(telegramId, `❌ Error creating user: ${userResult.error}`);
      }
    } else {
        pteroUserId = userResult.data.attributes.id;
    }
  }

  // Create Server
  const serverResult = await createServer(pteroUserId, `Server-${username}`);
  
  if (!serverResult.success) {
    return bot.sendMessage(telegramId, `❌ <b>Server Creation Failed:</b>\n${serverResult.error}`, { parse_mode: 'HTML' });
  }

  // Save to DB
  await userRef.set({ 
    username, password, email, panel_created: true, ptero_id: pteroUserId 
  }, { merge: true });

  bot.sendMessage(telegramId, `✅ <b>Panel Created!</b>\n\n🔗 <b>URL:</b> https://hero.brevo.host\n👤 <b>User:</b> ${username}\n🔑 <b>Pass:</b> ${password}`, { parse_mode: 'HTML' });
}

// 2. User Info
async function userInfo(bot, msg) {
  const telegramId = msg.from.id;
  const doc = await db.collection('users').doc(telegramId.toString()).get();
  if (!doc.exists) return bot.sendMessage(telegramId, "❌ You are not registered.");
  const data = doc.data();
  bot.sendMessage(telegramId, `👤 <b>User Info</b>\n\n<b>Paid:</b> ${data.paid ? '✅ Yes' : '❌ No'}\n<b>Server Created:</b> ${data.panel_created ? 'Yes' : 'No'}`, { parse_mode: 'HTML' });
}

// 3. Initiate Payment (NEW)
async function initiatePayment(bot, msg) {
    const telegramId = msg.from.id;
    const chatId = msg.chat.id;
    const text = msg.text.split(' '); // /pay 254712345678

    if (text.length < 2) {
        return bot.sendMessage(chatId, "⚠ <b>Usage:</b> /pay 2547XXXXXXXX\nExample: <code>/pay 254712345678</code>", { parse_mode: 'HTML' });
    }

    let phoneNumber = text[1];
    const amount = 1; // 1 KES for testing

    // Ensure phone starts with 254 (Basic check)
    if (phoneNumber.startsWith('0')) phoneNumber = '254' + phoneNumber.slice(1);
    if (phoneNumber.startsWith('+')) phoneNumber = phoneNumber.slice(1);

    bot.sendMessage(chatId, `📲 Sending request to ${phoneNumber}... Check your phone!`);

    // 1. Save Phone Number to DB (So we can match the payment later)
    await db.collection('users').doc(telegramId.toString()).set({
        phoneNumber: Number(phoneNumber), // Store as number to match Safaricom format
        timestamp: new Date()
    }, { merge: true });

    // 2. Send Request
    const result = await sendStkPush(phoneNumber, amount, telegramId);

    if (result.success) {
        bot.sendMessage(chatId, "✅ <b>Prompt Sent!</b>\nEnter your PIN.\nOnce paid, wait for the confirmation message here.", { parse_mode: 'HTML' });
    } else {
        bot.sendMessage(chatId, `❌ Error: ${result.message}`);
    }
}

module.exports = { createPanel, userInfo, initiatePayment };
    
