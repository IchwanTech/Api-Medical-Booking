module.exports = (sequelize, DataTypes) => {
  const FotoKamar = sequelize.define(
    "FotoKamar",
    {
      id_foto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_kamar: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      url_foto: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      deskripsi: {
        type: DataTypes.STRING(100),
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
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
    },
    {
      tableName: "foto_kamar",
      timestamps: false,
      underscored: true,
    }
  );

  FotoKamar.associate = function (models) {
    FotoKamar.belongsTo(models.Kamar, { foreignKey: "id_kamar" });
  };

  return FotoKamar;
};
