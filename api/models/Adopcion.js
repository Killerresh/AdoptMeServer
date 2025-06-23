module.exports = (sequelize, DataTypes) => {
  const Adopcion = sequelize.define('Adopcion', {
    AdopcionID: {
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
    tableName: 'Adopcion',
    timestamps: false
  });

  Adopcion.associate = (models) => {
    Adopcion.belongsTo(models.Mascota, {
      foreignKey: 'MascotaID',
      as: 'Mascota'
    });

    Adopcion.belongsTo(models.Usuario, {
      foreignKey: 'PublicadorID',
      as: 'Publicador'
    });

    Adopcion.belongsTo(models.Ubicacion, {
      foreignKey: 'UbicacionID',
      as: 'Ubicacion'
    });
  };

  return Adopcion;
};