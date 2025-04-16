const { JadwalDokter, Dokter } = require("../models");
const { validateJadwalDokter, validateResult } = require("../utils/validators");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");
const { Op } = require("sequelize");

const getAllJadwal = async (req, res, next) => {
  try {
    const { id_dokter, hari } = req.query;
    let whereCondition = { deleted_at: null };

    if (id_dokter) {
      whereCondition.id_dokter = id_dokter;
    }

    if (hari) {
      whereCondition.hari = hari;
    }

    const jadwal = await JadwalDokter.findAll({
      where: whereCondition,
      include: [
        {
          model: Dokter,
          attributes: ["nama", "spesialis"],
          where: { deleted_at: null },
        },
      ],
      order: [
        ["hari", "ASC"],
        ["jam_mulai", "ASC"],
      ],
    });

    successResponse(res, { jadwal });
  } catch (error) {
    next(error);
  }
};

const getJadwalById = async (req, res, next) => {
  try {
    const jadwal = await JadwalDokter.findOne({
      where: { id_jadwal: req.params.id, deleted_at: null },
      include: [
        {
          model: Dokter,
          attributes: ["nama", "spesialis"],
          where: { deleted_at: null },
        },
      ],
    });

    if (!jadwal) {
      return errorResponse(res, "Jadwal tidak ditemukan", 404);
    }

    successResponse(res, { jadwal });
  } catch (error) {
    next(error);
  }
};

const createJadwal = async (req, res, next) => {
  try {
    await Promise.all(
      validateJadwalDokter.map((validation) => validation.run(req))
    );
    validateResult(req, res, async () => {
      const {
        id_dokter,
        hari,
        jam_mulai,
        jam_selesai,
        kuota,
        durasi_per_pasien,
      } = req.body;

      // Cek apakah dokter ada
      const dokter = await Dokter.findOne({
        where: { id_dokter, deleted_at: null },
      });
      if (!dokter) {
        return errorResponse(res, "Dokter tidak ditemukan", 404);
      }

      const conflictingSchedule = await JadwalDokter.findOne({
        where: {
          id_dokter,
          hari,
          [Op.or]: [
            {
              jam_mulai: { [Op.between]: [jam_mulai, jam_selesai] },
            },
            {
              jam_selesai: { [Op.between]: [jam_mulai, jam_selesai] },
            },
            {
              [Op.and]: [
                { jam_mulai: { [Op.lte]: jam_mulai } },
                { jam_selesai: { [Op.gte]: jam_selesai } },
              ],
            },
          ],
          deleted_at: null,
        },
      });

      if (conflictingSchedule) {
        return errorResponse(
          res,
          "Jadwal bertabrakan dengan jadwal yang sudah ada",
          400
        );
      }

      const jadwal = await JadwalDokter.create({
        id_dokter,
        hari,
        jam_mulai,
        jam_selesai,
        kuota,
        durasi_per_pasien,
      });

      successResponse(res, { jadwal }, "Jadwal berhasil ditambahkan", 201);
    });
  } catch (error) {
    next(error);
  }
};

const updateJadwal = async (req, res, next) => {
  try {
    await Promise.all(
      validateJadwalDokter.map((validation) => validation.run(req))
    );
    validateResult(req, res, async () => {
      const { id } = req.params;
      const {
        id_dokter,
        hari,
        jam_mulai,
        jam_selesai,
        kuota,
        durasi_per_pasien,
      } = req.body;

      const jadwal = await JadwalDokter.findOne({
        where: { id_jadwal: id, deleted_at: null },
      });
      if (!jadwal) {
        return errorResponse(res, "Jadwal tidak ditemukan", 404);
      }

      const dokter = await Dokter.findOne({
        where: { id_dokter, deleted_at: null },
      });
      if (!dokter) {
        return errorResponse(res, "Dokter tidak ditemukan", 404);
      }

      const conflictingSchedule = await JadwalDokter.findOne({
        where: {
          id_dokter,
          hari,
          id_jadwal: { [Op.ne]: id },
          [Op.or]: [
            {
              jam_mulai: { [Op.between]: [jam_mulai, jam_selesai] },
            },
            {
              jam_selesai: { [Op.between]: [jam_mulai, jam_selesai] },
            },
            {
              [Op.and]: [
                { jam_mulai: { [Op.lte]: jam_mulai } },
                { jam_selesai: { [Op.gte]: jam_selesai } },
              ],
            },
          ],
          deleted_at: null,
        },
      });

      if (conflictingSchedule) {
        return errorResponse(
          res,
          "Jadwal bertabrakan dengan jadwal yang sudah ada",
          400
        );
      }

      await jadwal.update({
        id_dokter,
        hari,
        jam_mulai,
        jam_selesai,
        kuota,
        durasi_per_pasien,
      });

      successResponse(res, { jadwal }, "Jadwal berhasil diperbarui");
    });
  } catch (error) {
    next(error);
  }
};

const deleteJadwal = async (req, res, next) => {
  try {
    const jadwal = await JadwalDokter.findOne({
      where: { id_jadwal: req.params.id, deleted_at: null },
    });
    if (!jadwal) {
      return errorResponse(res, "Jadwal tidak ditemukan", 404);
    }

    await jadwal.update({ deleted_at: new Date() });

    successResponse(res, null, "Jadwal berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

const getJadwalHariIni = async (req, res, next) => {
  try {
    const hariIni = new Date().toLocaleString("id-ID", { weekday: "long" });
    const jadwal = await JadwalDokter.findAll({
      where: {
        hari: hariIni,
        deleted_at: null,
      },
      include: [
        {
          model: Dokter,
          attributes: ["nama", "spesialis", "foto"],
          where: { deleted_at: null },
        },
      ],
      order: [["jam_mulai", "ASC"]],
    });

    successResponse(res, { jadwal });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJadwal,
  getJadwalById,
  createJadwal,
  updateJadwal,
  deleteJadwal,
  getJadwalHariIni,
};
