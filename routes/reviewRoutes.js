const express = require("express");
const router = express.Router();
const {
  getAllReview,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getRatingSummary,
} = require("../controllers/reviewController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAllReview);
router.get("/:id", authenticate, getReviewById);
router.post("/", authenticate, createReview);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);
router.get("/rating/summary", authenticate, getRatingSummary);

module.exports = router;
