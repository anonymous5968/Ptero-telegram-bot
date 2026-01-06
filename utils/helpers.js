
const db = require('../firebase');

async function isPaid(telegramId) {
  const userRef = db.collection('users').doc(telegramId.toString());
  const doc = await userRef.get();
  return doc.exists && doc.data().paid === true;
}

module.exports = { isPaid };
