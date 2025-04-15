const express = require("express");
const router = express.Router();
const {
  getAllPembayaran,
  getPembayaranById,
  createPembayaran,
  updateStatusPembayaran,
  deletePembayaran,
  uploadBuktiPembayaranHandler,
} = require("../controllers/pembayaranController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAllPembayaran);
router.get("/:id", authenticate, getPembayaranById);
router.post("/", authenticate, createPembayaran);
router.post("/:id/bukti", authenticate, uploadBuktiPembayaranHandler);
router.put("/:id/status", authenticate, updateStatusPembayaran);
router.delete("/:id", authenticate, deletePembayaran);

module.exports = router;
