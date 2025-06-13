module.exports = (sequelize, DataTypes) => {
  const FotoUsuario = sequelize.define('FotoUsuario', {
    FotoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    UsuarioID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UrlFoto: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'FotoUsuario',
    timestamps: false
  });

  FotoUsuario.associate = models => {
    FotoUsuario.belongsTo(models.Usuario, {
      foreignKey: 'UsuarioID',
      as: 'Usuario'
    });
  };

  return FotoUsuario;
};
