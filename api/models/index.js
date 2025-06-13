const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');

function initModels(sequelize) {
  const db = {};

  fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.js'))
    .forEach(file => {
      const modelDefiner = require(path.join(__dirname, file));
      const model = modelDefiner(sequelize, DataTypes);
      db[model.name] = model;
    });

  Object.keys(db).forEach(modelName => {
    if (typeof db[modelName].associate === 'function') {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = require('sequelize');

  return db;
}

module.exports = initModels;
