module.exports = (sequelize, DataTypes) => {
  const Notifikasi = sequelize.define(
    "Notifikasi",
    {
      id_notifikasi: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      judul: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      pesan: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tipe: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      dibaca: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      tautan: {
        type: DataTypes.STRING(255),
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "notifikasi",
      timestamps: false,
      underscored: true,
    }
  );

  Notifikasi.associate = function (models) {
    Notifikasi.belongsTo(models.User, { foreignKey: "id_user" });
  };

  return Notifikasi;
};
