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
    AdoptanteID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
      }, {
    tableName: 'SolicitudAdopcion',
    timestamps: false
  });

  SolicitudAdopcion.associate = (models) => {
    SolicitudAdopcion.belongsTo(models.Mascota, {
      foreignKey: 'MascotaID'
    });
  };
  SolicitudAdopcion.associate = (models) => {
    SolicitudAdopcion.belongsTo(models.Usuario, {
      foreignKey: 'AdoptanteID'
    });
  };

  return SolicitudAdopcion;
};