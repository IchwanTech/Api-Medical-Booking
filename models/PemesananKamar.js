module.exports = (sequelize, DataTypes) => {
  const PemesananKamar = sequelize.define(
    "PemesananKamar",
    {
      id_pemesanan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_kamar: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tanggal_masuk: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      tanggal_keluar: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "checked_in",
          "checked_out",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      catatan: {
        type: DataTypes.TEXT,
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
      tableName: "pemesanan_kamar",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  PemesananKamar.associate = function (models) {
    PemesananKamar.belongsTo(models.User, { foreignKey: "id_user" });
    PemesananKamar.belongsTo(models.Kamar, { foreignKey: "id_kamar" });
    PemesananKamar.hasMany(models.RiwayatStatusPemesanan, {
      foreignKey: "id_pemesanan",
    });
    PemesananKamar.hasMany(models.Pembayaran, { foreignKey: "id_pemesanan" });
    PemesananKamar.hasMany(models.Review, { foreignKey: "id_pemesanan" });
  };

  return PemesananKamar;
};
