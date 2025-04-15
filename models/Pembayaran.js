module.exports = (sequelize, DataTypes) => {
  const Pembayaran = sequelize.define(
    "Pembayaran",
    {
      id_pembayaran: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_janji: {
        type: DataTypes.INTEGER,
      },
      id_pemesanan: {
        type: DataTypes.INTEGER,
      },
      id_layanan: {
        type: DataTypes.INTEGER,
      },
      jumlah: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      jumlah_bpjs: {
        type: DataTypes.DECIMAL(12, 2),
      },
      metode: {
        type: DataTypes.ENUM(
          "tunai",
          "kartu_kredit",
          "kartu_debit",
          "e-wallet",
          "transfer_bank",
          "bpjs"
        ),
        allowNull: false,
      },
      no_klaim_bpjs: {
        type: DataTypes.STRING(50),
      },
      status: {
        type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },
      tanggal_bayar: {
        type: DataTypes.DATE,
      },
      bukti_pembayaran: {
        type: DataTypes.STRING(255),
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
      tableName: "pembayaran",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  Pembayaran.associate = function (models) {
    Pembayaran.belongsTo(models.User, { foreignKey: "id_user" });
    Pembayaran.belongsTo(models.JanjiTemu, { foreignKey: "id_janji" });
    Pembayaran.belongsTo(models.PemesananKamar, { foreignKey: "id_pemesanan" });
    Pembayaran.belongsTo(models.Layanan, { foreignKey: "id_layanan" });
    Pembayaran.hasMany(models.RiwayatStatusPembayaran, {
      foreignKey: "id_pembayaran",
    });
  };

  return Pembayaran;
};
