const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function autenticarTokenConRoles(rolesPermitidos = []) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ mensaje: 'Token requerido' });
    }

    jwt.verify(token, SECRET, (err, usuario) => {
      if (err) {
        return res.status(403).json({ mensaje: 'Token inválido' });
      }

      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({ mensaje: 'No tienes permiso para acceder a este recurso' });
      }

      req.usuario = usuario;
      next();
    });
  };
}

module.exports = autenticarTokenConRoles;