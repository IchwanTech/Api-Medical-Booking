const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  me,
} = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
  validateResult,
} = require("../utils/validators");
const { authenticate } = require("../middleware/auth");

router.post("/register", validateRegister, validateResult, register);
router.post("/login", validateLogin, validateResult, login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

module.exports = router;
