module.exports = (sequelize, DataTypes) => {
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
      allowNull: false
    },
    AccesoID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Usuario',
    timestamps: false
  });

  Usuario.associate = (models) => {
    Usuario.belongsTo(models.Ubicacion, {
      foreignKey: 'UbicacionID'
    });
  };

  Usuario.associate = (models) => {
    Usuario.belongsTo(models.Acceso, {
      foreignKey: 'AccesoID'
    });
  };

  return Usuario;
};