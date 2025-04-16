const { Kamar, TipeKamar, FotoKamar, PemesananKamar } = require("../models");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseFormatter");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const { uploadFotoKamar } = require("../middleware/upload");
const { Op } = require("sequelize");

const getAllTipeKamar = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const { limit, offset } = getPagination(page, size);

    const data = await TipeKamar.findAndCountAll({
      where: { deleted_at: null },
      limit,
      offset,
      order: [["harga_per_malam", "ASC"]],
    });

    const result = getPagingData(data, page, limit);
    paginatedResponse(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getTipeKamarById = async (req, res, next) => {
  try {
    const tipeKamar = await TipeKamar.findOne({
      where: { id_tipe: req.params.id, deleted_at: null },
    });

    if (!tipeKamar) {
      return errorResponse(res, "Tipe kamar tidak ditemukan", 404);
    }

    successResponse(res, { tipeKamar });
  } catch (error) {
    next(error);
  }
};

const createTipeKamar = async (req, res, next) => {
  try {
    const {
      nama_tipe,
      deskripsi,
      harga_per_malam,
      harga_bpjs,
      fasilitas,
      kapasitas,
      kelas_bpjs,
    } = req.body;

    console.log("Request body:", req.body);

    if (!nama_tipe) {
      return errorResponse(res, "Nama tipe kamar wajib diisi", 400);
    }

    if (!harga_per_malam || isNaN(parseFloat(harga_per_malam))) {
      return errorResponse(
        res,
        "Harga per malam wajib diisi dengan nilai numerik",
        400
      );
    }

    const tipeKamar = await TipeKamar.create({
      nama_tipe,
      deskripsi: deskripsi || null,
      harga_per_malam,
      harga_bpjs: harga_bpjs || null,
      fasilitas: fasilitas || null,
      kapasitas: kapasitas || 1,
      kelas_bpjs: kelas_bpjs || null,
    });

    successResponse(res, { tipeKamar }, "Tipe kamar berhasil ditambahkan", 201);
  } catch (error) {
    console.error("Error detail:", {
      name: error.name,
      message: error.message,
      sql: error.sql || "No SQL available",
      parameters: error.parameters || "No parameters available",
    });

    if (error.original) {
      console.error("Original error:", {
        code: error.original.code,
        errno: error.original.errno,
        sqlMessage: error.original.sqlMessage,
        sqlState: error.original.sqlState,
      });
    }

    next(error);
  }
};

const updateTipeKamar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nama_tipe,
      deskripsi,
      harga_per_malam,
      harga_bpjs,
      fasilitas,
      kapasitas,
      kelas_bpjs,
    } = req.body;

    const tipeKamar = await TipeKamar.findOne({
      where: { id_tipe: id, deleted_at: null },
    });
    if (!tipeKamar) {
      return errorResponse(res, "Tipe kamar tidak ditemukan", 404);
    }

    await tipeKamar.update({
      nama_tipe: nama_tipe || tipeKamar.nama_tipe,
      deskripsi: deskripsi || tipeKamar.deskripsi,
      harga_per_malam: harga_per_malam || tipeKamar.harga_per_malam,
      harga_bpjs: harga_bpjs || tipeKamar.harga_bpjs,
      fasilitas: fasilitas || tipeKamar.fasilitas,
      kapasitas: kapasitas || tipeKamar.kapasitas,
      kelas_bpjs: kelas_bpjs || tipeKamar.kelas_bpjs,
    });

    successResponse(res, { tipeKamar }, "Tipe kamar berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

const deleteTipeKamar = async (req, res, next) => {
  try {
    const tipeKamar = await TipeKamar.findOne({
      where: { id_tipe: req.params.id, deleted_at: null },
    });
    if (!tipeKamar) {
      return errorResponse(res, "Tipe kamar tidak ditemukan", 404);
    }

    const kamarTerpakai = await Kamar.findOne({
      where: { id_tipe: tipeKamar.id_tipe, deleted_at: null },
    });
    if (kamarTerpakai) {
      return errorResponse(
        res,
        "Tipe kamar tidak dapat dihapus karena masih digunakan",
        400
      );
    }

    await tipeKamar.update({ deleted_at: new Date() });

    successResponse(res, null, "Tipe kamar berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

const getAllKamar = async (req, res, next) => {
  try {
    const { page = 1, size = 10, id_tipe, status, lantai } = req.query;
    const { limit, offset } = getPagination(page, size);

    let whereCondition = { deleted_at: null };
    if (id_tipe) {
      whereCondition.id_tipe = id_tipe;
    }
    if (status) {
      whereCondition.status = status;
    }
    if (lantai) {
      whereCondition.lantai = lantai;
    }

    const data = await Kamar.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        {
          model: TipeKamar,
          attributes: [
            "nama_tipe",
            "harga_per_malam",
            "harga_bpjs",
            "fasilitas",
          ],
          where: { deleted_at: null },
        },
        {
          model: FotoKamar,
          attributes: ["url_foto"],
          where: { is_primary: true },
          required: false,
        },
      ],
      order: [
        ["lantai", "ASC"],
        ["nomor_kamar", "ASC"],
      ],
    });

    const result = getPagingData(data, page, limit);
    paginatedResponse(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getKamarById = async (req, res, next) => {
  try {
    const kamar = await Kamar.findOne({
      where: { id_kamar: req.params.id, deleted_at: null },
      include: [
        {
          model: TipeKamar,
          attributes: [
            "nama_tipe",
            "deskripsi",
            "harga_per_malam",
            "harga_bpjs",
            "fasilitas",
            "kapasitas",
            "kelas_bpjs",
          ],
          where: { deleted_at: null },
        },
        {
          model: FotoKamar,
          attributes: ["id_foto", "url_foto", "deskripsi", "is_primary"],
          order: [["is_primary", "DESC"]],
        },
      ],
    });

    if (!kamar) {
      return errorResponse(res, "Kamar tidak ditemukan", 404);
    }

    successResponse(res, { kamar });
  } catch (error) {
    next(error);
  }
};

const createKamar = async (req, res, next) => {
  try {
    const { id_tipe, nomor_kamar, lantai } = req.body;

    const tipeKamar = await TipeKamar.findOne({
      where: { id_tipe, deleted_at: null },
    });
    if (!tipeKamar) {
      return errorResponse(res, "Tipe kamar tidak ditemukan", 404);
    }

    const existingKamar = await Kamar.findOne({ where: { nomor_kamar } });
    if (existingKamar) {
      return errorResponse(res, "Nomor kamar sudah digunakan", 400);
    }

    const kamar = await Kamar.create({
      id_tipe,
      nomor_kamar,
      lantai,
      status: "tersedia",
    });

    successResponse(res, { kamar }, "Kamar berhasil ditambahkan", 201);
  } catch (error) {
    next(error);
  }
};

const updateKamar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_tipe, nomor_kamar, status, lantai } = req.body;

    const kamar = await Kamar.findOne({
      where: { id_kamar: id, deleted_at: null },
    });
    if (!kamar) {
      return errorResponse(res, "Kamar tidak ditemukan", 404);
    }

    if (id_tipe) {
      const tipeKamar = await TipeKamar.findOne({
        where: { id_tipe, deleted_at: null },
      });
      if (!tipeKamar) {
        return errorResponse(res, "Tipe kamar tidak ditemukan", 404);
      }
    }

    if (nomor_kamar && nomor_kamar !== kamar.nomor_kamar) {
      const existingKamar = await Kamar.findOne({ where: { nomor_kamar } });
      if (existingKamar) {
        return errorResponse(res, "Nomor kamar sudah digunakan", 400);
      }
    }

    await kamar.update({
      id_tipe: id_tipe || kamar.id_tipe,
      nomor_kamar: nomor_kamar || kamar.nomor_kamar,
      status: status || kamar.status,
      lantai: lantai || kamar.lantai,
    });

    successResponse(res, { kamar }, "Kamar berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

const deleteKamar = async (req, res, next) => {
  try {
    const kamar = await Kamar.findOne({
      where: { id_kamar: req.params.id, deleted_at: null },
    });
    if (!kamar) {
      return errorResponse(res, "Kamar tidak ditemukan", 404);
    }

    if (kamar.status === "terisi") {
      return errorResponse(
        res,
        "Kamar tidak dapat dihapus karena sedang terisi",
        400
      );
    }

    await kamar.update({ deleted_at: new Date() });

    successResponse(res, null, "Kamar berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

const getKamarTersedia = async (req, res, next) => {
  try {
    const { tanggal_masuk, tanggal_keluar, id_tipe } = req.query;

    if (!tanggal_masuk || !tanggal_keluar) {
      return errorResponse(
        res,
        "Parameter tanggal_masuk dan tanggal_keluar diperlukan",
        400
      );
    }

    const kamarTerpakai = await Kamar.findAll({
      include: [
        {
          model: TipeKamar,
          attributes: [],
          where: id_tipe ? { id_tipe } : {},
        },
        {
          model: PemesananKamar,
          where: {
            [Op.or]: [
              {
                tanggal_masuk: {
                  [Op.between]: [tanggal_masuk, tanggal_keluar],
                },
              },
              {
                tanggal_keluar: {
                  [Op.between]: [tanggal_masuk, tanggal_keluar],
                },
              },
              {
                [Op.and]: [
                  { tanggal_masuk: { [Op.lte]: tanggal_masuk } },
                  { tanggal_keluar: { [Op.gte]: tanggal_keluar } },
                ],
              },
            ],
            status: { [Op.notIn]: ["cancelled", "checked_out"] },
            deleted_at: null,
          },
          required: true,
        },
      ],
    });

    const idKamarTerpakai = kamarTerpakai.map((k) => k.id_kamar);

    const kamarTersedia = await Kamar.findAll({
      where: {
        id_kamar: { [Op.notIn]: idKamarTerpakai },
        status: "tersedia",
        deleted_at: null,
      },
      include: [
        {
          model: TipeKamar,
          attributes: [
            "nama_tipe",
            "deskripsi",
            "harga_per_malam",
            "harga_bpjs",
            "fasilitas",
            "kapasitas",
            "kelas_bpjs",
          ],
          where: id_tipe ? { id_tipe } : {},
        },
        {
          model: FotoKamar,
          attributes: ["url_foto"],
          where: { is_primary: true },
          required: false,
        },
      ],
      order: [
        ["lantai", "ASC"],
        ["nomor_kamar", "ASC"],
      ],
    });

    successResponse(res, { kamarTersedia });
  } catch (error) {
    next(error);
  }
};

// Foto Kamar
const addFotoKamar = async (req, res, next) => {
  try {
    uploadFotoKamar(req, res, async (err) => {
      if (err) {
        return errorResponse(res, err.message, 400);
      }

      const { id_kamar } = req.params;
      const { deskripsi, is_primary } = req.body;

      const kamar = await Kamar.findOne({
        where: { id_kamar, deleted_at: null },
      });
      if (!kamar) {
        return errorResponse(res, "Kamar tidak ditemukan", 404);
      }

      if (is_primary) {
        await FotoKamar.update({ is_primary: false }, { where: { id_kamar } });
      }

      const fotoKamar = await FotoKamar.create({
        id_kamar,
        url_foto: `/uploads/foto-kamar/${req.file.filename}`,
        deskripsi: deskripsi || null,
        is_primary: is_primary || false,
      });

      successResponse(
        res,
        { fotoKamar },
        "Foto kamar berhasil ditambahkan",
        201
      );
    });
  } catch (error) {
    next(error);
  }
};

const updateFotoKamar = async (req, res, next) => {
  try {
    const { id_kamar, id_foto } = req.params;
    const { deskripsi, is_primary } = req.body;

    const kamar = await Kamar.findOne({
      where: { id_kamar, deleted_at: null },
    });
    if (!kamar) {
      return errorResponse(res, "Kamar tidak ditemukan", 404);
    }

    const fotoKamar = await FotoKamar.findOne({ where: { id_foto, id_kamar } });
    if (!fotoKamar) {
      return errorResponse(res, "Foto kamar tidak ditemukan", 404);
    }

    if (is_primary) {
      await FotoKamar.update({ is_primary: false }, { where: { id_kamar } });
    }

    await fotoKamar.update({
      deskripsi: deskripsi || fotoKamar.deskripsi,
      is_primary: is_primary || fotoKamar.is_primary,
    });

    successResponse(res, { fotoKamar }, "Foto kamar berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

const deleteFotoKamar = async (req, res, next) => {
  try {
    const { id_kamar, id_foto } = req.params;

    const kamar = await Kamar.findOne({
      where: { id_kamar, deleted_at: null },
    });
    if (!kamar) {
      return errorResponse(res, "Kamar tidak ditemukan", 404);
    }

    const fotoKamar = await FotoKamar.findOne({ where: { id_foto, id_kamar } });
    if (!fotoKamar) {
      return errorResponse(res, "Foto kamar tidak ditemukan", 404);
    }

    if (fotoKamar.is_primary) {
      const anotherFoto = await FotoKamar.findOne({
        where: { id_kamar, id_foto: { [Op.ne]: id_foto } },
        order: [["created_at", "ASC"]],
      });

      if (anotherFoto) {
        await anotherFoto.update({ is_primary: true });
      }
    }

    await fotoKamar.destroy();
    successResponse(res, null, "Foto kamar berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTipeKamar,
  getTipeKamarById,
  createTipeKamar,
  updateTipeKamar,
  deleteTipeKamar,
  getAllKamar,
  getKamarById,
  createKamar,
  updateKamar,
  deleteKamar,
  getKamarTersedia,
  addFotoKamar,
  updateFotoKamar,
  deleteFotoKamar,
};
