module.exports = (sequelize, DataTypes) => {
  const Acceso = sequelize.define('Acceso', {
    AccesoID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    Correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    ContrasenaHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    EsAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'Acceso',
    timestamps: false
  });

  Acceso.associate = (models) => {
    Acceso.hasOne(models.Usuario, {
      foreignKey: 'AccesoID',
      as: 'Usuario',
      onDelete: 'CASCADE'
    });
  };

  return Acceso;
};