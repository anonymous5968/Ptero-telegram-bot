const ptero = require('../pterodactyl');
const db = require('../firebase');

// --- HARDCODED ADMIN ID ---
const ADMIN_IDS = ["5333338062"]; 

function isAdmin(msg) {
  return ADMIN_IDS.includes(msg.from.id.toString());
}

// 1. List Servers
async function listServers(bot, msg) {
  if (!isAdmin(msg)) return;
  bot.sendMessage(msg.chat.id, "🔄 Fetching servers...");
  const servers = await ptero.listServers();
  let txt = "🖥 <b>Server List:</b>\n";
  servers.slice(0, 15).forEach(s => txt += `🆔 <code>${s.attributes.id}</code> | ${s.attributes.name}\n`);
  bot.sendMessage(msg.chat.id, txt, { parse_mode: 'HTML' });
}

// 2. List Users
async function listUsers(bot, msg) {
  if (!isAdmin(msg)) return;
  bot.sendMessage(msg.chat.id, "🔄 Fetching users...");
  const users = await ptero.listUsers();
  let txt = "bust_in_silhouette <b>User List:</b>\n";
  users.slice(0, 15).forEach(u => txt += `🆔 <code>${u.attributes.id}</code> | ${u.attributes.username}\n`);
  bot.sendMessage(msg.chat.id, txt, { parse_mode: 'HTML' });
}

// 3. Add Server
async function addServer(bot, msg, args) {
  if (!isAdmin(msg)) return;
  const [pteroUserId, ...nameParts] = args;
  const name = nameParts.join(' ') || "New-Server";
  
  if (!pteroUserId) return bot.sendMessage(msg.chat.id, "⚠ Usage: /addsrv <PteroUserID> <Name>");

  bot.sendMessage(msg.chat.id, "⚙ Creating server...");
  const srv = await ptero.createServer(pteroUserId, name);
  if (srv) bot.sendMessage(msg.chat.id, `✅ Server '${name}' created! ID: ${srv.attributes.id}`);
  else bot.sendMessage(msg.chat.id, "❌ Failed to create server.");
}

// 4. Delete Server
async function delServer(bot, msg, args) {
  if (!isAdmin(msg)) return;
  const serverId = args[0];
  if (!serverId) return bot.sendMessage(msg.chat.id, "Usage: /delsrv <id>");
  
  const success = await ptero.deleteServer(serverId);
  bot.sendMessage(msg.chat.id, success ? `🗑 Server ${serverId} deleted.` : "❌ Failed.");
}

// 5. Delete User
async function delUser(bot, msg, args) {
  if (!isAdmin(msg)) return;
  const userId = args[0];
  if (!userId) return bot.sendMessage(msg.chat.id, "Usage: /delusr <id>");

  const success = await ptero.deleteUser(userId);
  bot.sendMessage(msg.chat.id, success ? `🗑 User ${userId} deleted.` : "❌ Failed.");
}

// 6. Create Admin
async function createAdmin(bot, msg) {
  if (!isAdmin(msg)) return;
  const password = Math.random().toString(36).slice(-8);
  const username = `admin_${Math.floor(Math.random() * 1000)}`;
  const email = `${username}@admin.com`;

  const user = await ptero.createUser(email, username, password, true); // true = Root Admin
  if (user) {
     bot.sendMessage(msg.chat.id, `🛡 <b>Admin Created!</b>\nUser: ${username}\nPass: ${password}`, { parse_mode: 'HTML' });
  } else {
     bot.sendMessage(msg.chat.id, "❌ Failed to create admin.");
  }
}

module.exports = { listServers, listUsers, addServer, delServer, delUser, createAdmin };

