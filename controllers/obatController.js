const { Obat, RiwayatStokObat } = require("../models");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseFormatter");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const { Op } = require("sequelize");

const getAllObat = async (req, res, next) => {
  try {
    const { page = 1, size = 10, search, ditanggung_bpjs } = req.query;
    const { limit, offset } = getPagination(page, size);

    let whereCondition = { deleted_at: null };
    if (search) {
      whereCondition.nama_obat = { [Op.like]: `%${search}%` };
    }
    if (ditanggung_bpjs) {
      whereCondition.ditanggung_bpjs = ditanggung_bpjs === "true";
    }

    const data = await Obat.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["nama_obat", "ASC"]],
    });

    const result = getPagingData(data, page, limit);
    paginatedResponse(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getObatById = async (req, res, next) => {
  try {
    const obat = await Obat.findOne({
      where: { id_obat: req.params.id, deleted_at: null },
      include: [
        {
          model: RiwayatStokObat,
          attributes: [
            "stok_sebelum",
            "stok_sesudah",
            "jumlah_perubahan",
            "tipe_perubahan",
            "catatan",
            "created_at",
          ],
          order: [["created_at", "DESC"]],
          limit: 10,
        },
      ],
    });

    if (!obat) {
      return errorResponse(res, "Obat tidak ditemukan", 404);
    }

    successResponse(res, { obat });
  } catch (error) {
    next(error);
  }
};

const createObat = async (req, res, next) => {
  try {
    const {
      nama_obat,
      deskripsi,
      satuan,
      harga,
      harga_bpjs,
      stok,
      ditanggung_bpjs,
    } = req.body;

    const obat = await Obat.create({
      nama_obat,
      deskripsi: deskripsi || null,
      satuan,
      harga,
      harga_bpjs: harga_bpjs || null,
      stok: stok || 0,
      ditanggung_bpjs: ditanggung_bpjs || false,
    });

    // Catat riwayat stok awal
    await RiwayatStokObat.create({
      id_obat: obat.id_obat,
      stok_sebelum: 0,
      stok_sesudah: obat.stok,
      jumlah_perubahan: obat.stok,
      tipe_perubahan: "penambahan",
      catatan: "Stok awal",
      id_user_pengubah: req.user.id_user,
    });

    successResponse(res, { obat }, "Obat berhasil ditambahkan", 201);
  } catch (error) {
    next(error);
  }
};

const updateObat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_obat, deskripsi, satuan, harga, harga_bpjs, ditanggung_bpjs } =
      req.body;

    const obat = await Obat.findOne({
      where: { id_obat: id, deleted_at: null },
    });
    if (!obat) {
      return errorResponse(res, "Obat tidak ditemukan", 404);
    }

    await obat.update({
      nama_obat: nama_obat || obat.nama_obat,
      deskripsi: deskripsi || obat.deskripsi,
      satuan: satuan || obat.satuan,
      harga: harga || obat.harga,
      harga_bpjs: harga_bpjs || obat.harga_bpjs,
      ditanggung_bpjs: ditanggung_bpjs || obat.ditanggung_bpjs,
    });

    successResponse(res, { obat }, "Data obat berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

const updateStokObat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jumlah, tipe_perubahan, catatan } = req.body;

    if (!jumlah || !tipe_perubahan) {
      return errorResponse(res, "Jumlah dan tipe_perubahan diperlukan", 400);
    }

    const obat = await Obat.findOne({
      where: { id_obat: id, deleted_at: null },
    });
    if (!obat) {
      return errorResponse(res, "Obat tidak ditemukan", 404);
    }

    const stokSebelum = obat.stok;
    let stokSesudah = stokSebelum;

    if (tipe_perubahan === "penambahan") {
      stokSesudah = stokSebelum + parseInt(jumlah);
    } else if (tipe_perubahan === "pengurangan") {
      if (stokSebelum < jumlah) {
        return errorResponse(res, "Stok tidak mencukupi", 400);
      }
      stokSesudah = stokSebelum - parseInt(jumlah);
    } else {
      return errorResponse(res, "Tipe perubahan tidak valid", 400);
    }

    await obat.update({ stok: stokSesudah });

    // Catat riwayat stok
    await RiwayatStokObat.create({
      id_obat: obat.id_obat,
      stok_sebelum: stokSebelum,
      stok_sesudah: stokSesudah,
      jumlah_perubahan: parseInt(jumlah),
      tipe_perubahan,
      catatan: catatan || null,
      id_user_pengubah: req.user.id_user,
    });

    successResponse(res, { obat }, "Stok obat berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

const deleteObat = async (req, res, next) => {
  try {
    const obat = await Obat.findOne({
      where: { id_obat: req.params.id, deleted_at: null },
    });
    if (!obat) {
      return errorResponse(res, "Obat tidak ditemukan", 404);
    }

    // Soft delete
    await obat.update({ deleted_at: new Date() });

    successResponse(res, null, "Obat berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllObat,
  getObatById,
  createObat,
  updateObat,
  updateStokObat,
  deleteObat,
};
