module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nama: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("pasien", "admin", "dokter", "perawat"),
        allowNull: false,
        defaultValue: "pasien",
      },
      no_telp: {
        type: DataTypes.STRING(15),
        validate: {
          is: /^[0-9]{10,15}$/,
        },
      },
      alamat: {
        type: DataTypes.TEXT,
      },
      tanggal_lahir: {
        type: DataTypes.DATEONLY,
      },
      no_bpjs: {
        type: DataTypes.STRING(20),
        validate: {
          is: /^[0-9]{13}$/,
        },
      },
      status_bpjs: {
        type: DataTypes.ENUM("aktif", "nonaktif"),
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
      tableName: "users",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  User.associate = function (models) {
    User.hasMany(models.SesiUser, { foreignKey: "id_user" });
    User.hasMany(models.JanjiTemu, { foreignKey: "id_user" });
    User.hasMany(models.PemesananKamar, { foreignKey: "id_user" });
    User.hasMany(models.RekamMedis, { foreignKey: "id_user" });
    User.hasMany(models.Pembayaran, { foreignKey: "id_user" });
    User.hasMany(models.Review, { foreignKey: "id_user" });
    User.hasMany(models.Notifikasi, { foreignKey: "id_user" });
    User.hasMany(models.Pengaturan, { foreignKey: "diperbarui_oleh" });
    User.hasMany(models.RiwayatStatusPemesanan, {
      foreignKey: "id_user_pengubah",
    });
    User.hasMany(models.RiwayatStatusJanji, { foreignKey: "id_user_pengubah" });
    User.hasMany(models.RiwayatStatusPembayaran, {
      foreignKey: "id_user_pengubah",
    });
    User.hasMany(models.RiwayatStokObat, { foreignKey: "id_user_pengubah" });
  };

  return User;
};
