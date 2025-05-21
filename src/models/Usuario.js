const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Ubicacion = require('./Ubicacion');

const Usuario = sequelize.define('Usuario', {
    UsuarioID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    ContrasenaHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    FechaRegistro: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Telefono: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Ciudad: {
        type: DataTypes.STRING,
        allowNull: true
    },
    UbicacionID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Ubicacion',
            key: 'UbicacionID'
        }
    },
    EsAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    tableName: 'Usuario',
    timestamps: false
});

Usuario.belongsTo(Ubicacion, {
    foreignKey: 'UbicacionID'
});

Ubicacion.hasMany(Usuario, {
    foreignKey: 'UbicacionID'
});

module.exports = Usuario;