const crypto = require('crypto');

// for haching password

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

module.exports = { hashPassword, escapeHtml };
