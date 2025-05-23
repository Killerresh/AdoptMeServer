module.exports = (sequelize, DataTypes) => {
  const Ubicacion = sequelize.define('Ubicacion', {
    UbicacionID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    Longitud: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false
    },
    Latitud: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false
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