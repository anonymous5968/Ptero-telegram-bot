const axios = require('axios');

const PTERO_URL = "https://hero.brevo.host/admin";
const API_KEY = "ptla_h7ZdStgd2cn22Wnyw4fXvmyNXRBrVQNzZMiskihllsJ";

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'Application/vnd.pterodactyl.v1+json'
};

async function createUser(email, username, password) {
  try {
    const response = await axios.post(`${PTERO_URL}/api/application/users`, {
      username,
      email,
      password
    }, { headers });
    return response.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    return null;
  }
}

async function createServer(userId, name, memory=1024) {
  try {
    const response = await axios.post(`${PTERO_URL}/api/application/servers`, {
      name,
      user: userId,
      memory,
      cpu: 100,
      disk: 1024
    }, { headers });
    return response.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    return null;
  }
}

module.exports = { createUser, createServer };
