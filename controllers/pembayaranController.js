const {
  Pembayaran,
  JanjiTemu,
  PemesananKamar,
  Layanan,
  User,
  RiwayatStatusPembayaran,
  Dokter,
  Kamar,
} = require("../models");
const { validatePembayaran, validateResult } = require("../utils/validators");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseFormatter");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const { uploadBuktiPembayaran } = require("../middleware/upload");
const { Op } = require("sequelize");

const getAllPembayaran = async (req, res, next) => {
  try {
    const { page = 1, size = 10, id_user, status, metode, tanggal } = req.query;
    const { limit, offset } = getPagination(page, size);

    let whereCondition = { deleted_at: null };
    if (id_user) {
      whereCondition.id_user = id_user;
    }
    if (status) {
      whereCondition.status = status;
    }
    if (metode) {
      whereCondition.metode = metode;
    }
    if (tanggal) {
      whereCondition.tanggal_bayar = {
        [Op.between]: [new Date(tanggal), new Date(tanggal + "T23:59:59")],
      };
    }

    const data = await Pembayaran.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        {
          model: JanjiTemu,
          attributes: ["id_janji", "tanggal"],
          include: [
            {
              model: Dokter,
              attributes: ["nama"],
            },
          ],
        },
        {
          model: PemesananKamar,
          attributes: ["id_pemesanan", "tanggal_masuk", "tanggal_keluar"],
          include: [
            {
              model: Kamar,
              attributes: ["nomor_kamar"],
            },
          ],
        },
        {
          model: Layanan,
          attributes: ["nama_layanan"],
        },
        {
          model: User,
          attributes: ["nama"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const result = getPagingData(data, page, limit);
    paginatedResponse(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getPembayaranById = async (req, res, next) => {
  try {
    const pembayaran = await Pembayaran.findOne({
      where: { id_pembayaran: req.params.id, deleted_at: null },
      include: [
        {
          model: JanjiTemu,
          attributes: ["id_janji", "tanggal", "is_bpjs"],
          include: [
            {
              model: Dokter,
              attributes: ["nama", "biaya_konsultasi", "biaya_bpjs"],
            },
          ],
        },
        {
          model: PemesananKamar,
          attributes: [
            "id_pemesanan",
            "tanggal_masuk",
            "tanggal_keluar",
            "is_bpjs",
          ],
          include: [
            {
              model: Kamar,
              attributes: ["nomor_kamar"],
              include: [
                {
                  model: TipeKamar,
                  attributes: ["nama_tipe", "harga_per_malam", "harga_bpjs"],
                },
              ],
            },
          ],
        },
        {
          model: Layanan,
          attributes: [
            "nama_layanan",
            "harga",
            "harga_bpjs",
            "ditanggung_bpjs",
          ],
        },
        {
          model: User,
          attributes: ["nama", "no_bpjs", "status_bpjs"],
        },
        {
          model: RiwayatStatusPembayaran,
          attributes: ["status_lama", "status_baru", "created_at"],
          include: [
            {
              model: User,
              attributes: ["nama"],
            },
          ],
          order: [["created_at", "DESC"]],
        },
      ],
    });

    if (!pembayaran) {
      return errorResponse(res, "Pembayaran tidak ditemukan", 404);
    }

    successResponse(res, { pembayaran });
  } catch (error) {
    next(error);
  }
};

const createPembayaran = async (req, res, next) => {
  try {
    await Promise.all(
      validatePembayaran.map((validation) => validation.run(req))
    );
    validateResult(req, res, async () => {
      const {
        id_janji,
        id_pemesanan,
        id_layanan,
        jumlah,
        jumlah_bpjs,
        metode,
        no_klaim_bpjs,
      } = req.body;
      const id_user = req.user.id_user;

      const count = [id_janji, id_pemesanan, id_layanan].filter(Boolean).length;
      if (count !== 1) {
        return errorResponse(
          res,
          "Hanya satu dari id_janji, id_pemesanan, atau id_layanan yang boleh diisi",
          400
        );
      }

      let relatedEntity;
      let jumlahFinal = jumlah;
      let jumlahBpjsFinal = jumlah_bpjs || 0;

      if (id_janji) {
        relatedEntity = await JanjiTemu.findOne({
          where: { id_janji, deleted_at: null },
          include: [
            {
              model: Dokter,
              attributes: ["biaya_konsultasi", "biaya_bpjs"],
            },
          ],
        });

        if (!relatedEntity) {
          return errorResponse(res, "Janji temu tidak ditemukan", 404);
        }

        if (relatedEntity.is_bpjs && relatedEntity.Dokter.biaya_bpjs) {
          jumlahBpjsFinal = relatedEntity.Dokter.biaya_bpjs;
          jumlahFinal = 0;
        } else if (!jumlah) {
          jumlahFinal = relatedEntity.Dokter.biaya_konsultasi;
        }
      } else if (id_pemesanan) {
        relatedEntity = await PemesananKamar.findOne({
          where: { id_pemesanan, deleted_at: null },
          include: [
            {
              model: Kamar,
              attributes: ["id_tipe"],
              include: [
                {
                  model: TipeKamar,
                  attributes: ["harga_per_malam", "harga_bpjs"],
                },
              ],
            },
          ],
        });

        if (!relatedEntity) {
          return errorResponse(res, "Pemesanan kamar tidak ditemukan", 404);
        }

        const masuk = new Date(relatedEntity.tanggal_masuk);
        const keluar = new Date(relatedEntity.tanggal_keluar);
        const diffTime = Math.abs(keluar - masuk);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (relatedEntity.is_bpjs && relatedEntity.Kamar.TipeKamar.harga_bpjs) {
          jumlahBpjsFinal = relatedEntity.Kamar.TipeKamar.harga_bpjs * diffDays;
          jumlahFinal = 0;
        } else if (!jumlah) {
          jumlahFinal =
            relatedEntity.Kamar.TipeKamar.harga_per_malam * diffDays;
        }
      } else if (id_layanan) {
        relatedEntity = await Layanan.findOne({
          where: { id_layanan, deleted_at: null },
        });
        if (!relatedEntity) {
          return errorResponse(res, "Layanan tidak ditemukan", 404);
        }

        if (relatedEntity.ditanggung_bpjs && relatedEntity.harga_bpjs) {
          jumlahBpjsFinal = relatedEntity.harga_bpjs;
          jumlahFinal = 0;
        } else if (!jumlah) {
          jumlahFinal = relatedEntity.harga;
        }
      }

      const pembayaran = await Pembayaran.create({
        id_user,
        id_janji: id_janji || null,
        id_pemesanan: id_pemesanan || null,
        id_layanan: id_layanan || null,
        jumlah: jumlahFinal,
        jumlah_bpjs: jumlahBpjsFinal,
        metode,
        no_klaim_bpjs: no_klaim_bpjs || null,
        status: metode === "bpjs" ? "success" : "pending",
      });

      successResponse(res, { pembayaran }, "Pembayaran berhasil dibuat", 201);
    });
  } catch (error) {
    next(error);
  }
};

const uploadBuktiPembayaranHandler = async (req, res, next) => {
  try {
    uploadBuktiPembayaran(req, res, async (err) => {
      if (err) {
        return errorResponse(res, err.message, 400);
      }

      const { id } = req.params;

      const pembayaran = await Pembayaran.findOne({
        where: { id_pembayaran: id, deleted_at: null },
      });
      if (!pembayaran) {
        return errorResponse(res, "Pembayaran tidak ditemukan", 404);
      }

      if (pembayaran.status !== "pending") {
        return errorResponse(
          res,
          "Hanya pembayaran dengan status pending yang dapat mengunggah bukti",
          400
        );
      }

      await pembayaran.update({
        bukti_pembayaran: `/uploads/bukti-pembayaran/${req.file.filename}`,
      });

      successResponse(
        res,
        { pembayaran },
        "Bukti pembayaran berhasil diunggah"
      );
    });
  } catch (error) {
    next(error);
  }
};

const updateStatusPembayaran = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    if (!status) {
      return errorResponse(res, "Status diperlukan", 400);
    }

    const pembayaran = await Pembayaran.findOne({
      where: { id_pembayaran: id, deleted_at: null },
    });
    if (!pembayaran) {
      return errorResponse(res, "Pembayaran tidak ditemukan", 404);
    }

    const validTransitions = {
      pending: ["success", "failed"],
      success: ["refunded"],
      failed: [],
      refunded: [],
    };

    if (!validTransitions[pembayaran.status].includes(status)) {
      return errorResponse(res, "Transisi status tidak valid", 400);
    }

    const statusLama = pembayaran.status;
    await pembayaran.update({
      status,
      tanggal_bayar:
        status === "success" ? new Date() : pembayaran.tanggal_bayar,
    });

    await RiwayatStatusPembayaran.create({
      id_pembayaran: pembayaran.id_pembayaran,
      status_lama: statusLama,
      status_baru: status,
      catatan: catatan || null,
      id_user_pengubah: req.user.id_user,
    });

    successResponse(
      res,
      { pembayaran },
      "Status pembayaran berhasil diperbarui"
    );
  } catch (error) {
    next(error);
  }
};

const deletePembayaran = async (req, res, next) => {
  try {
    const pembayaran = await Pembayaran.findOne({
      where: { id_pembayaran: req.params.id, deleted_at: null },
    });
    if (!pembayaran) {
      return errorResponse(res, "Pembayaran tidak ditemukan", 404);
    }

    if (!["pending", "failed"].includes(pembayaran.status)) {
      return errorResponse(
        res,
        "Pembayaran tidak dapat dihapus pada status saat ini",
        400
      );
    }

    // Soft delete
    await pembayaran.update({ deleted_at: new Date() });

    successResponse(res, null, "Pembayaran berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPembayaran,
  getPembayaranById,
  createPembayaran,
  uploadBuktiPembayaranHandler,
  updateStatusPembayaran,
  deletePembayaran,
};
