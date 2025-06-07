module.exports = (sequelize, DataTypes) => {
  const Ubicacion = sequelize.define('Ubicacion', {
    UbicacionID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    Longitud: {
      type: DataTypes.DECIMAL(19, 13),
      allowNull: true
    },
    Latitud: {
      type: DataTypes.DECIMAL(19, 13),
      allowNull: true
    },
    Ciudad: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Estado: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Pais: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Ubicacion',
    timestamps: false
  });

  Ubicacion.associate = (models) => {
    Ubicacion.hasMany(models.Usuario, {
      foreignKey: 'UbicacionID'
    });
  };

  return Ubicacion;
};