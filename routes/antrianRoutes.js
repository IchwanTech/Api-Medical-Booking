const express = require("express");
const router = express.Router();
const {
  getAntrianByJadwal,
  getAntrianSaya,
  updateStatusAntrian,
  getAntrianSekarang,
} = require("../controllers/antrianController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAntrianByJadwal);
router.get("/saya", authenticate, getAntrianSaya);
router.put("/:id/status", authenticate, updateStatusAntrian);
router.get("/:id_jadwal/sekarang", authenticate, getAntrianSekarang);

module.exports = router;
