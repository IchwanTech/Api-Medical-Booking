module.exports = (sequelize, DataTypes) => {
  const Kamar = sequelize.define(
    "Kamar",
    {
      id_kamar: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_tipe: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nomor_kamar: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("tersedia", "terisi", "pemeliharaan"),
        allowNull: false,
        defaultValue: "tersedia",
      },
      lantai: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "kamar",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  Kamar.associate = function (models) {
    Kamar.belongsTo(models.TipeKamar, { foreignKey: "id_tipe" });
    Kamar.hasMany(models.FotoKamar, { foreignKey: "id_kamar" });
    Kamar.hasMany(models.PemesananKamar, { foreignKey: "id_kamar" });
  };

  return Kamar;
};
