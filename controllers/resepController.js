const { ResepObat, RekamMedis, Obat, RiwayatStokObat } = require("../models");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");

const createResep = async (req, res, next) => {
  try {
    const { id_rekam, id_obat, dosis, jumlah, aturan_pakai, is_bpjs } =
      req.body;

    const rekamMedis = await RekamMedis.findOne({
      where: { id_rekam, deleted_at: null },
    });
    if (!rekamMedis) {
      return errorResponse(res, "Rekam medis tidak ditemukan", 404);
    }

    const obat = await Obat.findOne({ where: { id_obat, deleted_at: null } });
    if (!obat) {
      return errorResponse(res, "Obat tidak ditemukan", 404);
    }

    if (obat.stok < jumlah) {
      return errorResponse(res, "Stok obat tidak mencukupi", 400);
    }

    const resep = await ResepObat.create({
      id_rekam,
      id_obat,
      dosis,
      jumlah,
      aturan_pakai,
      is_bpjs: is_bpjs || false,
    });

    await obat.update({ stok: obat.stok - jumlah });

    await RiwayatStokObat.create({
      id_obat: obat.id_obat,
      stok_sebelum: obat.stok + jumlah,
      stok_sesudah: obat.stok,
      jumlah_perubahan: jumlah,
      tipe_perubahan: "pengurangan",
      catatan: `Resep untuk rekam medis #${id_rekam}`,
      id_user_pengubah: req.user.id_user,
    });

    successResponse(res, { resep }, "Resep berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};

const updateResep = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dosis, jumlah, aturan_pakai, is_bpjs } = req.body;

    const resep = await ResepObat.findOne({
      where: { id_resep: id, deleted_at: null },
      include: [
        {
          model: Obat,
          attributes: ["id_obat", "stok"],
        },
      ],
    });

    if (!resep) {
      return errorResponse(res, "Resep tidak ditemukan", 404);
    }

    if (jumlah && jumlah !== resep.jumlah) {
      const selisih = jumlah - resep.jumlah;

      if (selisih > 0 && resep.Obat.stok < selisih) {
        return errorResponse(res, "Stok obat tidak mencukupi", 400);
      }

      await resep.Obat.update({ stok: resep.Obat.stok - selisih });

      await RiwayatStokObat.create({
        id_obat: resep.Obat.id_obat,
        stok_sebelum: resep.Obat.stok + selisih,
        stok_sesudah: resep.Obat.stok,
        jumlah_perubahan: Math.abs(selisih),
        tipe_perubahan: selisih > 0 ? "pengurangan" : "penambahan",
        catatan: `Perubahan resep #${id}`,
        id_user_pengubah: req.user.id_user,
      });
    }

    await resep.update({
      dosis: dosis || resep.dosis,
      jumlah: jumlah || resep.jumlah,
      aturan_pakai: aturan_pakai || resep.aturan_pakai,
      is_bpjs: is_bpjs || resep.is_bpjs,
    });

    successResponse(res, { resep }, "Resep berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

const deleteResep = async (req, res, next) => {
  try {
    const resep = await ResepObat.findOne({
      where: { id_resep: req.params.id, deleted_at: null },
      include: [
        {
          model: Obat,
          attributes: ["id_obat", "stok"],
        },
      ],
    });

    if (!resep) {
      return errorResponse(res, "Resep tidak ditemukan", 404);
    }

    await resep.Obat.update({ stok: resep.Obat.stok + resep.jumlah });

    await RiwayatStokObat.create({
      id_obat: resep.Obat.id_obat,
      stok_sebelum: resep.Obat.stok - resep.jumlah,
      stok_sesudah: resep.Obat.stok,
      jumlah_perubahan: resep.jumlah,
      tipe_perubahan: "penambahan",
      catatan: `Pembatalan resep #${resep.id_resep}`,
      id_user_pengubah: req.user.id_user,
    });

    await resep.update({ deleted_at: new Date() });

    successResponse(res, null, "Resep berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResep,
  updateResep,
  deleteResep,
};
