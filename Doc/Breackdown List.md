# FITUR BREAKDOWN LIST (FBL)
## Proyek: Aplikasi Web Pengatur Keuangan Keluarga Islami "Yumna"

**Dokumen Referensi:** BRD Versi 1.0  
**Disusun Oleh:** Senior System Analyst & Product Manager  
**Instansi:** PT Digi Antara Masa  
**Klasifikasi:** Internal

---

### 1. Ringkasan Modul
Dokumen ini merinci seluruh fitur yang akan diimplementasikan pada aplikasi Yumna, dibagi berdasarkan modul fungsional untuk memudahkan tim pengembang dan QA.

---

### 2. Daftar Breakdown Fitur (Feature Breakdown List)

| ID | Modul | Fitur Utama | Deskripsi Detail | Prioritas |
| :--- | :--- | :--- | :--- | :--- |
| **1.0** | **User & Access** | **1.1 Registration & SSO** | Pendaftaran akun via email atau Google/Apple ID. | P1 |
| | | **1.2 Family Grouping** | Sistem undangan anggota keluarga melalui link/email unik. | P1 |
| | | **1.3 Role Management** | Pengaturan hak akses (Admin, Manager, User Terbatas). | P1 |
| **2.0** | **Core Finance** | **2.1 Multi-Wallet** | Pembuatan kategori dompet (Utama, Tabungan, Darurat, dll). | P1 |
| | | **2.2 Transaction Engine** | CRUD (Create, Read, Update, Delete) pemasukan & pengeluaran. | P1 |
| | | **2.3 Cash Flow Report** | Visualisasi arus kas per periode (mingguan/bulanan). | P1 |
| **3.0** | **Islamic Tools** | **3.1 Zakat Calculator** | Kalkulator otomatis untuk Zakat Maal, Profesi, dan Fitrah. | P1 |
| | | **3.2 Nisab Tracker** | Update otomatis ambang batas (nisab) zakat sesuai harga emas. | P2 |
| **4.0** | **AI Assistant** | **4.1 Group AI Chat** | Interface chatting keluarga yang terintegrasi dengan AI. | P1 |
| | | **4.2 NLP Transaction** | Konversi teks "Beli bakso 20rb" menjadi data transaksi otomatis. | P1 |
| | | **4.3 NLP Tasking** | Konversi teks "Ingatkan bayar listrik" menjadi agenda. | P2 |
| **5.0** | **Task & Agenda**| **5.1 Shared Calendar** | Kalender kegiatan keluarga yang tersinkronisasi. | P1 |
| | | **5.2 Task Assignment** | Penugasan tugas (checklist) kepada anggota keluarga tertentu. | P2 |
| | | **5.3 Smart Reminder** | Notifikasi push/email untuk tagihan dan jadwal penting. | P1 |
| **6.0** | **Premium Core** | **6.1 AI Advisor** | Rekomendasi alokasi keuangan berdasarkan pola spending. | P2 |
| | | **6.2 Data Export** | Ekspor laporan keuangan ke format PDF dan Excel. | P2 |
| | | **6.3 Advanced Analytics**| Grafik perbandingan pengeluaran antar bulan secara mendalam. | P3 |
| **7.0** | **Future Tech** | **7.1 Halal Finder** | Integrasi API pencarian merchant halal di lokasi terdekat. | P3 |
| | | **7.2 Savings Goals** | Tracker progres menabung untuk Umroh, Qurban, dll. | P2 |

---

### 3. Detail Fungsionalitas Modul

#### 3.1 Modul Manajemen Akun (User & Access)
*   **F.1.1.1 Social Auth:** Integrasi Firebase Auth atau OAuth2 untuk login cepat.
*   **F.1.2.1 Invite System:** Kepala keluarga dapat mengirimkan tautan aktivasi yang secara otomatis menghubungkan anggota ke satu ID Keluarga (FamilyID).
*   **F.1.3.1 RBAC Logic:** 
    *   *Kepala Keluarga:* CRUD semua data, akses setting premium.
    *   *Istri:* CRUD transaksi, kelola agenda.
    *   *Anak:* Hanya melihat agenda dan mencatat pengeluaran pribadi (uang saku).

#### 3.2 Modul Keuangan (Core Finance)
*   **F.2.1.1 Wallet Management:** User dapat menambah/menghapus kategori dompet virtual.
*   **F.2.2.1 Transaction Categorization:** Dropdown kategori pengeluaran (Pangan, Transportasi, Pendidikan, Zakat/Sedekah).
*   **F.2.3.1 Chart Engine:** Menggunakan library chart (seperti Chart.js atau Recharts) untuk menampilkan grafik garis/donat.

#### 3.3 Modul Yumna AI (AI Integration)
*   **F.4.1.1 Chat UI:** Antarmuka seperti aplikasi pesan instan.
*   **F.4.2.1 Extraction Engine:** Menggunakan LLM (Large Language Model) untuk mengekstrak entitas: `amount`, `category`, `description`, dan `date` dari bahasa natural.
*   **F.4.2.2 Confirmation Step:** AI memberikan prompt konfirmasi sebelum data disimpan permanen ke database.

#### 3.4 Modul Laporan & Premium (Subscription)
*   **F.6.1.1 Subscription Check:** Middleware untuk membatasi akses fitur Premium (AI Advisor & Export).
*   **F.6.2.1 Report Generator:** Server-side PDF generation untuk laporan bulanan yang komprehensif.

---

### 4. Matriks Spesifikasi Teknis (Non-Fungsional)

| Kategori | Spesifikasi |
| :--- | :--- |
| **Platform** | Web Responsive (PWA Support). |
| **AI Model** | OpenAI GPT-4o atau model NLP kustom berbasis BERT untuk Bahasa Indonesia. |
| **Keamanan** | AES-256 encryption untuk data saldo dan TLS 1.3 untuk transmisi data. |
| **Database** | PostgreSQL (Relational) untuk transaksi; Redis untuk caching chat. |
| **Sinkronisasi** | Real-time update menggunakan WebSockets (Socket.io). |

---

### 5. Prioritas Implementasi (Roadmap Pengembang)
1.  **Sprint 1-2:** Setup Database, Manajemen Akun, Family Grouping, dan Basic CRUD Keuangan.
2.  **Sprint 3-4:** Integrasi Dasar AI Chat (NLP Logging) dan Dashboard Ringkasan.
3.  **Sprint 5-6:** Kalkulator Zakat, Manajemen Agenda/Tugas, dan Sistem Notifikasi.
4.  **Sprint 7-8:** Fitur Premium (AI Advisor, Export Data) dan UI Polishing.
5.  **Sprint 9:** Bug Fixing, UAT, dan Final Deployment.