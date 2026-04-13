# DOKUMEN DEPLOYMENT GUIDE / RUNBOOK
## Proyek: Aplikasi Web Pengatur Keuangan Keluarga Islami "Yumna"

**Versi Dokumen:** 1.0   
**Penyusun:** Senior System Analyst & Product Manager  
**Instansi:** PT Digi Antara Masa  
**Klasifikasi:** Internal Confidental

---

### 1. Pendahuluan
Dokumen ini berfungsi sebagai panduan teknis operasional untuk melakukan deployment aplikasi "Yumna" ke lingkungan produksi. Panduan ini mencakup langkah-langkah instalasi, konfigurasi infrastruktur, migrasi basis data, hingga integrasi layanan kecerdasan buatan (AI).

### 2. Arsitektur Sistem & Prasyarat
#### 2.1 Stack Teknologi
*   **Frontend:** React.js / Next.js (PWA Support).
*   **Backend:** Node.js (Express atau NestJS).
*   **Database Utama:** PostgreSQL 15+.
*   **Cache & Real-time:** Redis & Socket.io.
*   **AI Engine:** OpenAI API (GPT-4o) & BERT Model.
*   **Authentication:** Firebase Auth / OAuth2.

#### 2.2 Kebutuhan Server (Minimum)
| Komponen | Spesifikasi Minimum |
| :--- | :--- |
| **Sistem Operasi** | Ubuntu 22.04 LTS atau Linux berbasis Debian lainnya. |
| **Processor** | 2 vCPU atau lebih. |
| **RAM** | 4 GB (Disarankan 8 GB untuk optimasi AI processing). |
| **Penyimpanan** | 40 GB SSD. |
| **Runtime** | Node.js v18.x LTS, PM2 (Process Manager). |

---

### 3. Konfigurasi Lingkungan (Environment Variables)
Buat file `.env` pada direktori root server dengan parameter berikut:

```env
# Server Configuration
PORT=3000
NODE_ENV=production
APP_URL=https://yumna.digiantara.com

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=yumna_admin
DB_PASS=secure_password
DB_NAME=yumna_db

# Security & Encryption
JWT_SECRET=your_jwt_secret_key
AES_KEY=your_aes_256_encryption_key

# AI & Third Party
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
FIREBASE_CONFIG_JSON={...}
GOLD_PRICE_API_KEY=your_api_key_for_nisab

# Redis (Caching & Socket)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

---

### 4. Langkah-Langkah Deployment

#### 4.1 Persiapan Repositori
1. Clone repositori dari GitLab/GitHub perusahaan:
   ```bash
   git clone https://github.com/digiantaramasa/yumna-app.git
   cd yumna-app
   ```
2. Instalasi dependensi:
   ```bash
   npm install --production
   ```

#### 4.2 Konfigurasi Basis Data
1. Pastikan PostgreSQL berjalan dan database `yumna_db` telah dibuat.
2. Jalankan migrasi skema (Prisma/Sequelize/TypeORM):
   ```bash
   npm run db:migrate
   ```
3. Jalankan *seeding* untuk data awal (seperti kategori transaksi default dan nisab awal):
   ```bash
   npm run db:seed
   ```

#### 4.3 Build & Optimization
1. Lakukan kompilasi file frontend dan backend:
   ```bash
   npm run build
   ```

#### 4.4 Menjalankan Aplikasi (PM2)
Gunakan PM2 untuk menjaga aplikasi tetap berjalan di latar belakang:
```bash
pm2 start dist/main.js --name "yumna-backend"
pm2 start npm --name "yumna-frontend" -- start
pm2 save
```

---

### 5. Konfigurasi Khusus Modul

#### 5.1 Modul AI (NLP & Chat)
*   Pastikan koneksi ke OpenAI API aktif.
*   Uji endpoint `/api/v1/ai/extract` untuk memastikan teks natural seperti "Beli beras 50rb" dapat dikonversi menjadi objek JSON transaksi secara tepat.

#### 5.2 Modul Zakat & Nisab Tracker
*   Setup **Cron Job** untuk memperbarui harga emas harian guna perhitungan Nisab Zakat (F.3.2.1):
    ```bash
    0 1 * * * /usr/bin/node /path/to/app/scripts/update-nisab.js
    ```

#### 5.3 Modul Family Grouping & Real-time
*   Pastikan port WebSockets (default: 3001 atau terintegrasi port utama) terbuka di firewall server untuk fitur *Family Chat* dan *Shared Calendar*.

---

### 6. Verifikasi Pasca-Deployment (Smoke Test)
Setelah deployment selesai, tim QA/DevOps wajib melakukan verifikasi berikut:
1. **Auth Check:** Melakukan registrasi akun baru dan login via Google SSO.
2. **Transaction Check:** Mencoba input pengeluaran melalui AI Chat (NLP Transaction).
3. **Zakat Calc:** Memasukkan nominal harta untuk memvalidasi output kalkulator zakat.
4. **Export Check:** Menjalankan fungsi ekspor PDF laporan keuangan (khusus akun berlabel Premium).

---

### 7. Prosedur Rollback
Jika terjadi kegagalan sistem kritis saat deployment:
1. Hentikan proses PM2: `pm2 stop all`.
2. Kembali ke tag versi stabil sebelumnya: `git checkout v1.0.x-stable`.
3. Re-install dependensi dan re-build aplikasi.
4. Jika terdapat perubahan skema DB yang tidak kompatibel, lakukan *restore* backup database harian.
5. Jalankan kembali aplikasi.

---

### 8. Pemantauan & Log
*   **Application Log:** `pm2 logs yumna-backend`
*   **Error Tracking:** Sentry (jika dikonfigurasi).
*   **Database Log:** `/var/log/postgresql/postgresql-15-main.log`

---
**Catatan:** Segala kendala teknis di luar dokumen ini harus segera dilaporkan kepada *Lead Infrastructure* PT Digi Antara Masa.