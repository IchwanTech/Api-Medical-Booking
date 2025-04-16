const bcrypt = require("bcryptjs");
const { User } = require("../models");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");
const { validateRegister, validateResult } = require("../utils/validators");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      where: { deleted_at: null },
    });
    successResponse(res, { users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user || user.deleted_at) {
      return errorResponse(res, "Pengguna tidak ditemukan", 404);
    }

    successResponse(res, { user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    await Promise.all(
      validateRegister.map((validation) => validation.run(req))
    );
    validateResult(req, res, async () => {
      const { id } = req.params;
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

      const user = await User.findByPk(id);
      if (!user || user.deleted_at) {
        return errorResponse(res, "Pengguna tidak ditemukan", 404);
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return errorResponse(res, "Email sudah digunakan", 400);
        }
      }

      const updateData = {
        nama: nama || user.nama,
        email: email || user.email,
        role: role || user.role,
        no_telp: no_telp || user.no_telp,
        alamat: alamat || user.alamat,
        tanggal_lahir: tanggal_lahir || user.tanggal_lahir,
        no_bpjs: no_bpjs || user.no_bpjs,
        status_bpjs: status_bpjs || user.status_bpjs,
      };

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      await user.update(updateData);

      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });

      successResponse(
        res,
        { user: updatedUser },
        "Data pengguna berhasil diperbarui"
      );
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user || user.deleted_at) {
      return errorResponse(res, "Pengguna tidak ditemukan", 404);
    }

    // Soft delete
    await user.update({ deleted_at: new Date() });

    successResponse(res, null, "Pengguna berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
