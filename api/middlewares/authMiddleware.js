const verificarJWT = require('./verificarJWT');

function autenticarTokenConRoles(rolesPermitidos = []) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const usuario = verificarJWT(authHeader);

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }

    if (rolesPermitidos.length && !rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    req.usuario = usuario;
    next();
  };
}

module.exports = autenticarTokenConRoles;