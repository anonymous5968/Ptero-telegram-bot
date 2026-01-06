const axios = require('axios');

// --- HARDCODED CREDENTIALS ---
const PTERO_URL = "https://hero.brevo.host"; // Fixed: removed /admin for API calls
const API_KEY = "ptla_h7ZdStgd2cn22Wnyw4fXvmyNXRBrVQNzZMiskihllsJ";

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'Application/vnd.pterodactyl.v1+json'
};

// --- USER MANAGEMENT ---
async function createUser(email, username, password, isAdmin = false) {
  try {
    const response = await axios.post(`${PTERO_URL}/api/application/users`, {
      username, email, password, first_name: username, last_name: "User",
      root_admin: isAdmin
    }, { headers });
    return response.data;
  } catch (err) {
    console.error("Create User Error:", err.response?.data?.errors || err.message);
    return null;
  }
}

async function listUsers() {
  try {
    const response = await axios.get(`${PTERO_URL}/api/application/users`, { headers });
    return response.data.data;
  } catch (err) { return []; }
}

async function deleteUser(userId) {
  try {
    await axios.delete(`${PTERO_URL}/api/application/users/${userId}`, { headers });
    return true;
  } catch (err) { return false; }
}

// --- SERVER MANAGEMENT ---
async function createServer(userId, name) {
  try {
    const response = await axios.post(`${PTERO_URL}/api/application/servers`, {
      name: name,
      user: parseInt(userId),
      nest: 1, egg: 1, // Default Minecraft
      docker_image: "ghcr.io/pterodactyl/yolks:java_17",
      startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar",
      environment: { SERVER_JARFILE: "server.jar" },
      limits: { memory: 1024, swap: 0, disk: 1024, io: 500, cpu: 100 },
      feature_limits: { databases: 1, backups: 1 }
    }, { headers });
    return response.data;
  } catch (err) {
    console.error("Create Server Error:", err.response?.data?.errors || err.message);
    return null;
  }
}

async function listServers() {
  try {
    const response = await axios.get(`${PTERO_URL}/api/application/servers`, { headers });
    return response.data.data;
  } catch (err) { return []; }
}

async function deleteServer(serverId) {
  try {
    await axios.delete(`${PTERO_URL}/api/application/servers/${serverId}/force`, { headers });
    return true;
  } catch (err) { return false; }
}

module.exports = { createUser, listUsers, deleteUser, createServer, listServers, deleteServer };
  
