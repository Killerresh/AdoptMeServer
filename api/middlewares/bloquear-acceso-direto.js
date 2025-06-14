module.exports = function bloquearAccesoDirecto(req, res, next) {
  try {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];

    if (!forwardedFor && !realIp) {
      return res.status(403).json({ error: 'Acceso directo no permitido' });
    }

    next();
  } catch (error) {
    console.error('Error en middleware bloquearAccesoDirecto:', error);
    next(error);
  }
};
