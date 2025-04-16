const { Notifikasi, User } = require("../models");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseFormatter");
const { getPagination, getPagingData } = require("../utils/paginationHelper");

const getAllNotifikasi = async (req, res, next) => {
  try {
    const { page = 1, size = 10, dibaca } = req.query;
    const { limit, offset } = getPagination(page, size);

    let whereCondition = { id_user: req.user.id_user };
    if (dibaca) {
      whereCondition.dibaca = dibaca === "true";
    }

    const data = await Notifikasi.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const result = getPagingData(data, page, limit);
    paginatedResponse(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getNotifikasiById = async (req, res, next) => {
  try {
    const notifikasi = await Notifikasi.findOne({
      where: { id_notifikasi: req.params.id, id_user: req.user.id_user },
    });

    if (!notifikasi) {
      return errorResponse(res, "Notifikasi tidak ditemukan", 404);
    }

    if (!notifikasi.dibaca) {
      await notifikasi.update({ dibaca: true });
    }

    successResponse(res, { notifikasi });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notifikasi = await Notifikasi.findOne({
      where: { id_notifikasi: id, id_user: req.user.id_user },
    });

    if (!notifikasi) {
      return errorResponse(res, "Notifikasi tidak ditemukan", 404);
    }

    await notifikasi.update({ dibaca: true });

    successResponse(
      res,
      { notifikasi },
      "Notifikasi telah ditandai sebagai dibaca"
    );
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notifikasi.update(
      { dibaca: true },
      { where: { id_user: req.user.id_user, dibaca: false } }
    );

    successResponse(
      res,
      null,
      "Semua notifikasi telah ditandai sebagai dibaca"
    );
  } catch (error) {
    next(error);
  }
};

const deleteNotifikasi = async (req, res, next) => {
  try {
    const notifikasi = await Notifikasi.findOne({
      where: { id_notifikasi: req.params.id, id_user: req.user.id_user },
    });

    if (!notifikasi) {
      return errorResponse(res, "Notifikasi tidak ditemukan", 404);
    }

    await notifikasi.destroy();

    successResponse(res, null, "Notifikasi berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotifikasi,
  getNotifikasiById,
  markAsRead,
  markAllAsRead,
  deleteNotifikasi,
};
