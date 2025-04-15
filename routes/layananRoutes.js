const express = require("express");
const router = express.Router();
const {
  getAllLayanan,
  getLayananById,
  createLayanan,
  updateLayanan,
  deleteLayanan,
} = require("../controllers/layananController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, getAllLayanan);
router.get("/:id", authenticate, getLayananById);
router.post("/", authenticate, createLayanan);
router.put("/:id", authenticate, updateLayanan);
router.delete("/:id", authenticate, deleteLayanan);

module.exports = router;
