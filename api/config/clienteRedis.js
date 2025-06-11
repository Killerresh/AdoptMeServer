const { createClient } = require("redis")
require("dotenv").config();

const redis = createClient({
    url: process.env.REDIS_URL
}); 

redis.on("error", (err) => console.error("Redis error: ", err));

(async () => {
    await redis.connect();
})();

module.exports = redis;