module.exports = (sequelize, DataTypes) => {
  const Pengaturan = sequelize.define(
    "Pengaturan",
    {
      id_pengaturan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nama_kunci: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      nilai: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deskripsi: {
        type: DataTypes.TEXT,
      },
      diperbarui_oleh: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    },
    {
      tableName: "pengaturan",
      timestamps: false,
      underscored: true,
    }
  );

  Pengaturan.associate = function (models) {
    Pengaturan.belongsTo(models.User, { foreignKey: "diperbarui_oleh" });
  };

  return Pengaturan;
};
