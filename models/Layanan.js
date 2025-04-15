module.exports = (sequelize, DataTypes) => {
  const Layanan = sequelize.define(
    "Layanan",
    {
      id_layanan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nama_layanan: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      deskripsi: {
        type: DataTypes.TEXT,
      },
      harga: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      harga_bpjs: {
        type: DataTypes.DECIMAL(12, 2),
      },
      ditanggung_bpjs: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      tableName: "layanan",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  Layanan.associate = function (models) {
    Layanan.hasMany(models.Pembayaran, { foreignKey: "id_layanan" });
    Layanan.hasMany(models.Review, { foreignKey: "id_layanan" });
  };

  return Layanan;
};
