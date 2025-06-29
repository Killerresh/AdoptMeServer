module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    ChatID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    RemitenteID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    DestinatarioID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    FechaEnvio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Chat',
    timestamps: false
  });

  Chat.associate = (models) => {
    Chat.belongsTo(models.Usuario, {
      foreignKey: 'RemitenteID',
      as: 'Remitente',
      onDelete: 'CASCADE'
    });

    Chat.belongsTo(models.Usuario, {
      foreignKey: 'DestinatarioID',
      as: 'Destinatario',
      onDelete: 'CASCADE'
    });
  };

  return Chat;
};
