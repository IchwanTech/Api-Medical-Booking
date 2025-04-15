module.exports = (sequelize, DataTypes) => {
  const LampiranRekamMedis = sequelize.define(
    "LampiranRekamMedis",
    {
      id_lampiran: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_rekam: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jenis_lampiran: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      url_file: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      deskripsi: {
        type: DataTypes.TEXT,
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
      tableName: "lampiran_rekam_medis",
      timestamps: false,
      underscored: true,
    }
  );

  LampiranRekamMedis.associate = function (models) {
    LampiranRekamMedis.belongsTo(models.RekamMedis, { foreignKey: "id_rekam" });
  };

  return LampiranRekamMedis;
};
