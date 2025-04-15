const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, authorize(["admin"]), getAllUsers);
router.get("/:id", authenticate, getUserById);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, authorize(["admin"]), deleteUser);

module.exports = router;
