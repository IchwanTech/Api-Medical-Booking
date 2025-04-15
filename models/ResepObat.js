module.exports = (sequelize, DataTypes) => {
  const ResepObat = sequelize.define(
    "ResepObat",
    {
      id_resep: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_rekam: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_obat: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dosis: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      aturan_pakai: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_bpjs: {
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
      tableName: "resep_obat",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  ResepObat.associate = function (models) {
    ResepObat.belongsTo(models.RekamMedis, { foreignKey: "id_rekam" });
    ResepObat.belongsTo(models.Obat, { foreignKey: "id_obat" });
  };

  return ResepObat;
};
