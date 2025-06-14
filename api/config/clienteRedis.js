const { createClient } = require("redis")
require("dotenv").config();

const redis = createClient({
    url: process.env.REDIS_URL,
    database: process.env.NODE_ENV === 'test' ? 1 : 0
}); 

redis.on("error", (err) => console.error("Redis error: ", err));

(async () => {
  let intentos = 10;
  while (intentos > 0) {
    try {
      await redis.connect();
      console.log("Redis conectado");
      break;
    } catch (err) {
      intentos--;
      console.error(`Redis aún no disponible (${10 - intentos}/10). Reintentando...`, err.message);
      await new Promise(res => setTimeout(res, 3000));
    }
  }

  if (intentos === 0) {
    console.error("No se pudo conectar a Redis después de múltiples intentos");
    process.exit(1);
  }
})();


module.exports = redis;