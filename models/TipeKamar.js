module.exports = (sequelize, DataTypes) => {
  const TipeKamar = sequelize.define(
    "TipeKamar",
    {
      id_tipe: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nama_tipe: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      deskripsi: {
        type: DataTypes.TEXT,
      },
      harga_per_malam: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      harga_bpjs: {
        type: DataTypes.DECIMAL(12, 2),
      },
      fasilitas: {
        type: DataTypes.TEXT,
      },
      kapasitas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      kelas_bpjs: {
        type: DataTypes.ENUM("1", "2", "3"),
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
      tableName: "tipe_kamar",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  TipeKamar.associate = function (models) {
    TipeKamar.hasMany(models.Kamar, { foreignKey: "id_tipe" });
  };

  return TipeKamar;
};
