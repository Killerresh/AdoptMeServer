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
      type: DataTypes.INTEGER,
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
    },
    PublicadorID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UbicacionID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Mascota',
    timestamps: false
  });

  Mascota.associate = (models) => {
    Mascota.belongsTo(models.Usuario, {
      foreignKey: 'PublicadorID'
    });
  };
  Mascota.associate = (models) => {
    Mascota.belongsTo(models.Ubicacion, {
      foreignKey: 'UbicacionID'
    });
  };

  Mascota.associate = (models) => {
    Mascota.hasMany(models.SolicitudAdopcion, {
      foreignKey: 'MascotaID'
    });
  };


  return Mascota;
};