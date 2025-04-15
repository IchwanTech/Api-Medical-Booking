module.exports = (sequelize, DataTypes) => {
  const RiwayatStatusJanji = sequelize.define(
    "RiwayatStatusJanji",
    {
      id_riwayat: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_janji: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status_lama: {
        type: DataTypes.ENUM("pending", "confirmed", "completed", "cancelled"),
        allowNull: false,
      },
      status_baru: {
        type: DataTypes.ENUM("pending", "confirmed", "completed", "cancelled"),
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
      tableName: "riwayat_status_janji",
      timestamps: false,
      underscored: true,
    }
  );

  RiwayatStatusJanji.associate = function (models) {
    RiwayatStatusJanji.belongsTo(models.JanjiTemu, { foreignKey: "id_janji" });
    RiwayatStatusJanji.belongsTo(models.User, {
      foreignKey: "id_user_pengubah",
    });
  };

  return RiwayatStatusJanji;
};
