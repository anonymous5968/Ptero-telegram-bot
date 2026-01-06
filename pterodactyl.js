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
      nest: 5,        
      egg: 15,        
      docker_image: "ghcr.io/pterodactyl/yolks:node_18",
      
      // 👇 OPTIMIZED STARTUP COMMAND
      // This checks: "If package.json exists AND node_modules folder is MISSING, then run npm install."
      // Otherwise, it skips installation and starts instantly.
      startup: "if [ -f /home/container/package.json ] && [ ! -d /home/container/node_modules ]; then npm install; fi; node {{CMD_RUN}}",
      
      environment: {
        CMD_RUN: "index.js", 
        JS_FILE: "index.js",
        NODE_ENV: "production"
      },
      limits: {
        memory: 0, swap: 0, disk: 0, io: 500, cpu: 0     
      },
      feature_limits: {
        databases: 1, backups: 1, allocations: 0
      },
      deploy: {
        locations: [1], dedicated_ip: false, port_range: []
      }
    }, { headers });
    return { success: true, data: response.data };
  } catch (err) {
    const errorMsg = err.response?.data?.errors?.[0]?.detail || err.message;
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
      
