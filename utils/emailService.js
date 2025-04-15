const nodemailer = require("nodemailer");
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === "465",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const info = await transporter.sendMail({
      from: `"Medical Booking" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
};

const sendRegistrationEmail = async (user) => {
  const subject = "Selamat datang di Medical Booking";
  const text = `Halo ${user.nama},\n\nTerima kasih telah mendaftar di Healthcare Booking System. Akun Anda telah berhasil dibuat.\n\nEmail: ${user.email}\n\nSalam,\nTim Medical Booking`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Selamat datang di Healthcare Booking System</h2>
      <p>Halo ${user.nama},</p>
      <p>Terima kasih telah mendaftar di Healthcare Booking System. Akun Anda telah berhasil dibuat.</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p>Salam,<br>Tim Healthcare Booking System</p>
    </div>
  `;

  return sendEmail(user.email, subject, text, html);
};

const sendAppointmentConfirmation = async (user, janjiTemu) => {
  const subject = "Konfirmasi Janji Temu";
  const text = `Halo ${user.nama},\n\nJanji temu Anda telah berhasil dibuat dengan detail sebagai berikut:\n\nDokter: ${janjiTemu.Dokter.nama}\nSpesialis: ${janjiTemu.Dokter.spesialis}\nTanggal: ${janjiTemu.tanggal}\nJam: ${janjiTemu.JadwalDokter.jam_mulai} - ${janjiTemu.JadwalDokter.jam_selesai}\nNomor Antrian: ${janjiTemu.Antrian.nomor_antrian}\n\nSalam,\nTim Medical Booking`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Konfirmasi Janji Temu</h2>
      <p>Halo ${user.nama},</p>
      <p>Janji temu Anda telah berhasil dibuat dengan detail sebagai berikut:</p>
      <p><strong>Dokter:</strong> ${janjiTemu.Dokter.nama}</p>
      <p><strong>Spesialis:</strong> ${janjiTemu.Dokter.spesialis}</p>
      <p><strong>Tanggal:</strong> ${janjiTemu.tanggal}</p>
      <p><strong>Jam:</strong> ${janjiTemu.JadwalDokter.jam_mulai} - ${janjiTemu.JadwalDokter.jam_selesai}</p>
      <p><strong>Nomor Antrian:</strong> ${janjiTemu.Antrian.nomor_antrian}</p>
      <p>Salam,<br>Tim Healthcare Booking System</p>
    </div>
  `;

  return sendEmail(user.email, subject, text, html);
};

module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendAppointmentConfirmation,
};
