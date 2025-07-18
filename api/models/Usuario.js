module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    UsuarioID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    FechaRegistro: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Telefono: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UbicacionID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    AccesoID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Usuario',
    timestamps: false
  });

  Usuario.associate = (models) => {
    Usuario.belongsTo(models.Ubicacion, {
      foreignKey: 'UbicacionID',
      as: 'Ubicacion',
      onDelete: 'SET NULL'
    });

    Usuario.belongsTo(models.Acceso, {
      foreignKey: 'AccesoID',
      as: 'Acceso'
    });

    Usuario.hasMany(models.FotoUsuario, {
      foreignKey: 'UsuarioID',
      as: 'Fotos'
    });
    
    Usuario.hasMany(models.Solicitud, {
      foreignKey: 'AdoptanteID',
      as: 'SolicitudesRealizadas'
    });

    Usuario.hasMany(models.Adopcion, {
      foreignKey: 'PublicadorID',
      as: 'AdopcionesRecibidas'
    });

    Usuario.hasMany(models.Notificacion, {
      foreignKey: 'UsuarioID',
      as: 'Notificaciones'
    });

  };

  return Usuario;
};