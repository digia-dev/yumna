# Business Requirement Document (BRD)
## Proyek: Pengembangan Aplikasi Web Pengatur Keuangan Keluarga Islami "Yumna"

**Versi:** 1.0  
**Status:** Draft  
**Pemilik Proyek:** PT Digi Antara Masa  
**Disusun Oleh:** Senior System Analyst & Product Manager

---

### 1. Pendahuluan
#### 1.1 Latar Belakang
Pengelolaan keuangan keluarga merupakan aspek krusial dalam membangun rumah tangga yang stabil. Namun, banyak keluarga menghadapi kesulitan dalam mencatat transaksi secara disiplin dan merencanakan keuangan sesuai prinsip syariah. "Yumna" hadir sebagai solusi aplikasi web berbasis kecerdasan buatan (AI) untuk membantu keluarga Muslim mengelola pemasukan, pengeluaran, serta agenda keluarga dalam satu platform terintegrasi.

#### 1.2 Tujuan Proyek
*   Menyediakan platform kolaboratif untuk transparansi keuangan keluarga.
*   Mempermudah pencatatan data keuangan dan agenda melalui teknologi AI.
*   Membantu pengguna memenuhi kewajiban agama melalui fitur kalkulator zakat.
*   Memberikan visualisasi kondisi keuangan yang akurat untuk pengambilan keputusan.

---

### 2. Stakeholder & Peran Pengguna
| Peran | Deskripsi | Wewenang |
| :--- | :--- | :--- |
| **Kepala Keluarga** | Administrator Utama | Akses penuh seluruh fitur, manajemen akun anggota, persetujuan pengeluaran besar, pengaturan budget. |
| **Istri** | Manager Keuangan | Mencatat transaksi, mengatur dompet harian, mengelola agenda tugas, melihat laporan. |
| **Anak** | Pengguna Terbatas | Mencatat uang saku/pengeluaran pribadi, melihat tugas/agenda yang diberikan, akses edukasi keuangan. |

---

### 3. Ruang Lingkup Fungsional (Functional Requirements)

#### 3.1 Manajemen Akun & Autentikasi
*   **Registration & Login:** Pendaftaran akun keluarga melalui email atau SSO.
*   **Role-Based Access Control (RBAC):** Sistem pemisahan hak akses antara Kepala Keluarga, Istri, dan Anak.
*   **Family Grouping:** Fitur mengundang anggota keluarga ke dalam satu ekosistem data yang sama.

#### 3.2 Manajemen Keuangan (Core Finance)
*   **Fitur Dompet (Wallet):** Pemisahan saldo berdasarkan kategori (misal: Dompet Utama, Tabungan, Dana Darurat, Pendidikan).
*   **Manajemen Transaksi (CRUD):** Pencatatan manual untuk pemasukan dan pengeluaran.
*   **Laporan Rentang Tanggal:** Visualisasi arus kas (cash flow) dalam bentuk grafik atau tabel berdasarkan periode yang ditentukan.
*   **Kalkulator Zakat:** Penghitungan otomatis Zakat Maal, Zakat Profesi, dan Zakat Fitrah sesuai nisab terkini.

#### 3.3 Fitur AI Terintegrasi (Yumna AI Assistant)
*   **Group AI Chat:** Ruang obrolan keluarga di mana AI bertindak sebagai asisten aktif.
*   **Natural Language Processing (NLP) Logging:** AI secara otomatis mencatat data dari pesan teks. 
    *   *Contoh:* "Tadi beli beras 50rb" -> AI otomatis memasukkan pengeluaran kategori Pangan.
*   **Automated Task Creation:** AI mampu membuat agenda atau tugas dari percakapan.
    *   *Contoh:* "Ingatkan bayar SPP tanggal 10" -> AI membuat pengingat dan agenda.

#### 3.4 Agenda & Manajemen Tugas
*   **Monitoring Agenda:** Kalender bersama untuk memantau kegiatan keluarga.
*   **Task Management:** Penugasan kepada anggota keluarga tertentu dengan status penyelesaian (Done/Undone).
*   **Reminder:** Notifikasi otomatis untuk tagihan rutin (listrik, internet, sekolah) dan agenda penting.

#### 3.5 Dashboard & Notifikasi
*   **Dashboard Utama:** Ringkasan saldo total, pengeluaran bulan ini, dan tugas mendesak.
*   **Sistem Notifikasi:** Pemberitahuan melalui web push atau email terkait transaksi baru, batas budget, dan pengingat jadwal.

#### 3.6 Fitur Premium (Subscription-Based)
*   **AI Financial Advisor:** Analisis mendalam pola pengeluaran dan rekomendasi alokasi dana berbasis AI.
*   **Unlimited AI Chat History:** Akses riwayat percakapan tanpa batas (Gratis: 30 hari).
*   **Advanced Reporting:** Laporan bulanan otomatis dalam format PDF/Excel dengan visualisasi grafik.
*   **Export Data:** Fitur unduh data transaksi dan laporan keuangan.
*   **Priority Support:** Layanan dukungan pelanggan prioritas.

#### 3.7 Fitur Tambahan (Future Enhancements)
*   **Halal Merchant Finder:** Integrasi API untuk merekomendasikan tempat belanja atau produk halal di sekitar pengguna.
*   **Debt & Receivable Tracker:** Pencatatan hutang piutang dengan pengingat otomatis.
*   **Shared Savings Goals:** Fitur menabung bersama untuk tujuan tertentu (misal: Qurban, Umroh).
*   **Financial Health Check:** Audit otomatis bulanan mengenai kondisi keuangan keluarga.

---

### 4. Persyaratan Non-Fungsional (Non-Functional Requirements)

| Kategori | Deskripsi Persyaratan |
| :--- | :--- |
| **Keamanan** | Enkripsi data sensitif (SSL/TLS), hashing password, dan audit log untuk setiap transaksi besar. |
| **Ketersediaan** | Sistem harus memiliki uptime minimal 99.8%. |
| **Skalabilitas** | Mampu menangani pertumbuhan pengguna dan volume data transaksi yang besar. |
| **User Experience** | Antarmuka yang bersih, responsif (mobile-friendly), dan bernuansa Islami yang menenangkan. |
| **Integritas Data** | Sinkronisasi data real-time antar perangkat anggota keluarga. |

---

### 5. Alur Kerja Sistem (User Flow)
1.  **Onboarding:** Kepala keluarga mendaftar -> Membuat profil keluarga -> Mengundang Istri/Anak.
2.  **Operasional:** 
    *   Anggota keluarga melakukan chat dengan AI "Yumna" untuk input data.
    *   AI mengonfirmasi data: "Data pengeluaran Rp50.000 untuk 'Bensin' telah dicatat ke Dompet Utama. Benar?".
    *   Data masuk ke database dan memperbarui Dashboard secara real-time.
3.  **Reporting:** Di akhir bulan, Kepala Keluarga mengunduh laporan PDF/Excel untuk evaluasi keuangan.

---

### 6. Rencana Implementasi & Milestone
1.  **Fase 1:** Analisis sistem & Perancangan Database (Minggu 1-2).
2.  **Fase 2:** Pengembangan Modul Autentikasi & Core Finance (Minggu 3-6).
3.  **Fase 3:** Integrasi AI Chatbot (NLP Engine) & Task Management (Minggu 7-10).
4.  **Fase 4:** Pengembangan Fitur Zakat & Reporting (Minggu 11-12).
5.  **Fase 5:** UAT (User Acceptance Testing) & Deployment (Minggu 13-14).

---

### 7. Penutup
Dokumen BRD ini berfungsi sebagai acuan utama bagi tim pengembang, desainer UI/UX, dan QA di PT Digi Antara Masa untuk memastikan bahwa aplikasi "Yumna" dibangun sesuai dengan visi bisnis dan kebutuhan pengguna target.