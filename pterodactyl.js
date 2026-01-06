
const axios = require('axios');

// --- CREDENTIALS ---
const PTERO_URL = "https://hero.brevo.host";
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
    return { success: true, data: response.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.errors?.[0]?.detail || err.message };
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
      
      // 👇 UPDATED FOR NODE.JS
      nest: 5,        // Generic/Bot Nest
      egg: 15,        // Node.js Egg
      docker_image: "ghcr.io/pterodactyl/yolks:node_18", // Node.js Image
      startup: "if [ -f /home/container/package.json ]; then npm install; fi; node index.js", // Standard Node Startup
      environment: {
        // Node usually doesn't require specific env vars, but we pass an empty object or defaults
        NODE_ENV: "production"
      },

      // 👇 UNLIMITED RESOURCES
      limits: {
        memory: 0, // 0 = Unlimited
        swap: 0,   // 0 = Unlimited
        disk: 0,   // 0 = Unlimited
        io: 500,
        cpu: 0     // 0 = Unlimited
      },
      feature_limits: {
        databases: 1,
        backups: 1,
        allocations: 0
      },
      deploy: {
        locations: [1], // Still uses Location 1
        dedicated_ip: false,
        port_range: []
      }
    }, { headers });
    return { success: true, data: response.data };
  } catch (err) {
    const errorMsg = err.response?.data?.errors?.[0]?.detail || err.message;
    console.error("Create Server Error:", errorMsg);
    return { success: false, error: errorMsg };
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
    await axios.delete(`${PTERO_URL}/api/application/servers/${serverId}`, { headers });
    return true;
  } catch (err) { return false; }
}

module.exports = { createUser, listUsers, deleteUser, createServer, listServers, deleteServer };
    
