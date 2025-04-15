const {
  PemesananKamar,
  Kamar,
  TipeKamar,
  RiwayatStatusPemesanan,
  User,
} = require("../models");
const {
  validatePemesananKamar,
  validateResult,
} = require("../utils/validators");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseFormatter");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const { Op } = require("sequelize");

const getAllPemesanan = async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 10,
      id_user,
      status,
      tanggal_masuk,
      tanggal_keluar,
    } = req.query;
    const { limit, offset } = getPagination(page, size);

    let whereCondition = { deleted_at: null };
    if (id_user) {
      whereCondition.id_user = id_user;
    }
    if (status) {
      whereCondition.status = status;
    }
    if (tanggal_masuk && tanggal_keluar) {
      whereCondition.tanggal_masuk = {
        [Op.between]: [tanggal_masuk, tanggal_keluar],
      };
    } else if (tanggal_masuk) {
      whereCondition.tanggal_masuk = { [Op.gte]: tanggal_masuk };
    } else if (tanggal_keluar) {
      whereCondition.tanggal_keluar = { [Op.lte]: tanggal_keluar };
    }

    const data = await PemesananKamar.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        {
          model: Kamar,
          attributes: ["nomor_kamar", "lantai", "status"],
          include: [
            {
              model: TipeKamar,
              attributes: ["nama_tipe", "harga_per_malam", "harga_bpjs"],
            },
          ],
        },
        {
          model: User,
          attributes: ["nama", "email"],
        },
      ],
      order: [["tanggal_masuk", "DESC"]],
    });

    const result = getPagingData(data, page, limit);
    paginatedResponse(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getPemesananById = async (req, res, next) => {
  try {
    const pemesanan = await PemesananKamar.findOne({
      where: { id_pemesanan: req.params.id, deleted_at: null },
      include: [
        {
          model: Kamar,
          attributes: ["nomor_kamar", "lantai", "status"],
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
            },
            {
              model: FotoKamar,
              attributes: ["url_foto"],
              where: { is_primary: true },
              required: false,
            },
          ],
        },
        {
          model: User,
          attributes: ["nama", "email", "no_telp", "no_bpjs", "status_bpjs"],
        },
        {
          model: RiwayatStatusPemesanan,
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

    if (!pemesanan) {
      return errorResponse(res, "Pemesanan tidak ditemukan", 404);
    }

    successResponse(res, { pemesanan });
  } catch (error) {
    next(error);
  }
};

const createPemesanan = async (req, res, next) => {
  try {
    await Promise.all(
      validatePemesananKamar.map((validation) => validation.run(req))
    );
    validateResult(req, res, async () => {
      const {
        id_kamar,
        tanggal_masuk,
        tanggal_keluar,
        catatan,
        is_bpjs,
        rujukan_bpjs,
      } = req.body;
      const id_user = req.user.id_user;

      // Cek apakah kamar ada dan tersedia
      const kamar = await Kamar.findOne({
        where: { id_kamar, deleted_at: null },
        include: [
          {
            model: TipeKamar,
            attributes: ["harga_per_malam", "harga_bpjs"],
          },
        ],
      });

      if (!kamar) {
        return errorResponse(res, "Kamar tidak ditemukan", 404);
      }

      if (kamar.status !== "tersedia") {
        return errorResponse(res, "Kamar tidak tersedia", 400);
      }

      // Cek ketersediaan kamar pada rentang tanggal tersebut
      const pemesananKonflik = await PemesananKamar.findOne({
        where: {
          id_kamar,
          [Op.or]: [
            {
              tanggal_masuk: { [Op.between]: [tanggal_masuk, tanggal_keluar] },
            },
            {
              tanggal_keluar: { [Op.between]: [tanggal_masuk, tanggal_keluar] },
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
      });

      if (pemesananKonflik) {
        return errorResponse(
          res,
          "Kamar tidak tersedia pada tanggal yang diminta",
          400
        );
      }

      // Hitung jumlah hari
      const masuk = new Date(tanggal_masuk);
      const keluar = new Date(tanggal_keluar);
      const diffTime = Math.abs(keluar - masuk);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Hitung total biaya
      const hargaPerMalam =
        is_bpjs && kamar.TipeKamar.harga_bpjs
          ? kamar.TipeKamar.harga_bpjs
          : kamar.TipeKamar.harga_per_malam;
      const totalBiaya = hargaPerMalam * diffDays;

      const pemesanan = await PemesananKamar.create({
        id_user,
        id_kamar,
        tanggal_masuk,
        tanggal_keluar,
        catatan: catatan || null,
        is_bpjs: is_bpjs || false,
        rujukan_bpjs: rujukan_bpjs || null,
        status: "pending",
      });

      // Update status kamar
      await kamar.update({ status: "terisi" });

      // Catat riwayat status
      await RiwayatStatusPemesanan.create({
        id_pemesanan: pemesanan.id_pemesanan,
        status_lama: null,
        status_baru: "pending",
        catatan: "Pemesanan dibuat",
        id_user_pengubah: id_user,
      });

      successResponse(
        res,
        {
          pemesanan,
          total_biaya: totalBiaya,
        },
        "Pemesanan kamar berhasil dibuat",
        201
      );
    });
  } catch (error) {
    next(error);
  }
};

const updateStatusPemesanan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    if (!status) {
      return errorResponse(res, "Status diperlukan", 400);
    }

    const pemesanan = await PemesananKamar.findOne({
      where: { id_pemesanan: id, deleted_at: null },
      include: [
        {
          model: Kamar,
          attributes: ["id_kamar", "status"],
        },
      ],
    });

    if (!pemesanan) {
      return errorResponse(res, "Pemesanan tidak ditemukan", 404);
    }

    // Validasi transisi status
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["checked_in", "cancelled"],
      checked_in: ["checked_out"],
      checked_out: [],
      cancelled: [],
    };

    if (!validTransitions[pemesanan.status].includes(status)) {
      return errorResponse(res, "Transisi status tidak valid", 400);
    }

    const statusLama = pemesanan.status;
    await pemesanan.update({ status });

    // Update status kamar jika diperlukan
    if (status === "checked_out" || status === "cancelled") {
      await pemesanan.Kamar.update({ status: "tersedia" });
    } else if (status === "checked_in") {
      await pemesanan.Kamar.update({ status: "terisi" });
    }

    // Catat riwayat status
    await RiwayatStatusPemesanan.create({
      id_pemesanan: pemesanan.id_pemesanan,
      status_lama: statusLama,
      status_baru: status,
      catatan: catatan || null,
      id_user_pengubah: req.user.id_user,
    });

    successResponse(res, { pemesanan }, "Status pemesanan berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

const cancelPemesanan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const pemesanan = await PemesananKamar.findOne({
      where: { id_pemesanan: id, deleted_at: null },
      include: [
        {
          model: Kamar,
          attributes: ["id_kamar", "status"],
        },
      ],
    });

    if (!pemesanan) {
      return errorResponse(res, "Pemesanan tidak ditemukan", 404);
    }

    // Hanya pemesanan dengan status pending atau confirmed yang bisa dibatalkan
    if (!["pending", "confirmed"].includes(pemesanan.status)) {
      return errorResponse(
        res,
        "Pemesanan tidak dapat dibatalkan pada status saat ini",
        400
      );
    }

    const statusLama = pemesanan.status;
    await pemesanan.update({ status: "cancelled" });

    // Update status kamar
    await pemesanan.Kamar.update({ status: "tersedia" });

    // Catat riwayat status
    await RiwayatStatusPemesanan.create({
      id_pemesanan: pemesanan.id_pemesanan,
      status_lama: statusLama,
      status_baru: "cancelled",
      catatan: catatan || "Dibatalkan oleh pengguna",
      id_user_pengubah: req.user.id_user,
    });

    successResponse(res, { pemesanan }, "Pemesanan berhasil dibatalkan");
  } catch (error) {
    next(error);
  }
};

const deletePemesanan = async (req, res, next) => {
  try {
    const pemesanan = await PemesananKamar.findOne({
      where: { id_pemesanan: req.params.id, deleted_at: null },
      include: [
        {
          model: Kamar,
          attributes: ["id_kamar", "status"],
        },
      ],
    });

    if (!pemesanan) {
      return errorResponse(res, "Pemesanan tidak ditemukan", 404);
    }

    // Hanya pemesanan yang dibatalkan atau selesai yang bisa dihapus
    if (!["cancelled", "checked_out"].includes(pemesanan.status)) {
      return errorResponse(
        res,
        "Pemesanan tidak dapat dihapus pada status saat ini",
        400
      );
    }

    // Soft delete
    await pemesanan.update({ deleted_at: new Date() });

    successResponse(res, null, "Pemesanan berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPemesanan,
  getPemesananById,
  createPemesanan,
  updateStatusPemesanan,
  cancelPemesanan,
  deletePemesanan,
};
