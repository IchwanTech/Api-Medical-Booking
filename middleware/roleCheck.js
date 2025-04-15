const { User } = require("../models");

const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id_user);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Pengguna tidak ditemukan",
        });
      }

      if (!requiredRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak: Anda tidak memiliki izin yang diperlukan",
        });
      }

      next();
    } catch (error) {
      console.error("Error in role check:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan dalam memeriksa peran",
      });
    }
  };
};

module.exports = checkRole;
