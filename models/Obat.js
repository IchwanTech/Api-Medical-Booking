module.exports = (sequelize, DataTypes) => {
  const Obat = sequelize.define(
    "Obat",
    {
      id_obat: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nama_obat: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      deskripsi: {
        type: DataTypes.TEXT,
      },
      satuan: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      harga: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      harga_bpjs: {
        type: DataTypes.DECIMAL(12, 2),
      },
      stok: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
      tableName: "obat",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  Obat.associate = function (models) {
    Obat.hasMany(models.RiwayatStokObat, { foreignKey: "id_obat" });
    Obat.hasMany(models.ResepObat, { foreignKey: "id_obat" });
  };

  return Obat;
};
