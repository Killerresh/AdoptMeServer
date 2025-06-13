module.exports = (sequelize, DataTypes) => {
  const FotoMascota = sequelize.define('FotoMascota', {
    FotoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    MascotaID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UrlFoto: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'FotoMascota',
    timestamps: false
  });

  FotoMascota.associate = models => {
    FotoMascota.belongsTo(models.Mascota, {
      foreignKey: 'MascotaID',
      as: 'Mascota'
    });
  };

  return FotoMascota;
};