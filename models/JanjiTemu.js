module.exports = (sequelize, DataTypes) => {
  const JanjiTemu = sequelize.define(
    "JanjiTemu",
    {
      id_janji: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_dokter: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_jadwal: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_antrian: {
        type: DataTypes.INTEGER,
      },
      tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      keluhan: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM("pending", "confirmed", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      is_bpjs: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      rujukan_bpjs: {
        type: DataTypes.STRING(100),
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
      tableName: "janji_temu",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  JanjiTemu.associate = function (models) {
    JanjiTemu.belongsTo(models.Dokter, { foreignKey: "id_dokter" });
    JanjiTemu.belongsTo(models.User, { foreignKey: "id_user" });
    JanjiTemu.belongsTo(models.JadwalDokter, { foreignKey: "id_jadwal" });
    JanjiTemu.belongsTo(models.Antrian, { foreignKey: "id_antrian" });
    JanjiTemu.hasMany(models.RiwayatStatusJanji, { foreignKey: "id_janji" });
    JanjiTemu.hasMany(models.RekamMedis, { foreignKey: "id_janji" });
    JanjiTemu.hasMany(models.Pembayaran, { foreignKey: "id_janji" });
  };

  return JanjiTemu;
};
