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
    Titulo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Tipo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    FechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    Leida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    ReferenciaID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ReferenciaTipo: {
      type: DataTypes.STRING(50),
      allowNull: true
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
