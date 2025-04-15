module.exports = (sequelize, DataTypes) => {
  const RekamMedis = sequelize.define(
    "RekamMedis",
    {
      id_rekam: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_dokter: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_janji: {
        type: DataTypes.INTEGER,
      },
      tanggal: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      diagnosa: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      anamnesis: {
        type: DataTypes.TEXT,
      },
      pemeriksaan_fisik: {
        type: DataTypes.TEXT,
      },
      tindakan: {
        type: DataTypes.TEXT,
      },
      catatan: {
        type: DataTypes.TEXT,
      },
      is_bpjs: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      tableName: "rekam_medis",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  RekamMedis.associate = function (models) {
    RekamMedis.belongsTo(models.User, { foreignKey: "id_user" });
    RekamMedis.belongsTo(models.Dokter, { foreignKey: "id_dokter" });
    RekamMedis.belongsTo(models.JanjiTemu, { foreignKey: "id_janji" });
    RekamMedis.hasMany(models.LampiranRekamMedis, { foreignKey: "id_rekam" });
    RekamMedis.hasMany(models.ResepObat, { foreignKey: "id_rekam" });
  };

  return RekamMedis;
};
