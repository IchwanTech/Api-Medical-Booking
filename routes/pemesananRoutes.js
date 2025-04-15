const express = require("express");
const router = express.Router();
const {
  getAllPemesanan,
  getPemesananById,
  createPemesanan,
  updateStatusPemesanan,
  cancelPemesanan,
  deletePemesanan,
} = require("../controllers/pemesananController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAllPemesanan);
router.get("/:id", authenticate, getPemesananById);
router.post("/", authenticate, createPemesanan);
router.put("/:id/status", authenticate, updateStatusPemesanan);
router.post("/:id/batal", authenticate, cancelPemesanan);
router.delete("/:id", authenticate, deletePemesanan);

module.exports = router;
