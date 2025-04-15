const express = require("express");
const router = express.Router();
const {
  getAllJadwal,
  getJadwalById,
  createJadwal,
  updateJadwal,
  deleteJadwal,
  getJadwalHariIni,
} = require("../controllers/jadwalDokter");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAllJadwal);
router.get("/hari-ini", authenticate, getJadwalHariIni);
router.get("/:id", authenticate, getJadwalById);
router.post("/", authenticate, createJadwal);
router.put("/:id", authenticate, updateJadwal);
router.delete("/:id", authenticate, deleteJadwal);

module.exports = router;
