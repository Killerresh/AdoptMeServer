module.exports = (sequelize, DataTypes) => {
  const Mascota = sequelize.define('Mascota', {
    MascotaID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Especie: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Raza: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Edad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Sexo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Tamaño: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Descripcion: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Mascota',
    timestamps: false
  });

  Mascota.associate = (models) => {
    Mascota.hasMany(models.FotoMascota, {
      foreignKey: 'MascotaID',
      as: 'fotos'
    });

    Mascota.hasMany(models.VideoMascota, {
      foreignKey: 'MascotaID',
      as: 'videos'
    });

    Mascota.hasMany(models.SolicitudAdopcion, {
      foreignKey: 'MascotaID',
      as: 'Solicitudes'
    });
  };
  
  return Mascota;
};