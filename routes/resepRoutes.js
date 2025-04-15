const express = require("express");
const router = express.Router();
const {
  createResep,
  updateResep,
  deleteResep,
} = require("../controllers/resepController");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, createResep);
router.put("/:id", authenticate, updateResep);
router.delete("/:id", authenticate, deleteResep);

module.exports = router;
