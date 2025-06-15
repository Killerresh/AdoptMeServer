const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function verificarJWT(...args) {
  if (args.length === 1 && typeof args[0] === 'string') {
    const token = args[0];
    try {
      return decoded = jwt.verify(token, SECRET);
    } catch (error) {
      console.log('Error al verificar token:', error.message);
      console.log(error.stack)
      return null;
    }
  }

  const [req, res, next] = args;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = verificarJWT;
