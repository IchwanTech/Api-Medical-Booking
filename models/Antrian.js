module.exports = (sequelize, DataTypes) => {
  const Antrian = sequelize.define(
    "Antrian",
    {
      id_antrian: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_jadwal: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      nomor_antrian: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      estimasi_waktu: {
        type: DataTypes.TIME,
      },
      status: {
        type: DataTypes.ENUM("menunggu", "dilayani", "selesai", "batal"),
        allowNull: false,
        defaultValue: "menunggu",
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
      tableName: "antrian",
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["id_jadwal", "tanggal", "nomor_antrian"],
        },
      ],
    }
  );

  Antrian.associate = function (models) {
    Antrian.belongsTo(models.JadwalDokter, { foreignKey: "id_jadwal" });
    Antrian.hasOne(models.JanjiTemu, { foreignKey: "id_antrian" });
  };

  return Antrian;
};
