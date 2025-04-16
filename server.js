require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sequelize = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dokterRoutes = require("./routes/dokterRoutes");
const jadwalRoutes = require("./routes/jadwalRoutes");
const kamarRoutes = require("./routes/kamarRoutes");
const pemesananRoutes = require("./routes/pemesananRoutes");
const antrianRoutes = require("./routes/antrianRoutes");
const janjiTemuRoutes = require("./routes/janjiTemuRoutes");
const obatRoutes = require("./routes/obatRoutes");
const rekamMedisRoutes = require("./routes/rekamMedisRoutes");
const resepRoutes = require("./routes/resepRoutes");
const layananRoutes = require("./routes/layananRoutes");
const pembayaranRoutes = require("./routes/pembayaranRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notifikasiRoutes = require("./routes/notifikasiRoutes");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit",
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(express.static("public"));
sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.error("Database connection error:", err));

if (process.env.NODE_ENV) {
  sequelize
    .sync({ alter: true })
    .then(() => console.log("Database synced"))
    .catch((err) => console.error("Database sync error:", err));
}

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dokter", dokterRoutes);
app.use("/api/jadwal", jadwalRoutes);
app.use("/api/kamar", kamarRoutes);
app.use("/api/pemesanan", pemesananRoutes);
app.use("/api/antrian", antrianRoutes);
app.use("/api/janji-temu", janjiTemuRoutes);
app.use("/api/obat", obatRoutes);
app.use("/api/rekam-medis", rekamMedisRoutes);
app.use("/api/resep", resepRoutes);
app.use("/api/layanan", layananRoutes);
app.use("/api/pembayaran", pembayaranRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/notifikasi", notifikasiRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Healthcare Booking API is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
