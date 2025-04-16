const { Review, Dokter, Layanan, PemesananKamar, User } = require("../models");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseFormatter");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const { Op } = require("sequelize");

const getAllReview = async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 10,
      id_dokter,
      id_layanan,
      id_pemesanan,
      rating,
    } = req.query;
    const { limit, offset } = getPagination(page, size);

    let whereCondition = { deleted_at: null };
    if (id_dokter) {
      whereCondition.id_dokter = id_dokter;
    }
    if (id_layanan) {
      whereCondition.id_layanan = id_layanan;
    }
    if (id_pemesanan) {
      whereCondition.id_pemesanan = id_pemesanan;
    }
    if (rating) {
      whereCondition.rating = rating;
    }

    const data = await Review.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        {
          model: Dokter,
          attributes: ["nama", "spesialis"],
        },
        {
          model: Layanan,
          attributes: ["nama_layanan"],
        },
        {
          model: PemesananKamar,
          attributes: ["id_pemesanan"],
          include: [
            {
              model: Kamar,
              attributes: ["nomor_kamar"],
            },
          ],
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

const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      where: { id_review: req.params.id, deleted_at: null },
      include: [
        {
          model: Dokter,
          attributes: ["nama", "spesialis"],
        },
        {
          model: Layanan,
          attributes: ["nama_layanan"],
        },
        {
          model: PemesananKamar,
          attributes: ["id_pemesanan"],
          include: [
            {
              model: Kamar,
              attributes: ["nomor_kamar"],
            },
          ],
        },
        {
          model: User,
          attributes: ["nama"],
        },
      ],
    });

    if (!review) {
      return errorResponse(res, "Review tidak ditemukan", 404);
    }

    successResponse(res, { review });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const {
      id_dokter,
      id_layanan,
      id_pemesanan,
      rating,
      komentar,
      is_anonymous,
    } = req.body;
    const id_user = req.user.id_user;

    const count = [id_dokter, id_layanan, id_pemesanan].filter(Boolean).length;
    if (count !== 1) {
      return errorResponse(
        res,
        "Hanya satu dari id_dokter, id_layanan, atau id_pemesanan yang boleh diisi",
        400
      );
    }

    if (rating < 1 || rating > 5) {
      return errorResponse(res, "Rating harus antara 1 sampai 5", 400);
    }

    let relatedEntity;
    if (id_dokter) {
      relatedEntity = await Dokter.findOne({
        where: { id_dokter, deleted_at: null },
      });
      if (!relatedEntity) {
        return errorResponse(res, "Dokter tidak ditemukan", 404);
      }
    } else if (id_layanan) {
      relatedEntity = await Layanan.findOne({
        where: { id_layanan, deleted_at: null },
      });
      if (!relatedEntity) {
        return errorResponse(res, "Layanan tidak ditemukan", 404);
      }
    } else if (id_pemesanan) {
      relatedEntity = await PemesananKamar.findOne({
        where: { id_pemesanan, deleted_at: null },
        include: [
          {
            model: User,
            attributes: ["id_user"],
          },
        ],
      });

      if (!relatedEntity) {
        return errorResponse(res, "Pemesanan kamar tidak ditemukan", 404);
      }

      if (relatedEntity.User.id_user !== id_user) {
        return errorResponse(
          res,
          "Anda hanya dapat memberikan review untuk pemesanan Anda sendiri",
          403
        );
      }
    }

    const review = await Review.create({
      id_user,
      id_dokter: id_dokter || null,
      id_layanan: id_layanan || null,
      id_pemesanan: id_pemesanan || null,
      rating,
      komentar: komentar || null,
      is_anonymous: is_anonymous || false,
    });

    successResponse(res, { review }, "Review berhasil ditambahkan", 201);
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, komentar, is_anonymous } = req.body;
    const id_user = req.user.id_user;

    const review = await Review.findOne({
      where: { id_review: id, deleted_at: null },
    });
    if (!review) {
      return errorResponse(res, "Review tidak ditemukan", 404);
    }

    if (review.id_user !== id_user) {
      return errorResponse(
        res,
        "Anda hanya dapat mengupdate review Anda sendiri",
        403
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return errorResponse(res, "Rating harus antara 1 sampai 5", 400);
    }

    await review.update({
      rating: rating || review.rating,
      komentar: komentar || review.komentar,
      is_anonymous: is_anonymous || review.is_anonymous,
    });

    successResponse(res, { review }, "Review berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      where: { id_review: req.params.id, deleted_at: null },
    });
    if (!review) {
      return errorResponse(res, "Review tidak ditemukan", 404);
    }

    if (review.id_user !== req.user.id_user && req.user.role !== "admin") {
      return errorResponse(
        res,
        "Anda tidak memiliki izin untuk menghapus review ini",
        403
      );
    }

    await review.update({ deleted_at: new Date() });

    successResponse(res, null, "Review berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

const getRatingSummary = async (req, res, next) => {
  try {
    const { id_dokter, id_layanan, id_pemesanan } = req.query;

    const count = [id_dokter, id_layanan, id_pemesanan].filter(Boolean).length;
    if (count !== 1) {
      return errorResponse(
        res,
        "Hanya satu dari id_dokter, id_layanan, atau id_pemesanan yang boleh diisi",
        400
      );
    }

    let whereCondition = { deleted_at: null };
    if (id_dokter) {
      whereCondition.id_dokter = id_dokter;
    } else if (id_layanan) {
      whereCondition.id_layanan = id_layanan;
    } else if (id_pemesanan) {
      whereCondition.id_pemesanan = id_pemesanan;
    }

    const reviews = await Review.findAll({
      where: whereCondition,
      attributes: ["rating"],
    });

    const totalReviews = reviews.length;
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      ratingCounts[review.rating]++;
    });

    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    successResponse(res, {
      total_reviews: totalReviews,
      average_rating: parseFloat(averageRating.toFixed(1)),
      rating_counts: ratingCounts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReview,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getRatingSummary,
};
