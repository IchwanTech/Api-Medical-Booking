const { Dokter, JadwalDokter, Review, User } = require("../models");
const { Op } = require("sequelize");
const { check, validationResult } = require("express-validator");
const { validateDokter } = require("../utils/validators");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseFormatter");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const { uploadFotoDokter } = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

const getAllDokter = async (req, res, next) => {
  try {
    const { page = 1, size = 10, spesialis } = req.query;
    const { limit, offset } = getPagination(page, size);

    let whereCondition = { deleted_at: null };
    if (spesialis) {
      whereCondition.spesialis = spesialis;
    }

    const data = await Dokter.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        {
          model: Review,
          attributes: ["rating"],
          where: { deleted_at: null },
          required: false,
        },
      ],
      order: [["nama", "ASC"]],
    });

    // Hitung rating rata-rata
    const dokterWithRating = data.rows.map((dokter) => {
      const ratings = dokter.Reviews.map((review) => review.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      const dokterJson = dokter.toJSON();
      delete dokterJson.Reviews;

      return {
        ...dokterJson,
        rating: parseFloat(avgRating.toFixed(1)),
        total_review: ratings.length,
      };
    });

    const responseData = {
      count: data.count,
      rows: dokterWithRating,
    };

    const result = getPagingData(responseData, page, limit);
    paginatedResponse(res, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getDokterById = async (req, res, next) => {
  try {
    const dokter = await Dokter.findOne({
      where: { id_dokter: req.params.id, deleted_at: null },
      include: [
        {
          model: JadwalDokter,
          where: { deleted_at: null },
          required: false,
        },
        {
          model: Review,
          where: { deleted_at: null },
          required: false,
          include: [
            {
              model: User,
              attributes: ["nama"],
            },
          ],
        },
      ],
    });

    if (!dokter) {
      return errorResponse(res, "Dokter tidak ditemukan", 404);
    }

    // Hitung rating rata-rata
    const ratings = dokter.Reviews.map((review) => review.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    const dokterJson = dokter.toJSON();
    delete dokterJson.Reviews;

    successResponse(res, {
      ...dokterJson,
      rating: parseFloat(avgRating.toFixed(1)),
      total_review: ratings.length,
    });
  } catch (error) {
    next(error);
  }
};

const createDokter = async (req, res, next) => {
  try {
    // Jalankan middleware upload terlebih dahulu
    uploadFotoDokter(req, res, async (err) => {
      if (err) {
        return errorResponse(res, err.message, 400);
      }

      console.log("Body setelah upload:", req.body);
      console.log("File uploaded:", req.file);

      // Konversi nilai-nilai numerik
      if (req.body.biaya_konsultasi) {
        req.body.biaya_konsultasi = parseFloat(req.body.biaya_konsultasi);
      }

      if (req.body.biaya_bpjs) {
        req.body.biaya_bpjs = parseFloat(req.body.biaya_bpjs);
      }

      if (req.body.pengalaman) {
        req.body.pengalaman = parseInt(req.body.pengalaman);
      }

      await Promise.all(
        validateDokter.map((validation) => validation.run(req))
      );
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        nama,
        spesialis,
        no_str,
        biaya_konsultasi,
        biaya_bpjs,
        deskripsi,
        pengalaman,
      } = req.body;

      // Cek apakah no_str sudah digunakan
      const existingDokter = await Dokter.findOne({ where: { no_str } });
      if (existingDokter) {
        // Hapus file jika validasi gagal
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return errorResponse(res, "Nomor STR sudah digunakan", 400);
      }

      const dokterData = {
        nama,
        spesialis,
        no_str,
        biaya_konsultasi,
        biaya_bpjs: biaya_bpjs || null,
        deskripsi: deskripsi || null,
        pengalaman: pengalaman || null,
      };

      if (req.file) {
        // Gunakan path relatif untuk menyimpan di database
        dokterData.foto = `/uploads/${req.file.filename}`;
      }

      const dokter = await Dokter.create(dokterData);
      successResponse(res, { dokter }, "Dokter berhasil ditambahkan", 201);
    });
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};

const updateDokter = async (req, res, next) => {
  try {
    uploadFotoDokter(req, res, async (err) => {
      if (err) {
        return errorResponse(res, err.message, 400);
      }

      console.log("Update body:", req.body);
      console.log("Update file:", req.file);

      // Konversi nilai-nilai numerik
      if (req.body.biaya_konsultasi) {
        req.body.biaya_konsultasi = parseFloat(req.body.biaya_konsultasi);
      }

      if (req.body.biaya_bpjs) {
        req.body.biaya_bpjs = parseFloat(req.body.biaya_bpjs);
      }

      if (req.body.pengalaman) {
        req.body.pengalaman = parseInt(req.body.pengalaman);
      }

      // Validasi setelah konversi
      await Promise.all(
        validateDokter.map((validation) => validation.run(req))
      );
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const {
        nama,
        spesialis,
        no_str,
        biaya_konsultasi,
        biaya_bpjs,
        deskripsi,
        pengalaman,
      } = req.body;

      const dokter = await Dokter.findOne({
        where: { id_dokter: id, deleted_at: null },
      });

      if (!dokter) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return errorResponse(res, "Dokter tidak ditemukan", 404);
      }

      if (no_str && no_str !== dokter.no_str) {
        const existingDokter = await Dokter.findOne({
          where: {
            no_str,
            id_dokter: { [Op.ne]: id },
          },
        });

        if (existingDokter) {
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return errorResponse(res, "Nomor STR sudah digunakan", 400);
        }
      }

      const updateData = {
        nama: nama || dokter.nama,
        spesialis: spesialis || dokter.spesialis,
        no_str: no_str || dokter.no_str,
        biaya_konsultasi: biaya_konsultasi || dokter.biaya_konsultasi,
        biaya_bpjs: biaya_bpjs !== undefined ? biaya_bpjs : dokter.biaya_bpjs,
        deskripsi: deskripsi !== undefined ? deskripsi : dokter.deskripsi,
        pengalaman: pengalaman !== undefined ? pengalaman : dokter.pengalaman,
      };

      let oldFotoPath = null;

      if (req.file) {
        // Jika ada foto lama dan foto baru diupload
        if (dokter.foto) {
          // Pastikan path diarahkan dengan benar ke lokasi file
          oldFotoPath = path.join(__dirname, "../public", dokter.foto);
          console.log("Foto lama yang akan dihapus:", oldFotoPath);
        }

        // Set foto baru
        updateData.foto = `/uploads/${req.file.filename}`;
      }

      // Update data dokter dulu
      const updatedDokter = await dokter.update(updateData);

      // Hapus file lama jika ada dan file tersebut ada
      if (oldFotoPath) {
        try {
          if (fs.existsSync(oldFotoPath)) {
            console.log("Menghapus foto lama:", oldFotoPath);
            fs.unlinkSync(oldFotoPath);
            console.log("Foto lama berhasil dihapus");
          } else {
            console.log("File foto lama tidak ditemukan:", oldFotoPath);
          }
        } catch (err) {
          console.error("Error saat menghapus foto lama:", err);
          // Lanjutkan proses meskipun gagal menghapus foto lama
        }
      }

      successResponse(
        res,
        { dokter: updatedDokter },
        "Data dokter berhasil diperbarui"
      );
    });
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};

const deleteDokter = async (req, res, next) => {
  try {
    const dokter = await Dokter.findOne({
      where: { id_dokter: req.params.id, deleted_at: null },
    });

    if (!dokter) {
      return errorResponse(res, "Dokter tidak ditemukan", 404);
    }

    if (dokter.foto) {
      const fotoPath = path.join(__dirname, "../public", dokter.foto);
      if (fs.existsSync(fotoPath)) {
        console.log(`Menghapus foto: ${fotoPath}`);
        fs.unlinkSync(fotoPath);
      }
    }

    await dokter.update({ deleted_at: new Date() });

    successResponse(res, null, "Dokter berhasil dihapus");
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};

const searchDokterBySpecialization = async (req, res, next) => {
  try {
    const { spesialis } = req.query;
    if (!spesialis) {
      return errorResponse(res, "Parameter spesialis diperlukan", 400);
    }

    const dokters = await Dokter.findAll({
      where: {
        spesialis: { [Op.like]: `%${spesialis}%` },
        deleted_at: null,
      },
      include: [
        {
          model: Review,
          attributes: ["rating"],
          where: { deleted_at: null },
          required: false,
        },
      ],
    });

    const result = dokters.map((dokter) => {
      const ratings = dokter.Reviews.map((review) => review.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      const dokterJson = dokter.toJSON();
      delete dokterJson.Reviews;

      return {
        ...dokterJson,
        rating: parseFloat(avgRating.toFixed(1)),
        total_review: ratings.length,
      };
    });

    successResponse(res, { dokters: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDokter,
  getDokterById,
  createDokter,
  updateDokter,
  deleteDokter,
  searchDokterBySpecialization,
};
