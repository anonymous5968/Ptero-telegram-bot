// utils/mpesa.js
const axios = require('axios');

// --- YOUR CREDENTIALS ---
const CONSUMER_KEY = "OpklG6NcKn6ROXM0KJATPnFknMFhGHqAhuKVQ8GF5jaxMjhA";
const CONSUMER_SECRET = "z13foYmQRTYiP7SmaOplG6vatTzDmqgRCF5xyuGn75PBAS7iyVbFJletWWcEhBo6";
const PASSKEY = "Bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

const SHORTCODE = "174379"; // Safaricom Test Paybill

// ✅ YOUR HEROKU URL (Where Safaricom sends the receipt)
const CALLBACK_URL = "https://telegrambot-845ad1fd84e0.herokuapp.com/callback"; 

async function getAccessToken() {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { headers: { Authorization: `Basic ${auth}` } }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("❌ Token Error:", error.message);
        return null;
    }
}

async function sendStkPush(phoneNumber, amount, telegramId) {
    const token = await getAccessToken();
    if (!token) return { success: false, message: "Token generation failed" };

    // Format Date: YYYYMMDDHHmmss
    const date = new Date();
    const timestamp = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0') +
        date.getHours().toString().padStart(2, '0') +
        date.getMinutes().toString().padStart(2, '0') +
        date.getSeconds().toString().padStart(2, '0');

    // Generate Password
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    try {
        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phoneNumber,
                PartyB: SHORTCODE,
                PhoneNumber: phoneNumber,
                CallBackURL: CALLBACK_URL,
                AccountReference: `User_${telegramId}`,
                TransactionDesc: "Server Access"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { success: true, data: response.data };
    } catch (error) {
        const msg = error.response?.data?.errorMessage || error.message;
        return { success: false, message: msg };
    }
}

module.exports = { sendStkPush };
      
