const { LogAktivitas, User } = require("../models");

const logger = async (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    try {
      const duration = Date.now() - start;

      // Ambil id_user dari req.user jika tersedia
      const userId = req.user?.id_user;

      // Periksa jika id_user tidak ada atau invalid
      if (!userId) {
        console.error("id_user tidak ditemukan, log tidak dicatat");
        return next(); // Lewati pencatatan log jika id_user tidak valid
      }

      // Periksa apakah id_user valid di tabel users
      const userExists = await User.findByPk(userId);
      if (!userExists) {
        console.error(`User dengan id ${userId} tidak ditemukan`);
        return next(); // Lewati pencatatan log jika user tidak ada di database
      }

      // Jika id_user valid, lanjutkan untuk mencatat aktivitas
      await LogAktivitas.create({
        id_user: userId,
        aktivitas: `${req.method} ${req.path}`,
        tabel_terkait: req.path,
        id_record: req.params.id || null,
        detail: JSON.stringify({
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          body: req.body,
          query: req.query,
          params: req.params,
        }),
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });
    } catch (error) {
      console.error("Gagal mencatat aktivitas:", error);
    }
  });

  next();
};

module.exports = logger;
