const { Antrian, JadwalDokter, Dokter, JanjiTemu, User } = require("../models");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");
const { Op } = require("sequelize");

const getAntrianByJadwal = async (req, res, next) => {
  try {
    const { id_jadwal, tanggal } = req.query;

    if (!id_jadwal || !tanggal) {
      return errorResponse(
        res,
        "Parameter id_jadwal dan tanggal diperlukan",
        400
      );
    }

    const antrian = await Antrian.findAll({
      where: { id_jadwal, tanggal },
      include: [
        {
          model: JadwalDokter,
          attributes: ["jam_mulai", "jam_selesai"],
          include: [
            {
              model: Dokter,
              attributes: ["nama", "spesialis"],
            },
          ],
        },
        {
          model: JanjiTemu,
          attributes: ["keluhan"],
          include: [
            {
              model: User,
              attributes: ["nama"],
            },
          ],
        },
      ],
      order: [["nomor_antrian", "ASC"]],
    });

    successResponse(res, { antrian });
  } catch (error) {
    next(error);
  }
};

const getAntrianSaya = async (req, res, next) => {
  try {
    const id_user = req.user.id_user;

    const antrian = await Antrian.findAll({
      include: [
        {
          model: JadwalDokter,
          attributes: ["jam_mulai", "jam_selesai"],
          include: [
            {
              model: Dokter,
              attributes: ["nama", "spesialis"],
            },
          ],
        },
        {
          model: JanjiTemu,
          attributes: ["keluhan", "status"],
          where: { id_user },
        },
      ],
      order: [
        ["tanggal", "DESC"],
        ["nomor_antrian", "ASC"],
      ],
      limit: 5,
    });

    successResponse(res, { antrian });
  } catch (error) {
    next(error);
  }
};

const updateStatusAntrian = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, "Status diperlukan", 400);
    }

    const antrian = await Antrian.findByPk(id, {
      include: [
        {
          model: JanjiTemu,
          attributes: ["id_janji"],
        },
      ],
    });

    if (!antrian) {
      return errorResponse(res, "Antrian tidak ditemukan", 404);
    }

    await antrian.update({ status });

    // Jika status diubah menjadi 'dilayani', update janji temu menjadi 'completed'
    if (status === "dilayani" && antrian.JanjiTemu) {
      await antrian.JanjiTemu.update({ status: "completed" });
    }

    successResponse(res, { antrian }, "Status antrian berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

const getAntrianSekarang = async (req, res, next) => {
  try {
    const { id_jadwal } = req.params;
    const tanggal = new Date().toISOString().split("T")[0];

    const antrianSekarang = await Antrian.findOne({
      where: {
        id_jadwal,
        tanggal,
        status: "dilayani",
      },
      include: [
        {
          model: JanjiTemu,
          include: [
            {
              model: User,
              attributes: ["nama"],
            },
          ],
        },
      ],
    });

    const antrianSelanjutnya = await Antrian.findOne({
      where: {
        id_jadwal,
        tanggal,
        status: "menunggu",
      },
      order: [["nomor_antrian", "ASC"]],
      include: [
        {
          model: JanjiTemu,
          include: [
            {
              model: User,
              attributes: ["nama"],
            },
          ],
        },
      ],
    });

    successResponse(res, {
      antrian_sekarang: antrianSekarang,
      antrian_selanjutnya: antrianSelanjutnya,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAntrianByJadwal,
  getAntrianSaya,
  updateStatusAntrian,
  getAntrianSekarang,
};
