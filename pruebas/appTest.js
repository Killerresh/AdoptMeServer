require('dotenv').config();

const Server = require('../api/server/server');
const servidor = new Server();

module.exports = (async () => {
    await servidor.init();
    return servidor.getApp();
})();