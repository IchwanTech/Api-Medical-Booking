module.exports = (sequelize, DataTypes) => {
  const RiwayatStatusPembayaran = sequelize.define(
    "RiwayatStatusPembayaran",
    {
      id_riwayat: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_pembayaran: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status_lama: {
        type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
        allowNull: false,
      },
      status_baru: {
        type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
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
      tableName: "riwayat_status_pembayaran",
      timestamps: false,
      underscored: true,
    }
  );

  RiwayatStatusPembayaran.associate = function (models) {
    RiwayatStatusPembayaran.belongsTo(models.Pembayaran, {
      foreignKey: "id_pembayaran",
    });
    RiwayatStatusPembayaran.belongsTo(models.User, {
      foreignKey: "id_user_pengubah",
    });
  };

  return RiwayatStatusPembayaran;
};
