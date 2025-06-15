const verificarJWT = require('../../middlewares/verificarJWT');
const grpc = require('@grpc/grpc-js');

function withAuth(handler) {
  return async (call, callback) => {
    try {
      const authHeaders = call.metadata.get('authorization');

      if (!authHeaders || authHeaders.length === 0) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: 'Token no proporcionado'
        });
      }

      const authHeader = authHeaders[0];

      if (!authHeader.startsWith('Bearer ') || authHeader.length <= 7) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: 'Token mal formado'
        });
      }

      const token = authHeader.slice(7).trim();
      const usuario = verificarJWT(token);

      if (!usuario) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: 'Token inválido'
        });
      }

      call.usuario = usuario;

      return handler(call, callback);

    } catch (err) {
      console.error('Error en interceptor withAuth:', err);
      return callback({
        code: grpc.status.UNAUTHENTICATED,
        message: 'Error interno de autenticación'
      });
    }
  };
}

module.exports = withAuth;
