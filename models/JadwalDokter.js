module.exports = (sequelize, DataTypes) => {
  const JadwalDokter = sequelize.define(
    "JadwalDokter",
    {
      id_jadwal: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_dokter: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hari: {
        type: DataTypes.ENUM(
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
          "Minggu"
        ),
        allowNull: false,
      },
      jam_mulai: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      jam_selesai: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      kuota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      durasi_per_pasien: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
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
      tableName: "jadwal_dokter",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  JadwalDokter.associate = function (models) {
    JadwalDokter.belongsTo(models.Dokter, { foreignKey: "id_dokter" });
    JadwalDokter.hasMany(models.JanjiTemu, { foreignKey: "id_jadwal" });
    JadwalDokter.hasMany(models.Antrian, { foreignKey: "id_jadwal" });
  };

  return JadwalDokter;
};
