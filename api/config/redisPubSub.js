const { createClient } = require('redis');
require("dotenv").config();

const redisPub = createClient({ url: process.env.REDIS_URL });
const redisSub = createClient({ url: process.env.REDIS_URL });

redisPub.on('error', (err) => console.error('Redis Pub Error: ', err));
redisSub.on('error', (err) => console.error('Redis Sub Error: ', err));

const conectarRedisPubSub = async () => {
    if (!redisPub.isOpen) await redisPub.connect();
    if (!redisSub.isOpen) await redisSub.connect();
};

module.exports = {
    redisPub,
    redisSub,
    conectarRedisPubSub
};