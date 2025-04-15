module.exports = (sequelize, DataTypes) => {
  const RiwayatStokObat = sequelize.define(
    "RiwayatStokObat",
    {
      id_riwayat: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_obat: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stok_sebelum: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stok_sesudah: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jumlah_perubahan: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipe_perubahan: {
        type: DataTypes.ENUM("penambahan", "pengurangan"),
        allowNull: false,
      },
      catatan: {
        type: DataTypes.TEXT,
      },
      id_user_pengubah: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "riwayat_stok_obat",
      timestamps: false,
      underscored: true,
    }
  );

  RiwayatStokObat.associate = function (models) {
    RiwayatStokObat.belongsTo(models.Obat, { foreignKey: "id_obat" });
    RiwayatStokObat.belongsTo(models.User, { foreignKey: "id_user_pengubah" });
  };

  return RiwayatStokObat;
};
