const express = require("express");
const router = express.Router();
const {
  getAllObat,
  getObatById,
  createObat,
  updateObat,
  updateStokObat,
  deleteObat,
} = require("../controllers/obatController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAllObat);
router.get("/:id", authenticate, getObatById);
router.post("/", authenticate, createObat);
router.put("/:id", authenticate, updateObat);
router.put("/:id/stok", authenticate, updateStokObat);
router.delete("/:id", authenticate, deleteObat);

module.exports = router;
