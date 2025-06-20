module.exports = (sequelize, DataTypes) => {
  const SolicitudAdopcion = sequelize.define('SolicitudAdopcion', {
    SolicitudAdopcionID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    FechaSolicitud: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    MascotaID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    PublicadorID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UbicacionID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }}, {
    tableName: 'SolicitudAdopcion',
    timestamps: false
  });

  SolicitudAdopcion.associate = (models) => {
    SolicitudAdopcion.belongsTo(models.Mascota, {
      foreignKey: 'MascotaID',
      as: 'Mascota'
    });

    SolicitudAdopcion.belongsTo(models.Usuario, {
      foreignKey: 'PublicadorID',
      as: 'Publicador'
    });

    SolicitudAdopcion.belongsTo(models.Ubicacion, {
      foreignKey: 'UbicacionID',
      as: 'Ubicacion'
    });
  };

  return SolicitudAdopcion;
};