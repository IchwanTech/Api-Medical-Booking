const express = require("express");
const router = express.Router();
const {
  getAllDokter,
  getDokterById,
  createDokter,
  updateDokter,
  deleteDokter,
  searchDokterBySpecialization,
} = require("../controllers/dokterController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, getAllDokter);
router.get("/:id", authenticate, getDokterById);
router.post("/", authenticate, authorize(["admin"]), createDokter);
router.put("/:id", authenticate, authorize(["admin"]), updateDokter);
router.delete("/:id", authenticate, authorize(["admin"]), deleteDokter);
router.get("/spesialisasi/cari", authenticate, searchDokterBySpecialization);

module.exports = router;
