const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const userCmds = require('./commands/userCommands');
const adminCmds = require('./commands/adminCommands');
const db = require('./firebase');

// --- CONFIG ---
const BOT_TOKEN = "8583326462:AAH03fQz7mjPp7PbLWkasXPn9QGyrWOCy6M";
const PORT = process.env.PORT || 3000; 

// 1. Setup Bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// 2. Setup Web Server (For M-Pesa)
const app = express();
app.use(bodyParser.json());

// --- M-PESA CALLBACK ROUTE ---
app.post('/callback', async (req, res) => {
    console.log("📩 M-Pesa Callback Received");
    
    const body = req.body.Body.stkCallback;

    if (body.ResultCode === 0) {
        // Payment Success!
        const meta = body.CallbackMetadata.Item;
        const amount = meta.find(i => i.Name === 'Amount').Value;
        const phone = meta.find(i => i.Name === 'PhoneNumber').Value; // e.g., 254712345678

        console.log(`💰 Payment Confirmed: ${amount} KES from ${phone}`);

        // 🔍 Find the user with this phone number
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('phoneNumber', '==', phone).get();

        if (snapshot.empty) {
            console.log("⚠ Payment received but no matching user found in DB.");
        } else {
            snapshot.forEach(async doc => {
                // Update User to PAID
                await doc.ref.update({ paid: true });
                
                // Notify User
                bot.sendMessage(doc.id, "✅ <b>Payment Received!</b>\nYour account is verified.\nYou can now use /panel to create your server.", { parse_mode: 'HTML' });
                console.log(`✅ User ${doc.id} unlocked.`);
            });
        }
    } else {
        console.log("❌ Payment Failed/Cancelled by User");
    }
    
    res.send("OK");
});

// Start Server
app.listen(PORT, () => {
    console.log(`🌍 Server running on port ${PORT}`);
});

// --- BOT COMMANDS ---
bot.setMyCommands([
    { command: '/panel', description: 'Create panel' },
    { command: '/pay', description: 'Pay via M-Pesa' },
    { command: '/info', description: 'Account Info' },
    { command: '/listsrv', description: 'List servers (Admin)' }
]);

bot.onText(/\/panel/, (msg) => userCmds.createPanel(bot, msg));
bot.onText(/\/info/, (msg) => userCmds.userInfo(bot, msg));
bot.onText(/\/pay/, (msg) => userCmds.initiatePayment(bot, msg));

// Admin
bot.onText(/\/listsrv/, (msg) => adminCmds.listServers(bot, msg));
bot.onText(/\/addsrv (.+)/, (msg, match) => adminCmds.addServer(bot, msg, match[1].split(' ')));
bot.onText(/\/delsrv (.+)/, (msg, match) => adminCmds.delServer(bot, msg, match[1].split(' ')));
bot.onText(/\/delusr (.+)/, (msg, match) => adminCmds.delUser(bot, msg, match[1].split(' ')));
bot.onText(/\/admin/, (msg) => adminCmds.createAdmin(bot, msg));
bot.onText(/\/listusr/, (msg) => adminCmds.listUsers(bot, msg));
          
