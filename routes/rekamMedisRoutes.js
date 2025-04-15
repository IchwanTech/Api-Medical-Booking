const express = require("express");
const router = express.Router();
const {
  getAllRekamMedis,
  getRekamMedisById,
  createRekamMedis,
  updateRekamMedis,
  deleteRekamMedis,
  addLampiranRekamMedis,
  deleteLampiranRekamMedis,
} = require("../controllers/rekamMedisController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAllRekamMedis);
router.get("/:id", authenticate, getRekamMedisById);
router.post("/", authenticate, createRekamMedis);
router.put("/:id", authenticate, updateRekamMedis);
router.delete("/:id", authenticate, deleteRekamMedis);
router.post("/:id_rekam/lampiran", authenticate, addLampiranRekamMedis);
router.delete(
  "/:id_rekam/lampiran/:id_lampiran",
  authenticate,
  deleteLampiranRekamMedis
);

module.exports = router;
