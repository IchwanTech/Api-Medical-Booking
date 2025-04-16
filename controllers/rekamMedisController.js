const {
  RekamMedis,
  Dokter,
  User,
  JanjiTemu,
  LampiranRekamMedis,
  ResepObat,
} = require("../models");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseFormatter");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const { uploadLampiranRekamMedis } = require("../middleware/upload");
const { Op } = require("sequelize");

const getAllRekamMedis = async (req, res, next) => {
  try {
    const { page = 1, size = 10, id_user, id_dokter, tanggal } = req.query;
    const { limit, offset } = getPagination(page, size);

    let whereCondition = { deleted_at: null };
    if (id_user) {
      whereCondition.id_user = id_user;
    }
    if (id_dokter) {
      whereCondition.id_dokter = id_dokter;
    }
    if (tanggal) {
      whereCondition.tanggal = {
        [Op.between]: [new Date(tanggal), new Date(tanggal + "T23:59:59")],
      };
    }

    const data = await RekamMedis.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        {
          model: Dokter,
          attributes: ["nama", "spesialis"],
        },
        {
          model: User,
          attributes: ["nama"],
        },
        {
          model: JanjiTemu,
          attributes: ["tanggal"],
        },
      ],
      order: [["tanggal", "DESC"]],
    });

    const result = getPagingData(data, page, limit);
    paginatedResponse(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getRekamMedisById = async (req, res, next) => {
  try {
    const rekamMedis = await RekamMedis.findOne({
      where: { id_rekam: req.params.id, deleted_at: null },
      include: [
        {
          model: Dokter,
          attributes: ["nama", "spesialis"],
        },
        {
          model: User,
          attributes: ["nama", "tanggal_lahir", "no_bpjs", "status_bpjs"],
        },
        {
          model: JanjiTemu,
          attributes: ["id_janji", "tanggal", "keluhan"],
        },
        {
          model: LampiranRekamMedis,
          attributes: [
            "id_lampiran",
            "jenis_lampiran",
            "url_foto",
            "deskripsi",
            "created_at",
          ],
        },
        {
          model: ResepObat,
          attributes: [
            "id_resep",
            "dosis",
            "jumlah",
            "aturan_pakai",
            "is_bpjs",
          ],
          include: [
            {
              model: Obat,
              attributes: ["nama_obat", "satuan", "harga", "harga_bpjs"],
            },
          ],
        },
      ],
    });

    if (!rekamMedis) {
      return errorResponse(res, "Rekam medis tidak ditemukan", 404);
    }

    successResponse(res, { rekamMedis });
  } catch (error) {
    next(error);
  }
};

const createRekamMedis = async (req, res, next) => {
  try {
    const {
      id_user,
      id_dokter,
      id_janji,
      diagnosa,
      anamnesis,
      pemeriksaan_fisik,
      tindakan,
      catatan,
      is_bpjs,
    } = req.body;

    // Cek apakah user ada
    const user = await User.findOne({ where: { id_user, deleted_at: null } });
    if (!user) {
      return errorResponse(res, "Pasien tidak ditemukan", 404);
    }

    // Cek apakah dokter ada
    const dokter = await Dokter.findOne({
      where: { id_dokter, deleted_at: null },
    });
    if (!dokter) {
      return errorResponse(res, "Dokter tidak ditemukan", 404);
    }

    // Cek apakah janji temu ada (jika disertakan)
    if (id_janji) {
      const janjiTemu = await JanjiTemu.findOne({
        where: { id_janji, deleted_at: null },
      });
      if (!janjiTemu) {
        return errorResponse(res, "Janji temu tidak ditemukan", 404);
      }
    }

    const rekamMedis = await RekamMedis.create({
      id_user,
      id_dokter,
      id_janji: id_janji || null,
      diagnosa,
      anamnesis: anamnesis || null,
      pemeriksaan_fisik: pemeriksaan_fisik || null,
      tindakan: tindakan || null,
      catatan: catatan || null,
      is_bpjs: is_bpjs || false,
      tanggal: new Date(),
    });

    successResponse(res, { rekamMedis }, "Rekam medis berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};

const updateRekamMedis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { diagnosa, anamnesis, pemeriksaan_fisik, tindakan, catatan } =
      req.body;

    const rekamMedis = await RekamMedis.findOne({
      where: { id_rekam: id, deleted_at: null },
    });
    if (!rekamMedis) {
      return errorResponse(res, "Rekam medis tidak ditemukan", 404);
    }

    await rekamMedis.update({
      diagnosa: diagnosa || rekamMedis.diagnosa,
      anamnesis: anamnesis || rekamMedis.anamnesis,
      pemeriksaan_fisik: pemeriksaan_fisik || rekamMedis.pemeriksaan_fisik,
      tindakan: tindakan || rekamMedis.tindakan,
      catatan: catatan || rekamMedis.catatan,
    });

    successResponse(res, { rekamMedis }, "Rekam medis berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

const deleteRekamMedis = async (req, res, next) => {
  try {
    const rekamMedis = await RekamMedis.findOne({
      where: { id_rekam: req.params.id, deleted_at: null },
    });
    if (!rekamMedis) {
      return errorResponse(res, "Rekam medis tidak ditemukan", 404);
    }

    // Soft delete
    await rekamMedis.update({ deleted_at: new Date() });

    successResponse(res, null, "Rekam medis berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

const addLampiranRekamMedis = async (req, res, next) => {
  try {
    uploadLampiranRekamMedis(req, res, async (err) => {
      if (err) {
        return errorResponse(res, err.message, 400);
      }

      const { id_rekam } = req.params;
      const { jenis_lampiran, deskripsi } = req.body;

      // Cek apakah rekam medis ada
      const rekamMedis = await RekamMedis.findOne({
        where: { id_rekam, deleted_at: null },
      });
      if (!rekamMedis) {
        return errorResponse(res, "Rekam medis tidak ditemukan", 404);
      }

      const lampiran = await LampiranRekamMedis.create({
        id_rekam,
        jenis_lampiran,
        url_file: `/uploads/${req.file.filename}`,
        deskripsi: deskripsi || null,
      });

      successResponse(res, { lampiran }, "Lampiran berhasil ditambahkan", 201);
    });
  } catch (error) {
    next(error);
  }
};

const deleteLampiranRekamMedis = async (req, res, next) => {
  try {
    const { id_rekam, id_lampiran } = req.params;

    // Cek apakah rekam medis ada
    const rekamMedis = await RekamMedis.findOne({
      where: { id_rekam, deleted_at: null },
    });
    if (!rekamMedis) {
      return errorResponse(res, "Rekam medis tidak ditemukan", 404);
    }

    // Cek apakah lampiran ada
    const lampiran = await LampiranRekamMedis.findOne({
      where: { id_lampiran, id_rekam },
    });
    if (!lampiran) {
      return errorResponse(res, "Lampiran tidak ditemukan", 404);
    }

    await lampiran.destroy();
    successResponse(res, null, "Lampiran berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRekamMedis,
  getRekamMedisById,
  createRekamMedis,
  updateRekamMedis,
  deleteRekamMedis,
  addLampiranRekamMedis,
  deleteLampiranRekamMedis,
};
