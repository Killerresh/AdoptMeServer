const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ubicacion = sequelize.define('Ubicacion', {
    UbicacionID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Longitud: {
        type: DataTypes.DECIMAL(9,6),
        allowNull: false
    },
    Latitud: {
        type: DataTypes.DECIMAL(9,6),
        allowNull: false
    }
}, {
    tableName: 'Ubicacion',
    timestamps: false
});

module.exports = Ubicacion;