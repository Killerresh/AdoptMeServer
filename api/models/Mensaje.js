module.exports = (sequelize, DataTypes) => {
  const Mensaje = sequelize.define('Mensaje', {
    MensajeID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    RemitenteID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ReceptorID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    FechaEnvio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    Contenido: {
        type: DataTypes.TEXT,
        allowNull: false
    }
  }, {
    tableName: 'Mensaje',
    timestamps: false
  });

  Mensaje.associate = (models) => {
    Mensaje.belongsTo(models.Usuario, {
      foreignKey: 'RemitenteID',
      as: 'Remitente'
    });

    Mensaje.belongsTo(models.Usuario, {
        foreignKey: 'ReceptorID',
        as: 'Receptor'
    });
  };

  return Mensaje;
};