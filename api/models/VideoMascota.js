module.exports = (sequelize, DataTypes) => {
  const VideoMascota = sequelize.define('VideoMascota', {
    VideoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    MascotaID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UrlVideo: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'VideoMascota',
    timestamps: false
  });

  VideoMascota.associate = models => {
    VideoMascota.belongsTo(models.Mascota, {
      foreignKey: 'MascotaID',
      as: 'Mascota'
    });
  };

  return VideoMascota;
};