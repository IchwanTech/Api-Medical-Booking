const express = require("express");
const router = express.Router();
const {
  getAllNotifikasi,
  getNotifikasiById,
  markAsRead,
  markAllAsRead,
  deleteNotifikasi,
} = require("../controllers/notifikasiController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAllNotifikasi);
router.get("/:id", authenticate, getNotifikasiById);
router.put("/:id/baca", authenticate, markAsRead);
router.put("/baca-semua", authenticate, markAllAsRead);
router.delete("/:id", authenticate, deleteNotifikasi);

module.exports = router;
