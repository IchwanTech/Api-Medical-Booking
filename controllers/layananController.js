const { Layanan } = require("../models");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseFormatter");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const { Op } = require("sequelize");

const getAllLayanan = async (req, res, next) => {
  try {
    const { page = 1, size = 10, search, ditanggung_bpjs } = req.query;
    const { limit, offset } = getPagination(page, size);

    let whereCondition = { deleted_at: null };
    if (search) {
      whereCondition.nama_layanan = { [Op.like]: `%${search}%` };
    }
    if (ditanggung_bpjs) {
      whereCondition.ditanggung_bpjs = ditanggung_bpjs === "true";
    }

    const data = await Layanan.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["nama_layanan", "ASC"]],
    });

    const result = getPagingData(data, page, limit);
    paginatedResponse(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getLayananById = async (req, res, next) => {
  try {
    const layanan = await Layanan.findOne({
      where: { id_layanan: req.params.id, deleted_at: null },
    });

    if (!layanan) {
      return errorResponse(res, "Layanan tidak ditemukan", 404);
    }

    successResponse(res, { layanan });
  } catch (error) {
    next(error);
  }
};

const createLayanan = async (req, res, next) => {
  try {
    const { nama_layanan, deskripsi, harga, harga_bpjs, ditanggung_bpjs } =
      req.body;

    const layanan = await Layanan.create({
      nama_layanan,
      deskripsi: deskripsi || null,
      harga,
      harga_bpjs: harga_bpjs || null,
      ditanggung_bpjs: ditanggung_bpjs || false,
    });

    successResponse(res, { layanan }, "Layanan berhasil ditambahkan", 201);
  } catch (error) {
    next(error);
  }
};

const updateLayanan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_layanan, deskripsi, harga, harga_bpjs, ditanggung_bpjs } =
      req.body;

    const layanan = await Layanan.findOne({
      where: { id_layanan: id, deleted_at: null },
    });
    if (!layanan) {
      return errorResponse(res, "Layanan tidak ditemukan", 404);
    }

    await layanan.update({
      nama_layanan: nama_layanan || layanan.nama_layanan,
      deskripsi: deskripsi || layanan.deskripsi,
      harga: harga || layanan.harga,
      harga_bpjs: harga_bpjs || layanan.harga_bpjs,
      ditanggung_bpjs: ditanggung_bpjs || layanan.ditanggung_bpjs,
    });

    successResponse(res, { layanan }, "Layanan berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

const deleteLayanan = async (req, res, next) => {
  try {
    const layanan = await Layanan.findOne({
      where: { id_layanan: req.params.id, deleted_at: null },
    });
    if (!layanan) {
      return errorResponse(res, "Layanan tidak ditemukan", 404);
    }

    // Soft delete
    await layanan.update({ deleted_at: new Date() });

    successResponse(res, null, "Layanan berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLayanan,
  getLayananById,
  createLayanan,
  updateLayanan,
  deleteLayanan,
};
