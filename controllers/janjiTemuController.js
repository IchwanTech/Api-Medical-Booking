const {
  JanjiTemu,
  Dokter,
  JadwalDokter,
  Antrian,
  User,
  RekamMedis,
  RiwayatStatusJanji,
  sequelize,
} = require("../models");
const { validateJanjiTemu, validateResult } = require("../utils/validators");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseFormatter");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const { sendAppointmentConfirmation } = require("../utils/emailService");
const { Op } = require("sequelize");

const getAllJanjiTemu = async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 10,
      id_user,
      id_dokter,
      status,
      tanggal,
    } = req.query;
    const { limit, offset } = getPagination(page, size);

    let whereCondition = { deleted_at: null };
    if (id_user) {
      whereCondition.id_user = id_user;
    }
    if (id_dokter) {
      whereCondition.id_dokter = id_dokter;
    }
    if (status) {
      whereCondition.status = status;
    }
    if (tanggal) {
      whereCondition.tanggal = tanggal;
    }

    const data = await JanjiTemu.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        {
          model: Dokter,
          attributes: ["nama", "spesialis"],
        },
        {
          model: JadwalDokter,
          attributes: ["hari", "jam_mulai", "jam_selesai"],
        },
        {
          model: Antrian,
          attributes: ["nomor_antrian", "status"],
        },
        {
          model: User,
          attributes: ["nama"],
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

const getJanjiTemuById = async (req, res, next) => {
  try {
    const janjiTemu = await JanjiTemu.findOne({
      where: { id_janji: req.params.id, deleted_at: null },
      include: [
        {
          model: Dokter,
          attributes: ["nama", "spesialis", "biaya_konsultasi", "biaya_bpjs"],
        },
        {
          model: JadwalDokter,
          attributes: ["hari", "jam_mulai", "jam_selesai"],
        },
        {
          model: Antrian,
          attributes: ["nomor_antrian", "status", "estimasi_waktu"],
        },
        {
          model: User,
          attributes: ["nama", "no_telp", "no_bpjs", "status_bpjs"],
        },
        {
          model: RekamMedis,
          attributes: ["id_rekam", "tanggal", "diagnosa"],
        },
      ],
    });

    if (!janjiTemu) {
      return errorResponse(res, "Janji temu tidak ditemukan", 404);
    }

    successResponse(res, { janjiTemu });
  } catch (error) {
    next(error);
  }
};

const createJanjiTemu = async (req, res, next) => {
  try {
    await Promise.all(
      validateJanjiTemu.map((validation) => validation.run(req))
    );
    validateResult(req, res, async () => {
      const { id_dokter, id_jadwal, tanggal, keluhan, is_bpjs, rujukan_bpjs } =
        req.body;
      const id_user = req.user.id_user;

      // Verifikasi data (kode validasi tetap sama)
      const dokter = await Dokter.findOne({
        where: { id_dokter, deleted_at: null },
      });
      if (!dokter) {
        return errorResponse(res, "Dokter tidak ditemukan", 404);
      }

      const jadwal = await JadwalDokter.findOne({
        where: { id_jadwal, id_dokter, deleted_at: null },
      });
      if (!jadwal) {
        return errorResponse(res, "Jadwal tidak ditemukan", 404);
      }

      const hariJanji = new Date(tanggal).toLocaleDateString("id-ID", {
        weekday: "long",
      });
      if (hariJanji !== jadwal.hari) {
        return errorResponse(
          res,
          "Tanggal tidak sesuai dengan jadwal dokter",
          400
        );
      }

      const today = new Date().toISOString().split("T")[0];
      if (tanggal < today) {
        return errorResponse(
          res,
          "Tidak dapat membuat janji untuk tanggal yang sudah lewat",
          400
        );
      }

      const jumlahJanji = await JanjiTemu.count({
        where: {
          id_jadwal,
          tanggal,
          status: { [Op.notIn]: ["cancelled"] },
          deleted_at: null,
        },
      });

      if (jumlahJanji >= jadwal.kuota) {
        return errorResponse(
          res,
          "Kuota janji temu untuk tanggal ini sudah penuh",
          400
        );
      }

      // Mulai transaction
      const transaction = await sequelize.transaction();

      try {
        // 1. Buat antrian terlebih dahulu
        // Hitung nomor antrian berikutnya
        const lastAntrian = await Antrian.findOne({
          where: {
            id_jadwal,
            tanggal,
          },
          order: [["nomor_antrian", "DESC"]],
          transaction,
        });

        const nomorAntrian = lastAntrian ? lastAntrian.nomor_antrian + 1 : 1;

        // Buat antrian
        const antrian = await Antrian.create(
          {
            id_jadwal,
            tanggal,
            nomor_antrian: nomorAntrian,
            status: "menunggu",
          },
          { transaction }
        );

        // 2. Buat janji temu yang terkait dengan antrian
        const janjiTemu = await JanjiTemu.create(
          {
            id_dokter,
            id_user,
            id_jadwal,
            id_antrian: antrian.id_antrian, // Kaitkan dengan antrian
            tanggal,
            keluhan: keluhan || null,
            is_bpjs: is_bpjs || false,
            rujukan_bpjs: rujukan_bpjs || null,
            status: "pending",
          },
          { transaction }
        );

        // 3. Ambil data lengkap untuk email
        const janjiTemuWithDetails = await JanjiTemu.findByPk(
          janjiTemu.id_janji,
          {
            include: [
              {
                model: Dokter,
                attributes: ["nama", "spesialis"],
              },
              {
                model: JadwalDokter,
                attributes: ["jam_mulai", "jam_selesai"],
              },
              {
                model: Antrian,
                attributes: ["nomor_antrian"],
              },
              {
                model: User,
                attributes: ["nama", "email"],
              },
            ],
            transaction,
          }
        );

        // 4. Commit transaction
        await transaction.commit();

        // 5. Kirim email
        await sendAppointmentConfirmation(
          janjiTemuWithDetails.User,
          janjiTemuWithDetails
        );

        successResponse(res, { janjiTemu }, "Janji temu berhasil dibuat", 201);
      } catch (error) {
        // Rollback jika gagal
        await transaction.rollback();
        throw error;
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateStatusJanjiTemu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    if (!status) {
      return errorResponse(res, "Status diperlukan", 400);
    }

    const janjiTemu = await JanjiTemu.findOne({
      where: { id_janji: id, deleted_at: null },
      include: [
        {
          model: Antrian,
          attributes: ["id_antrian", "status"],
        },
      ],
    });

    if (!janjiTemu) {
      return errorResponse(res, "Janji temu tidak ditemukan", 404);
    }

    // Validasi transisi status
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[janjiTemu.status].includes(status)) {
      return errorResponse(res, "Transisi status tidak valid", 400);
    }

    const statusLama = janjiTemu.status;
    await janjiTemu.update({ status });

    // Jika ada antrian, update status antrian juga
    if (janjiTemu.Antrian) {
      let statusAntrian = janjiTemu.Antrian.status;

      if (status === "completed") {
        statusAntrian = "selesai";
      } else if (status === "cancelled") {
        statusAntrian = "batal";
      }

      await janjiTemu.Antrian.update({ status: statusAntrian });
    }

    // Catat riwayat status
    await RiwayatStatusJanji.create({
      id_janji: janjiTemu.id_janji,
      status_lama: statusLama,
      status_baru: status,
      catatan: catatan || null,
      id_user_pengubah: req.user.id_user,
    });

    successResponse(
      res,
      { janjiTemu },
      "Status janji temu berhasil diperbarui"
    );
  } catch (error) {
    next(error);
  }
};

const cancelJanjiTemu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const janjiTemu = await JanjiTemu.findOne({
      where: { id_janji: id, deleted_at: null },
      include: [
        {
          model: Antrian,
          attributes: ["id_antrian", "status"],
        },
      ],
    });

    if (!janjiTemu) {
      return errorResponse(res, "Janji temu tidak ditemukan", 404);
    }

    // Hanya janji temu dengan status pending atau confirmed yang bisa dibatalkan
    if (!["pending", "confirmed"].includes(janjiTemu.status)) {
      return errorResponse(
        res,
        "Janji temu tidak dapat dibatalkan pada status saat ini",
        400
      );
    }

    const statusLama = janjiTemu.status;
    await janjiTemu.update({ status: "cancelled" });

    // Jika ada antrian, update status antrian
    if (janjiTemu.Antrian) {
      await janjiTemu.Antrian.update({ status: "batal" });
    }

    // Catat riwayat status
    await RiwayatStatusJanji.create({
      id_janji: janjiTemu.id_janji,
      status_lama: statusLama,
      status_baru: "cancelled",
      catatan: catatan || "Dibatalkan oleh pengguna",
      id_user_pengubah: req.user.id_user,
    });

    successResponse(res, { janjiTemu }, "Janji temu berhasil dibatalkan");
  } catch (error) {
    next(error);
  }
};

const deleteJanjiTemu = async (req, res, next) => {
  try {
    const janjiTemu = await JanjiTemu.findOne({
      where: { id_janji: req.params.id, deleted_at: null },
      include: [
        {
          model: Antrian,
          attributes: ["id_antrian"],
        },
      ],
    });

    if (!janjiTemu) {
      return errorResponse(res, "Janji temu tidak ditemukan", 404);
    }

    // Hanya janji temu yang dibatalkan atau selesai yang bisa dihapus
    if (!["cancelled", "completed"].includes(janjiTemu.status)) {
      return errorResponse(
        res,
        "Janji temu tidak dapat dihapus pada status saat ini",
        400
      );
    }

    // Soft delete
    await janjiTemu.update({ deleted_at: new Date() });

    successResponse(res, null, "Janji temu berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJanjiTemu,
  getJanjiTemuById,
  createJanjiTemu,
  updateStatusJanjiTemu,
  cancelJanjiTemu,
  deleteJanjiTemu,
};
