const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Jenis file tidak didukung. Hanya JPEG, PNG, JPG, dan PDF yang diizinkan"
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadFotoDokter = upload.single("foto");

const uploadFotoKamar = upload.single("url_foto");

const uploadBuktiPembayaran = upload.single("bukti_pembayaran");

const uploadLampiranRekamMedis = upload.single("url_file");

// Fungsi untuk menghapus file
const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, "../public", filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`File berhasil dihapus: ${fullPath}`);
      return true;
    }
    console.log(`File tidak ditemukan: ${fullPath}`);
    return false;
  } catch (error) {
    console.error(`Error saat menghapus file: ${error.message}`);
    return false;
  }
};

module.exports = {
  upload,
  uploadFotoDokter,
  uploadFotoKamar,
  uploadBuktiPembayaran,
  uploadLampiranRekamMedis,
  deleteFile,
};
