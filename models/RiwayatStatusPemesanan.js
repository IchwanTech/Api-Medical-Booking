module.exports = (sequelize, DataTypes) => {
  const RiwayatStatusPemesanan = sequelize.define(
    "RiwayatStatusPemesanan",
    {
      id_riwayat: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_pemesanan: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status_lama: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "checked_in",
          "checked_out",
          "cancelled"
        ),
        allowNull: false,
      },
      status_baru: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "checked_in",
          "checked_out",
          "cancelled"
        ),
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
      tableName: "riwayat_status_pemesanan",
      timestamps: false,
      underscored: true,
    }
  );

  RiwayatStatusPemesanan.associate = function (models) {
    RiwayatStatusPemesanan.belongsTo(models.PemesananKamar, {
      foreignKey: "id_pemesanan",
    });
    RiwayatStatusPemesanan.belongsTo(models.User, {
      foreignKey: "id_user_pengubah",
    });
  };

  return RiwayatStatusPemesanan;
};
