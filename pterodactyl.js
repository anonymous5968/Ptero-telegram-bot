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

async function updateUser(userId, email, username, password) {
  try {
    const response = await axios.patch(`${PTERO_URL}/api/application/users/${userId}`, {
      username, email, password, first_name: username, last_name: "User"
    }, { headers });
    return { success: true, data: response.data };
  } catch (err) {
    return { success: false, error: err.message };
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
    // This is the EXACT startup command from your manual server
    // We escape the $ signs so JavaScript doesn't try to read them as variables
    const startupCmd = `if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z \${NODE_PACKAGES} ]]; then /usr/local/bin/npm install \${NODE_PACKAGES}; fi; if [[ ! -z \${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall \${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; if [[ ! -z \${CUSTOM_ENVIRONMENT_VARIABLES} ]]; then vars=$(echo \${CUSTOM_ENVIRONMENT_VARIABLES} | tr ";" "\\n"); for line in $vars; do export $line; done fi; /usr/local/bin/{{CMD_RUN}}`;

    const response = await axios.post(`${PTERO_URL}/api/application/servers`, {
      name: name,
      user: parseInt(userId),
      nest: 5,        
      egg: 15,        
      
      // 👇 THIS IS THE KEY FIX (Using the Cached Image)
      docker_image: "ghcr.io/parkervcp/yolks:nodejs_24",
      
      startup: startupCmd,
      
      environment: {
        CMD_RUN: "node index.js", 
        AUTO_UPDATE: "0",
        NODE_PACKAGES: "",
        UNNODE_PACKAGES: "",
        CUSTOM_ENVIRONMENT_VARIABLES: "",
        
        // Standard vars
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

module.exports = { createUser, updateUser, listUsers, deleteUser, createServer, listServers, deleteServer };

