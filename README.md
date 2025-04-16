# Medical Booking - API Documentation

## Overview

Dokumentasi ini berisi penjelasan tentang endpoint API yang tersedia pada Sistem Manajemen Rumah Sakit. API ini menggunakan JWT untuk autentikasi. Semua request yang memerlukan autentikasi harus menyertakan token JWT di header Authorization.

## Base URL

```
https://probtr.rikpetik.site/api/
```

## Autentikasi

### Register

Mendaftarkan pengguna baru.

- **URL**: `/register`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: No

**Request Body**:

```json
{
  "nama": "Nama Pengguna",
  "email": "user@example.com",
  "password": "password123",
  "role": "pasien",
  "no_telp": "081234567890",
  "alamat": "Jalan Contoh No. 123",
  "tanggal_lahir": "1990-01-01",
  "no_bpjs": "1234567890",
  "status_bpjs": "aktif"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "created_at": "2025-04-16T02:27:17.290Z",
      "updated_at": "2025-04-16T02:27:17.290Z",
      "id_user": 2,
      "nama": "Muhammad Fatih Azzam",
      "email": "fatihazzam33@gmail.com",
      "password": "$2a$10$8cLqzrJqhn6EojerIZ3cc.VbtYatO09aziECMwok8cO8ELuCL5TLG",
      "role": "admin",
      "no_telp": "0895327619259",
      "alamat": "Jalan Alamanda Molek No. 35, Jakarta",
      "tanggal_lahir": "2006-11-30",
      "no_bpjs": "1234567890987",
      "status_bpjs": "aktif"
    }
  }
}
```

### Login

Login ke sistem dan mendapatkan token JWT.

- **URL**: `/login`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: No

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id_user": 1,
      "nama": "Nama Pengguna",
      "email": "user@example.com",
      "role": "pasien"
    }
  }
}
```

### Logout

Menghapus sesi user yang sedang login.

- **URL**: `/logout`
- **Method**: `POST`
- **Auth required**: Yes

**Response**: `200 OK`

### Me

Mendapatkan informasi pengguna yang sedang login.

- **URL**: `/me`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

## User Management

### Get All Users (Admin Only)

Mendapatkan daftar semua pengguna.

- **URL**: `/users`
- **Method**: `GET`
- **Auth required**: Yes (Admin Only)
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)

**Response**: `200 OK`

### Get User By ID

Mendapatkan detail pengguna berdasarkan ID.

- **URL**: `/users/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Update User

Memperbarui data pengguna.

- **URL**: `/users/:id`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "nama": "Nama Baru",
  "email": "emailbaru@example.com",
  "password": "passwordbaru123",
  "role": "pasien",
  "no_telp": "087654321098",
  "alamat": "Jalan Baru No. 456",
  "tanggal_lahir": "1992-02-02",
  "no_bpjs": "0987654321",
  "status_bpjs": "aktif"
}
```

**Response**: `200 OK`

### Delete User (Admin Only)

Menghapus pengguna (soft delete).

- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Auth required**: Yes (Admin Only)

**Response**: `200 OK`

## Dokter

### Get All Dokter

Mendapatkan daftar semua dokter.

- **URL**: `/dokter`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)
  - `spesialis`: Filter berdasarkan spesialisasi

**Response**: `200 OK`

### Get Dokter By ID

Mendapatkan detail dokter berdasarkan ID.

- **URL**: `/dokter/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Create Dokter (Admin Only)

Menambahkan dokter baru.

- **URL**: `/dokter`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Auth required**: Yes (Admin Only)

**Request Body**:

- `nama`: Nama dokter (text)
- `spesialis`: Spesialisasi dokter (text)
- `no_str`: Nomor STR (text)
- `biaya_konsultasi`: Biaya konsultasi (text/number)
- `biaya_bpjs`: Biaya BPJS (text/number, opsional)
- `deskripsi`: Deskripsi dokter (text, opsional)
- `pengalaman`: Pengalaman dalam tahun (text/number, opsional)
- `foto`: Foto dokter (file)

**Response**: `201 Created`

### Update Dokter (Admin Only)

Memperbarui data dokter.

- **URL**: `/dokter/:id`
- **Method**: `PUT`
- **Content-Type**: `multipart/form-data`
- **Auth required**: Yes (Admin Only)

**Request Body**:

- `nama`: Nama dokter (text, opsional)
- `spesialis`: Spesialisasi dokter (text, opsional)
- `no_str`: Nomor STR (text, opsional)
- `biaya_konsultasi`: Biaya konsultasi (text/number, opsional)
- `biaya_bpjs`: Biaya BPJS (text/number, opsional)
- `deskripsi`: Deskripsi dokter (text, opsional)
- `pengalaman`: Pengalaman dalam tahun (text/number, opsional)
- `foto`: Foto dokter baru (file, opsional)

**Response**: `200 OK`

### Delete Dokter (Admin Only)

Menghapus dokter (soft delete).

- **URL**: `/dokter/:id`
- **Method**: `DELETE`
- **Auth required**: Yes (Admin Only)

**Response**: `200 OK`

### Search Dokter By Specialization

Mencari dokter berdasarkan spesialisasi.

- **URL**: `/dokter/spesialisasi/cari`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `spesialis`: Spesialisasi yang dicari

**Response**: `200 OK`

## Kamar

### Tipe Kamar

#### Get All Tipe Kamar

Mendapatkan daftar semua tipe kamar.

- **URL**: `/kamar/tipe`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)

**Response**: `200 OK`

#### Get Tipe Kamar By ID

Mendapatkan detail tipe kamar berdasarkan ID.

- **URL**: `/kamar/tipe/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

#### Create Tipe Kamar

Menambahkan tipe kamar baru.

- **URL**: `/kamar/tipe`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "nama_tipe": "Standard Room",
  "deskripsi": "Kamar standar dengan fasilitas lengkap",
  "harga_per_malam": 500000,
  "harga_bpjs": 150000,
  "fasilitas": "AC, TV, Kamar mandi dalam",
  "kapasitas": 2,
  "kelas_bpjs": "Kelas 2"
}
```

**Response**: `201 Created`

#### Update Tipe Kamar

Memperbarui data tipe kamar.

- **URL**: `/kamar/tipe/:id`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "nama_tipe": "Deluxe Room",
  "deskripsi": "Kamar mewah dengan pemandangan",
  "harga_per_malam": 750000,
  "fasilitas": "AC, TV, Kamar mandi dalam, Pemandangan kota"
}
```

**Response**: `200 OK`

#### Delete Tipe Kamar

Menghapus tipe kamar (soft delete).

- **URL**: `/kamar/tipe/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

### Kamar

#### Get All Kamar

Mendapatkan daftar semua kamar.

- **URL**: `/kamar`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)
  - `id_tipe`: Filter berdasarkan tipe kamar
  - `status`: Filter berdasarkan status (tersedia, terisi)
  - `lantai`: Filter berdasarkan lantai

**Response**: `200 OK`

#### Get Kamar Tersedia

Mendapatkan daftar kamar yang tersedia pada rentang tanggal tertentu.

- **URL**: `/kamar/tersedia`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `tanggal_masuk`: Tanggal check-in (YYYY-MM-DD)
  - `tanggal_keluar`: Tanggal check-out (YYYY-MM-DD)
  - `id_tipe`: Filter berdasarkan tipe kamar (opsional)

**Response**: `200 OK`

#### Get Kamar By ID

Mendapatkan detail kamar berdasarkan ID.

- **URL**: `/kamar/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

#### Create Kamar

Menambahkan kamar baru.

- **URL**: `/kamar`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "id_tipe": 1,
  "nomor_kamar": "201",
  "lantai": 2
}
```

**Response**: `201 Created`

#### Update Kamar

Memperbarui data kamar.

- **URL**: `/kamar/:id`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "id_tipe": 2,
  "status": "tersedia",
  "lantai": 3
}
```

**Response**: `200 OK`

#### Delete Kamar

Menghapus kamar (soft delete).

- **URL**: `/kamar/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

### Foto Kamar

#### Add Foto Kamar

Menambahkan foto untuk kamar.

- **URL**: `/kamar/:id_kamar/foto`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Auth required**: Yes

**Request Body**:

- `foto`: File foto (file)
- `deskripsi`: Deskripsi foto (text, opsional)
- `is_primary`: Apakah foto utama (text, "true" atau "false")

**Response**: `201 Created`

#### Update Foto Kamar

Memperbarui data foto kamar.

- **URL**: `/kamar/:id_kamar/foto/:id_foto`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "deskripsi": "Foto kamar dari sudut lain",
  "is_primary": true
}
```

**Response**: `200 OK`

#### Delete Foto Kamar

Menghapus foto kamar.

- **URL**: `/kamar/:id_kamar/foto/:id_foto`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

## Jadwal Dokter

### Get All Jadwal

Mendapatkan daftar semua jadwal dokter.

- **URL**: `/jadwal`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `id_dokter`: Filter berdasarkan dokter (opsional)
  - `hari`: Filter berdasarkan hari (opsional)

**Response**: `200 OK`

### Get Jadwal Hari Ini

Mendapatkan jadwal dokter untuk hari ini.

- **URL**: `/jadwal/hari-ini`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Get Jadwal By ID

Mendapatkan detail jadwal berdasarkan ID.

- **URL**: `/jadwal/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Create Jadwal

Menambahkan jadwal dokter baru.

- **URL**: `/jadwal`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "id_dokter": 1,
  "hari": "Senin",
  "jam_mulai": "08:00",
  "jam_selesai": "12:00",
  "kuota": 20,
  "durasi_per_pasien": 15
}
```

**Response**: `201 Created`

### Update Jadwal

Memperbarui jadwal dokter.

- **URL**: `/jadwal/:id`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "id_dokter": 1,
  "hari": "Selasa",
  "jam_mulai": "13:00",
  "jam_selesai": "17:00",
  "kuota": 15,
  "durasi_per_pasien": 20
}
```

**Response**: `200 OK`

### Delete Jadwal

Menghapus jadwal dokter (soft delete).

- **URL**: `/jadwal/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

## Antrian

### Get Antrian By Jadwal

Mendapatkan daftar antrian berdasarkan jadwal dan tanggal.

- **URL**: `/antrian`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `id_jadwal`: ID jadwal dokter
  - `tanggal`: Tanggal antrian (YYYY-MM-DD)

**Response**: `200 OK`

### Get Antrian Saya

Mendapatkan daftar antrian pengguna yang sedang login.

- **URL**: `/antrian/saya`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Update Status Antrian

Memperbarui status antrian.

- **URL**: `/antrian/:id/status`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "status": "dilayani"
}
```

**Response**: `200 OK`

### Get Antrian Sekarang

Mendapatkan antrian yang sedang dilayani dan antrian selanjutnya.

- **URL**: `/antrian/:id_jadwal/sekarang`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

## Janji Temu

### Get All Janji Temu

Mendapatkan daftar semua janji temu.

- **URL**: `/janji-temu`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)
  - `id_user`: Filter berdasarkan pengguna
  - `id_dokter`: Filter berdasarkan dokter
  - `status`: Filter berdasarkan status
  - `tanggal`: Filter berdasarkan tanggal (YYYY-MM-DD)

**Response**: `200 OK`

### Get Janji Temu By ID

Mendapatkan detail janji temu berdasarkan ID.

- **URL**: `/janji-temu/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Create Janji Temu

Membuat janji temu baru.

- **URL**: `/janji-temu`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "id_dokter": 1,
  "id_jadwal": 1,
  "tanggal": "2025-04-22",
  "keluhan": "Demam tinggi dan sakit kepala",
  "is_bpjs": false,
  "rujukan_bpjs": null
}
```

**Response**: `201 Created`

### Update Status Janji Temu

Memperbarui status janji temu.

- **URL**: `/janji-temu/:id/status`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "status": "confirmed",
  "catatan": "Konfirmasi janji temu"
}
```

**Response**: `200 OK`

### Cancel Janji Temu

Membatalkan janji temu.

- **URL**: `/janji-temu/:id/batal`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "catatan": "Pembatalan oleh pasien"
}
```

**Response**: `200 OK`

### Delete Janji Temu

Menghapus janji temu (soft delete).

- **URL**: `/janji-temu/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

## Pemesanan Kamar

### Get All Pemesanan

Mendapatkan daftar semua pemesanan kamar.

- **URL**: `/pemesanan`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)
  - `id_user`: Filter berdasarkan pengguna
  - `status`: Filter berdasarkan status
  - `tanggal_masuk`: Filter berdasarkan tanggal check-in
  - `tanggal_keluar`: Filter berdasarkan tanggal check-out

**Response**: `200 OK`

### Get Pemesanan By ID

Mendapatkan detail pemesanan berdasarkan ID.

- **URL**: `/pemesanan/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Create Pemesanan

Membuat pemesanan kamar baru.

- **URL**: `/pemesanan`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "id_kamar": 1,
  "tanggal_masuk": "2025-04-20",
  "tanggal_keluar": "2025-04-25",
  "catatan": "Tolong siapkan extra bed",
  "is_bpjs": false,
  "rujukan_bpjs": null
}
```

**Response**: `201 Created`

### Update Status Pemesanan

Memperbarui status pemesanan kamar.

- **URL**: `/pemesanan/:id/status`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "status": "confirmed",
  "catatan": "Pembayaran telah diterima"
}
```

**Response**: `200 OK`

### Cancel Pemesanan

Membatalkan pemesanan kamar.

- **URL**: `/pemesanan/:id/batal`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "catatan": "Pembatalan oleh pengguna"
}
```

**Response**: `200 OK`

### Delete Pemesanan

Menghapus pemesanan kamar (soft delete).

- **URL**: `/pemesanan/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

## Obat

### Get All Obat

Mendapatkan daftar semua obat.

- **URL**: `/obat`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)
  - `search`: Pencarian berdasarkan nama obat
  - `ditanggung_bpjs`: Filter obat yang ditanggung BPJS (true/false)

**Response**: `200 OK`

### Get Obat By ID

Mendapatkan detail obat berdasarkan ID.

- **URL**: `/obat/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Create Obat

Menambahkan obat baru.

- **URL**: `/obat`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "nama_obat": "Paracetamol",
  "deskripsi": "Obat pereda nyeri dan demam",
  "satuan": "Tablet",
  "harga": 5000,
  "harga_bpjs": 2000,
  "stok": 100,
  "ditanggung_bpjs": true
}
```

**Response**: `201 Created`

### Update Obat

Memperbarui data obat.

- **URL**: `/obat/:id`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "nama_obat": "Paracetamol 500mg",
  "deskripsi": "Obat pereda nyeri dan demam dosis 500mg",
  "harga": 6000,
  "harga_bpjs": 2500
}
```

**Response**: `200 OK`

### Update Stok Obat

Memperbarui stok obat (penambahan atau pengurangan).

- **URL**: `/obat/:id/stok`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body (Penambahan)**:

```json
{
  "jumlah": 50,
  "tipe_perubahan": "penambahan",
  "catatan": "Restock obat"
}
```

**Request Body (Pengurangan)**:

```json
{
  "jumlah": 10,
  "tipe_perubahan": "pengurangan",
  "catatan": "Penggunaan untuk pasien"
}
```

**Response**: `200 OK`

### Delete Obat

Menghapus obat (soft delete).

- **URL**: `/obat/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

## Rekam Medis

### Get All Rekam Medis

Mendapatkan daftar semua rekam medis.

- **URL**: `/rekam-medis`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)
  - `id_user`: Filter berdasarkan pasien
  - `id_dokter`: Filter berdasarkan dokter
  - `tanggal`: Filter berdasarkan tanggal (YYYY-MM-DD)

**Response**: `200 OK`

### Get Rekam Medis By ID

Mendapatkan detail rekam medis berdasarkan ID.

- **URL**: `/rekam-medis/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Create Rekam Medis

Membuat rekam medis baru.

- **URL**: `/rekam-medis`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "id_user": 1,
  "id_dokter": 1,
  "id_janji": 1,
  "diagnosa": "Demam Tinggi",
  "anamnesis": "Pasien mengeluhkan demam tinggi selama 3 hari",
  "pemeriksaan_fisik": "Suhu tubuh 38.5°C, tekanan darah 120/80",
  "tindakan": "Pemberian obat penurun panas",
  "catatan": "Pasien disarankan banyak minum air putih",
  "is_bpjs": true
}
```

**Response**: `201 Created`

### Update Rekam Medis

Memperbarui data rekam medis.

- **URL**: `/rekam-medis/:id`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "diagnosa": "Demam Berdarah",
  "anamnesis": "Pasien mengeluhkan demam tinggi selama 3 hari disertai penurunan trombosit",
  "pemeriksaan_fisik": "Suhu tubuh 38.5°C, tekanan darah 120/80, trombosit 100.000",
  "tindakan": "Pemberian cairan infus dan obat penurun panas",
  "catatan": "Pasien disarankan rawat inap untuk observasi"
}
```

**Response**: `200 OK`

### Delete Rekam Medis

Menghapus rekam medis (soft delete).

- **URL**: `/rekam-medis/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

### Add Lampiran Rekam Medis

Menambahkan lampiran untuk rekam medis.

- **URL**: `/rekam-medis/:id_rekam/lampiran`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Auth required**: Yes

**Request Body**:

- `file`: File lampiran (file)
- `jenis_lampiran`: Jenis lampiran (text)
- `deskripsi`: Deskripsi lampiran (text, opsional)

**Response**: `201 Created`

### Delete Lampiran Rekam Medis

Menghapus lampiran rekam medis.

- **URL**: `/rekam-medis/:id_rekam/lampiran/:id_lampiran`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

## Resep Obat

### Create Resep

Membuat resep obat baru.

- **URL**: `/resep`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "id_rekam": 1,
  "id_obat": 1,
  "dosis": "3x1 tablet",
  "jumlah": 10,
  "aturan_pakai": "Diminum setelah makan",
  "is_bpjs": true
}
```

**Response**: `201 Created`

### Update Resep

Memperbarui data resep obat.

- **URL**: `/resep/:id`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "dosis": "2x1 tablet",
  "jumlah": 14,
  "aturan_pakai": "Diminum sebelum makan"
}
```

**Response**: `200 OK`

### Delete Resep

Menghapus resep obat.

- **URL**: `/resep/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

## Layanan

### Get All Layanan

Mendapatkan daftar semua layanan.

- **URL**: `/layanan`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)
  - `search`: Pencarian berdasarkan nama layanan
  - `ditanggung_bpjs`: Filter layanan yang ditanggung BPJS (true/false)

**Response**: `200 OK`

### Get Layanan By ID

Mendapatkan detail layanan berdasarkan ID.

- **URL**: `/layanan/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Create Layanan

Menambahkan layanan baru.

- **URL**: `/layanan`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "nama_layanan": "Konsultasi Umum",
  "deskripsi": "Layanan konsultasi dengan dokter umum",
  "harga": 150000,
  "harga_bpjs": 50000,
  "ditanggung_bpjs": true
}
```

**Response**: `201 Created`

### Update Layanan

Memperbarui data layanan.

- **URL**: `/layanan/:id`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "nama_layanan": "Konsultasi Dokter Umum",
  "deskripsi": "Layanan konsultasi kesehatan dengan dokter umum",
  "harga": 175000,
  "harga_bpjs": 60000
}
```

**Response**: `200 OK`

### Delete Layanan

Menghapus layanan (soft delete).

- **URL**: `/layanan/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

## Pembayaran

### Get All Pembayaran

Mendapatkan daftar semua pembayaran.

- **URL**: `/pembayaran`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)
  - `id_user`: Filter berdasarkan pengguna
  - `status`: Filter berdasarkan status (pending, success, failed, refunded)
  - `metode`: Filter berdasarkan metode pembayaran (transfer, bpjs, tunai)
  - `tanggal`: Filter berdasarkan tanggal (YYYY-MM-DD)

**Response**: `200 OK`

### Get Pembayaran By ID

Mendapatkan detail pembayaran berdasarkan ID.

- **URL**: `/pembayaran/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Create Pembayaran

Membuat pembayaran baru.

- **URL**: `/pembayaran`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body (Pembayaran Janji Temu)**:

```json
{
  "id_janji": 1,
  "metode": "transfer",
  "jumlah": 150000
}
```

**Request Body (Pembayaran Pemesanan Kamar)**:

```json
{
  "id_pemesanan": 1,
  "metode": "transfer",
  "jumlah": 750000
}
```

**Request Body (Pembayaran Layanan)**:

```json
{
  "id_layanan": 1,
  "metode": "transfer",
  "jumlah": 200000
}
```

**Request Body (Pembayaran BPJS)**:

```json
{
  "id_janji": 1,
  "metode": "bpjs",
  "no_klaim_bpjs": "123456789"
}
```

**Response**: `201 Created`

### Upload Bukti Pembayaran

Mengunggah bukti pembayaran.

- **URL**: `/pembayaran/:id/bukti`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Auth required**: Yes

**Request Body**:

- `bukti`: File bukti pembayaran (file)

**Response**: `200 OK`

### Update Status Pembayaran

Memperbarui status pembayaran.

- **URL**: `/pembayaran/:id/status`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "status": "success",
  "catatan": "Pembayaran telah diverifikasi"
}
```

**Response**: `200 OK`

### Delete Pembayaran

Menghapus pembayaran (soft delete).

- **URL**: `/pembayaran/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

## Review

### Get All Review

Mendapatkan daftar semua review.

- **URL**: `/review`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)
  - `id_dokter`: Filter review berdasarkan dokter
  - `id_layanan`: Filter review berdasarkan layanan
  - `id_pemesanan`: Filter review berdasarkan pemesanan kamar
  - `rating`: Filter berdasarkan rating (1-5)

**Response**: `200 OK`

### Get Review By ID

Mendapatkan detail review berdasarkan ID.

- **URL**: `/review/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Create Review

Membuat review baru.

- **URL**: `/review`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body (Review Dokter)**:

```json
{
  "id_dokter": 1,
  "rating": 5,
  "komentar": "Dokter sangat ramah dan profesional",
  "is_anonymous": false
}
```

**Request Body (Review Layanan)**:

```json
{
  "id_layanan": 1,
  "rating": 4,
  "komentar": "Layanan cukup baik dan cepat",
  "is_anonymous": true
}
```

**Request Body (Review Pemesanan Kamar)**:

```json
{
  "id_pemesanan": 1,
  "rating": 5,
  "komentar": "Kamar bersih dan nyaman",
  "is_anonymous": false
}
```

**Response**: `201 Created`

### Update Review

Memperbarui data review.

- **URL**: `/review/:id`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Auth required**: Yes

**Request Body**:

```json
{
  "rating": 4,
  "komentar": "Setelah dipertimbangkan kembali, layanan cukup memuaskan",
  "is_anonymous": true
}
```

**Response**: `200 OK`

### Delete Review

Menghapus review (soft delete).

- **URL**: `/review/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

### Get Rating Summary

Mendapatkan ringkasan rating.

- **URL**: `/review/rating/summary`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `id_dokter`: ID dokter (wajib salah satu)
  - `id_layanan`: ID layanan (wajib salah satu)
  - `id_pemesanan`: ID pemesanan (wajib salah satu)

**Response**: `200 OK`

## Notifikasi

### Get All Notifikasi

Mendapatkan daftar semua notifikasi pengguna yang sedang login.

- **URL**: `/notifikasi`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `page`: Nomor halaman (default: 1)
  - `size`: Jumlah item per halaman (default: 10)
  - `dibaca`: Filter berdasarkan status dibaca (true/false)

**Response**: `200 OK`

### Get Notifikasi By ID

Mendapatkan detail notifikasi berdasarkan ID dan menandainya sebagai dibaca.

- **URL**: `/notifikasi/:id`
- **Method**: `GET`
- **Auth required**: Yes

**Response**: `200 OK`

### Mark As Read

Menandai notifikasi sebagai telah dibaca.

- **URL**: `/notifikasi/:id/baca`
- **Method**: `PUT`
- **Auth required**: Yes

**Response**: `200 OK`

### Mark All As Read

Menandai semua notifikasi sebagai telah dibaca.

- **URL**: `/notifikasi/baca-semua`
- **Method**: `PUT`
- **Auth required**: Yes

**Response**: `200 OK`

### Delete Notifikasi

Menghapus notifikasi.

- **URL**: `/notifikasi/:id`
- **Method**: `DELETE`
- **Auth required**: Yes

**Response**: `200 OK`

## Error Response

Format response error:

```json
{
  "success": false,
  "message": "Pesan error",
  "errors": [
    {
      "field": "field_name",
      "message": "Pesan validasi error"
    }
  ]
}
```

## Success Response

Format response sukses:

```json
{
  "success": true,
  "data": {
    // Data yang dikembalikan
  },
  "message": "Pesan sukses"
}
```

## Pagination Response

Format response dengan pagination:

```json
{
  "success": true,
  "data": [
    // Array data yang dikembalikan
  ],
  "pagination": {
    "totalItems": 100,
    "totalPages": 10,
    "currentPage": 1,
    "pageSize": 10
  }
}
```
