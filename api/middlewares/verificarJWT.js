const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function verificarJWT(token) {
  if (!token) return null;

  try {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = verificarJWT;
