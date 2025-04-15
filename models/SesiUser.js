module.exports = (sequelize, DataTypes) => {
  const SesiUser = sequelize.define(
    "SesiUser",
    {
      id_sesi: {
        type: DataTypes.STRING(128),
        primaryKey: true,
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      waktu_login: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      waktu_expired: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "sesi_user",
      timestamps: false,
      underscored: true,
    }
  );

  SesiUser.associate = function (models) {
    SesiUser.belongsTo(models.User, { foreignKey: "id_user" });
  };

  return SesiUser;
};
