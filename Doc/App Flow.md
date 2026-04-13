# DOKUMEN ALUR BISNIS (USER FLOW)
## Proyek: Aplikasi Web Pengatur Keuangan Keluarga Islami "Yumna"

**Dokumen:** YMN-FLOW-V1.0  
**Perusahaan:** PT Digi Antara Masa  
**Peran:** Senior System Analyst & Product Manager  
**Klasifikasi:** Internal / Confidental  

---

### 1. Pendahuluan
Dokumen ini mendefinisikan alur bisnis dan navigasi pengguna dalam aplikasi "Yumna". Tujuan utamanya adalah untuk memastikan integrasi yang mulus antara manajemen keuangan konvensional dengan prinsip syariah serta teknologi AI yang interaktif.

---

### 2. Alur Utama Pengguna (Core User Flow)

#### 2.1 Alur Registrasi dan Pembentukan Keluarga (Onboarding)
Alur ini mengatur bagaimana user pertama kali masuk ke sistem dan menginisiasi ekosistem keluarga digital.

| Langkah | Aksi Pengguna | Respon Sistem |
| :--- | :--- | :--- |
| 1 | Akses Halaman Landing | Menampilkan opsi Login/Register. |
| 2 | Registrasi (Email/SSO) | Validasi data via Firebase Auth/OAuth2. |
| 3 | Cek Status Keluarga | Mengecek apakah user memiliki undangan atau ingin membuat grup baru. |
| 4 | **Skenario A:** Buat Grup | Sistem men-generate `FamilyID` unik dan memberikan hak akses "Kepala Keluarga". |
| 5 | **Skenario B:** Gabung Grup | User memasukkan kode unik/klik link undangan untuk terhubung ke `FamilyID` yang ada. |
| 6 | Pengaturan Profil | Pengisian data awal: Nama, Peran (Istri/Anak), dan Mata Uang default. |

#### 2.2 Alur Pencatatan Transaksi Berbasis AI (NLP Transaction)
Salah satu fitur unggulan yang memudahkan pencatatan melalui bahasa natural di fitur Chat.

| Langkah | Aksi Pengguna | Respon Sistem |
| :--- | :--- | :--- |
| 1 | Masuk ke Modul AI Chat | Menampilkan interface chatting keluarga. |
| 2 | Input Teks (e.g., "Beli bensin 50rb") | LLM Extraction Engine memproses teks secara real-time. |
| 3 | Review Ekstraksi | Sistem menampilkan ringkasan: `Jumlah: 50.000`, `Kategori: Transportasi`. |
| 4 | Konfirmasi | User menekan tombol "Simpan". |
| 5 | Update Database | Saldo `Multi-Wallet` berkurang dan data masuk ke `Cash Flow Report`. |

#### 2.3 Alur Kalkulasi Zakat dan Nisab Tracker
Alur untuk memastikan kewajiban syariah terpenuhi berdasarkan kondisi keuangan terkini.

1.  **Akses Modul:** User memilih menu "Zakat Calculator".
2.  **Sinkronisasi Nisab:** Sistem secara otomatis memanggil API harga emas terbaru untuk menetapkan ambang batas (Nisab).
3.  **Input Harta:** User memasukkan nilai aset (tabungan, perhiasan, piutang lancar) atau memilih data dari `Multi-Wallet`.
4.  **Kalkulasi:** Sistem menghitung 2,5% dari total harta jika sudah mencapai Nisab dan Haul.
5.  **Hasil:** Menampilkan jumlah zakat yang harus dibayar dan opsi penyaluran.

#### 2.4 Alur Penugasan dan Agenda Keluarga (Shared Task)
Mengatur koordinasi antar anggota keluarga dalam urusan domestik dan finansial.

1.  **Input Tugas:** Admin/Manager membuat tugas di "Shared Calendar".
2.  **Assignment:** Menentukan penanggung jawab (Assignee) dari anggota keluarga yang terdaftar.
3.  **Trigger:** Sistem mengirimkan Push Notification/Email melalui `Smart Reminder`.
4.  **Update:** Assignee mencentang checklist setelah tugas selesai; status diperbarui secara real-time untuk seluruh anggota.

---

### 3. Logika Role Management (RBAC)

Sistem akan menerapkan pembatasan akses berdasarkan peran pengguna dalam `FamilyID`:

*   **Kepala Keluarga (Admin):**
    *   Akses penuh ke semua dompet dan laporan.
    *   Manajemen langganan premium.
    *   Menghapus atau menambah anggota.
*   **Istri (Manager):**
    *   Mengelola pengeluaran operasional harian.
    *   Membuat agenda dan tugas keluarga.
    *   Melihat laporan keuangan bersama.
*   **Anak (User Terbatas):**
    *   Hanya melihat agenda yang ditujukan kepadanya.
    *   Hanya mencatat pengeluaran dari dompet "Uang Saku" pribadi.
    *   Tidak dapat melihat total saldo tabungan utama.

---

### 4. Alur Fitur Premium (Data Export & AI Advisor)

1.  **Check Subscription:** Saat user mengakses "Advanced Analytics" atau "Export PDF", sistem menjalankan `Subscription Check`.
2.  **Conditional Logic:**
    *   *Jika Aktif:* Sistem me-render grafik mendalam atau men-generate file PDF/Excel di sisi server.
    *   *Jika Tidak Aktif:* Sistem menampilkan modal "Upgrade ke Premium" dengan daftar benefit.
3.  **AI Advisor:** Mesin AI memindai pola pengeluaran selama 3 bulan terakhir dan memberikan saran alokasi (misal: "Pengeluaran makan Anda naik 20%, disarankan menambah alokasi Sedekah").

---

### 5. Penanganan Error dan Validasi Data

*   **Koneksi Terputus:** Menggunakan mekanisme PWA (Progressive Web App) untuk menyimpan input secara lokal sebelum sinkronisasi ulang via WebSockets saat online.
*   **Gagal Ekstraksi AI:** Jika AI gagal mengenali format teks, sistem akan mengalihkan pengguna ke formulir input manual konvensional.
*   **Keamanan Data:** Setiap request ke database harus divalidasi dengan `FamilyID` dan `JWT Token` untuk mencegah kebocoran data antar keluarga.

---
**Disetujui Oleh:**
*Product Manager PT Digi Antara Masa*