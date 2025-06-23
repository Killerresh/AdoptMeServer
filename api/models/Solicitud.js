module.exports = (sequelize, DataTypes) => {
  const Solicitud = sequelize.define('Solicitud', {
    SolicitudID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    AdoptanteID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    AdopcionID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Solicitud',
    timestamps: false
  });

  Solicitud.associate = (models) => {
    Solicitud.belongsTo(models.Usuario, {
      foreignKey: 'AdoptanteID',
      as: 'Adoptante'
    });

    Solicitud.belongsTo(models.Adopcion, {
      foreignKey: 'AdopcionID',
      as: 'Adopcion'
    });
  };

  return Solicitud;
};
