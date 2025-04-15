const bcrypt = require("bcryptjs");
const { User, SesiUser } = require("../models");
const {
  generateToken,
  createSession,
  invalidateSession,
} = require("../utils/jwtHelper");
const {
  validateLogin,
  validateRegister,
  validateResult,
} = require("../utils/validators");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");
const { sendRegistrationEmail } = require("../utils/emailService");

const register = async (req, res, next) => {
  try {
    await Promise.all(
      validateRegister.map((validation) => validation.run(req))
    );
    validateResult(req, res, async () => {
      const {
        nama,
        email,
        password,
        role,
        no_telp,
        alamat,
        tanggal_lahir,
        no_bpjs,
        status_bpjs,
      } = req.body;

      // Cek apakah email sudah terdaftar
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return errorResponse(res, "Email sudah terdaftar", 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Buat user baru
      const user = await User.create({
        nama,
        email,
        password: hashedPassword,
        role,
        no_telp,
        alamat,
        tanggal_lahir,
        no_bpjs,
        status_bpjs,
      });

      // Kirim email registrasi
      await sendRegistrationEmail(user);

      successResponse(res, { user }, "Registrasi berhasil", 201);
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    await Promise.all(validateLogin.map((validation) => validation.run(req)));
    validateResult(req, res, async () => {
      const { email, password } = req.body;

      // Cari user berdasarkan email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return errorResponse(res, "Email atau password salah", 401);
      }

      // Verifikasi password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return errorResponse(res, "Email atau password salah", 401);
      }

      // Buat sesi baru
      const sessionId = await createSession(
        user,
        req.ip,
        req.headers["user-agent"]
      );

      // Generate token
      const token = generateToken(user, sessionId);

      // Response dengan token
      successResponse(res, {
        token,
        user: {
          id_user: user.id_user,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await invalidateSession(req.sessionId);
    successResponse(res, null, "Logout berhasil");
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id_user, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return errorResponse(res, "Pengguna tidak ditemukan", 404);
    }

    successResponse(res, { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  me,
};
