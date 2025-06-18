module.exports = (sequelize, DataTypes) => {
  const Notificacion = sequelize.define('Notificacion', {
    NotificacionID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    UsuarioID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    FechaCreacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    Leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'Notificacion',
    timestamps: false
  });

  Notificacion.associate = (models) => {
    Notificacion.belongsTo(models.Usuario, {
      foreignKey: 'UsuarioID',
      as: 'Usuario',
      onDelete: 'CASCADE'
    });
  };

  return Notificacion;
};
