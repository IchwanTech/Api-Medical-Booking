const { check, validationResult } = require("express-validator");

const validateRegister = [
  check("nama").notEmpty().withMessage("Nama wajib diisi"),
  check("email").isEmail().withMessage("Email tidak valid"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .withMessage(
      "Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus"
    ),
  check("role")
    .isIn(["pasien", "admin", "dokter", "perawat"])
    .withMessage("Role tidak valid"),
  check("no_telp")
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Nomor telepon harus 10-15 digit angka"),
  check("no_bpjs")
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{13}$/)
    .withMessage("Nomor BPJS harus 13 digit angka"),
];

const validateLogin = [
  check("email").isEmail().withMessage("Email tidak valid"),
  check("password").notEmpty().withMessage("Password wajib diisi"),
];

const validateDokter = [
  check("nama").notEmpty().withMessage("Nama dokter wajib diisi"),
  check("spesialis").notEmpty().withMessage("Spesialis wajib diisi"),
  check("no_str").notEmpty().withMessage("Nomor STR wajib diisi"),
  check("biaya_konsultasi")
    .customSanitizer((value) => parseFloat(value))
    .isFloat({ min: 0 })
    .withMessage("Biaya konsultasi harus angka positif"),
];

const validateJadwalDokter = [
  check("id_dokter").isInt().withMessage("ID Dokter harus angka"),
  check("hari")
    .isIn(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"])
    .withMessage("Hari tidak valid"),
  check("jam_mulai").isTime().withMessage("Format jam mulai tidak valid"),
  check("jam_selesai").isTime().withMessage("Format jam selesai tidak valid"),
  check("kuota").isInt({ min: 1 }).withMessage("Kuota harus angka positif"),
  check("durasi_per_pasien")
    .isInt({ min: 5 })
    .withMessage("Durasi minimal 5 menit"),
];

const validateJanjiTemu = [
  check("id_dokter").isInt().withMessage("ID Dokter harus angka"),
  check("id_jadwal").isInt().withMessage("ID Jadwal harus angka"),
  check("tanggal").isDate().withMessage("Format tanggal tidak valid"),
  check("keluhan").optional().isString(),
  check("is_bpjs").optional().isBoolean(),
  check("rujukan_bpjs")
    .optional()
    .isString()
    .withMessage("Rujukan BPJS harus string"),
];

const validatePemesananKamar = [
  check("id_kamar").isInt().withMessage("ID Kamar harus angka"),
  check("tanggal_masuk")
    .isDate()
    .withMessage("Format tanggal masuk tidak valid"),
  check("tanggal_keluar")
    .isDate()
    .withMessage("Format tanggal keluar tidak valid"),
  check("is_bpjs").optional().isBoolean(),
  check("rujukan_bpjs")
    .optional()
    .isString()
    .withMessage("Rujukan BPJS harus string"),
];

const validatePembayaran = [
  check("id_janji").optional().isInt().withMessage("ID Janji harus angka"),
  check("id_pemesanan")
    .optional()
    .isInt()
    .withMessage("ID Pemesanan harus angka"),
  check("id_layanan").optional().isInt().withMessage("ID Layanan harus angka"),
  check("metode")
    .isIn([
      "tunai",
      "kartu_kredit",
      "kartu_debit",
      "e-wallet",
      "transfer_bank",
      "bpjs",
    ])
    .withMessage("Metode pembayaran tidak valid"),
];

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateDokter,
  validateJadwalDokter,
  validateJanjiTemu,
  validatePemesananKamar,
  validatePembayaran,
  validateResult,
};
