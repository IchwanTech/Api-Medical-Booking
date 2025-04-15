const express = require("express");
const router = express.Router();
const {
  getAllTipeKamar,
  getTipeKamarById,
  createTipeKamar,
  updateTipeKamar,
  deleteTipeKamar,
  getAllKamar,
  getKamarById,
  createKamar,
  updateKamar,
  deleteKamar,
  getKamarTersedia,
  addFotoKamar,
  updateFotoKamar,
  deleteFotoKamar,
} = require("../controllers/kamarController");
const { authenticate } = require("../middleware/auth");
const { get } = require("../server");

// Tipe Kamar
router.get("/tipe", authenticate, getAllTipeKamar);
router.get("/tipe/:id", authenticate, getTipeKamarById);
router.post("/tipe", authenticate, createTipeKamar);
router.put("/tipe/:id", authenticate, updateTipeKamar);
router.delete("/tipe/:id", authenticate, deleteTipeKamar);

// Kamar
router.get("/tersedia", authenticate, getKamarTersedia);
router.get("/", authenticate, getAllKamar);
router.get("/:id", authenticate, getKamarById);
router.post("/", authenticate, createKamar);
router.put("/:id", authenticate, updateKamar);
router.delete("/:id", authenticate, deleteKamar);

// Foto Kamar
router.post("/:id_kamar/foto", authenticate, addFotoKamar);
router.put("/:id_kamar/foto/:id_foto", authenticate, updateFotoKamar);
router.delete("/:id_kamar/foto/:id_foto", authenticate, deleteFotoKamar);

module.exports = router;
