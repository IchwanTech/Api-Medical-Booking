const jwt = require("jsonwebtoken");
const { SesiUser, User } = require("../models");
const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Cek sesi di database
    const session = await SesiUser.findOne({
      where: { id_sesi: decoded.sessionId, is_active: true },
      include: [
        { model: User, attributes: ["id_user", "nama", "email", "role"] },
      ],
    });

    if (!session || session.waktu_expired < new Date()) {
      return res.status(401).json({
        success: false,
        message: "Sesi tidak valid atau sudah kadaluarsa",
      });
    }

    // Attach user data ke request
    req.user = session.User;
    req.sessionId = session.id_sesi;

    next();
  } catch (error) {
    console.error("Error in authentication:", error);
    return res.status(401).json({
      success: false,
      message: "Token tidak valid",
    });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi",
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Tidak memiliki izin untuk mengakses resource ini",
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
