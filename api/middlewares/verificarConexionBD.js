const { getDb } = require('../config/db');

module.exports = async function verificarConexionBD(req, res, next) {
  const db = getDb();

  try {
    await db.sequelize.authenticate();
    next();
  } catch (error) {
    console.error('Error de conexión con base de datos:', error.message);
    return res.status(503).json({ error: 'Base de datos no disponible' });
  }
};
