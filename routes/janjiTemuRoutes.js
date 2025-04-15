const express = require("express");
const router = express.Router();
const {
  getAllJanjiTemu,
  getJanjiTemuById,
  createJanjiTemu,
  updateStatusJanjiTemu,
  cancelJanjiTemu,
  deleteJanjiTemu,
} = require("../controllers/janjiTemuController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAllJanjiTemu);
router.get("/:id", authenticate, getJanjiTemuById);
router.post("/", authenticate, createJanjiTemu);
router.put("/:id/status", authenticate, updateStatusJanjiTemu);
router.post("/:id/batal", authenticate, cancelJanjiTemu);
router.delete("/:id", authenticate, deleteJanjiTemu);

module.exports = router;
