module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "Review",
    {
      id_review: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_dokter: {
        type: DataTypes.INTEGER,
      },
      id_layanan: {
        type: DataTypes.INTEGER,
      },
      id_pemesanan: {
        type: DataTypes.INTEGER,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      komentar: {
        type: DataTypes.TEXT,
      },
      is_anonymous: {
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
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "review",
      timestamps: false,
      paranoid: true,
      underscored: true,
    }
  );

  Review.associate = function (models) {
    Review.belongsTo(models.User, { foreignKey: "id_user" });
    Review.belongsTo(models.Dokter, { foreignKey: "id_dokter" });
    Review.belongsTo(models.Layanan, { foreignKey: "id_layanan" });
    Review.belongsTo(models.PemesananKamar, { foreignKey: "id_pemesanan" });
  };

  return Review;
};
