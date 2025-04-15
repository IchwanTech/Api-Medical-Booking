module.exports = (sequelize, DataTypes) => {
  const Dokter = sequelize.define(
    "Dokter",
    {
      id_dokter: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nama: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      spesialis: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      no_str: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      foto: {
        type: DataTypes.STRING(255),
      },
      biaya_konsultasi: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      biaya_bpjs: {
        type: DataTypes.DECIMAL(12, 2),
      },
      deskripsi: {
        type: DataTypes.TEXT,
      },
      pengalaman: {
        type: DataTypes.INTEGER,
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
      tableName: "dokter",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  Dokter.associate = function (models) {
    Dokter.hasMany(models.JadwalDokter, { foreignKey: "id_dokter" });
    Dokter.hasMany(models.JanjiTemu, { foreignKey: "id_dokter" });
    Dokter.hasMany(models.RekamMedis, { foreignKey: "id_dokter" });
    Dokter.hasMany(models.Review, { foreignKey: "id_dokter" });
  };

  return Dokter;
};
