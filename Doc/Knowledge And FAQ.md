# KNOWLEDGE BASE & FAQ: PROYEK YUMNA
**PT Digi Antara Masa**
**Dokumen Referensi:** FBL Versi 1.0
**Klasifikasi:** Internal / RAG Data Source

---

## 1. INFORMASI UMUM PROYEK

**Apa itu Yumna?**
Yumna adalah aplikasi web pengatur keuangan keluarga berbasis nilai-nilai Islami yang dirancang untuk membantu pengelolaan arus kas, perencanaan ibadah (Zakat, Umroh, Qurban), serta koordinasi tugas antar anggota keluarga dalam satu platform terintegrasi.

**Siapa target pengguna Yumna?**
Target pengguna utama adalah keluarga Muslim yang terdiri dari Kepala Keluarga (Admin), Istri (Manager), dan Anak (User Terbatas).

**Siapa pengembang aplikasi Yumna?**
Aplikasi ini dikembangkan oleh PT Digi Antara Masa dengan standar keamanan tinggi dan integrasi teknologi AI terkini.

---

## 2. MANAJEMEN AKUN DAN AKSES (USER & ACCESS)

**Metode pendaftaran apa yang tersedia?**
Pengguna dapat mendaftar melalui email atau menggunakan Single Sign-On (SSO) seperti Google ID dan Apple ID.

**Bagaimana cara menggabungkan anggota keluarga dalam satu akun?**
Melalui fitur *Family Grouping*, Kepala Keluarga dapat mengirimkan undangan berupa tautan (link) unik atau email kepada anggota keluarga lain untuk bergabung ke dalam satu *FamilyID*.

**Apa saja pembagian peran (Role) di dalam aplikasi?**
1. **Kepala Keluarga:** Memiliki akses penuh (CRUD) terhadap semua data keuangan, pengaturan grup, dan fitur premium.
2. **Istri:** Dapat mengelola transaksi (pemasukan/pengeluaran) dan mengatur agenda keluarga.
3. **Anak:** Memiliki akses terbatas untuk melihat agenda keluarga dan mencatat pengeluaran pribadi (seperti uang saku).

---

## 3. FITUR KEUANGAN (CORE FINANCE)

**Apa yang dimaksud dengan Multi-Wallet?**
Fitur yang memungkinkan pengguna membagi saldo ke dalam beberapa kategori dompet virtual seperti Dompet Utama, Tabungan, Dana Darurat, atau kategori kustom lainnya.

**Bagaimana cara mencatat transaksi di Yumna?**
Transaksi dapat dicatat melalui modul *Transaction Engine* (manual) atau melalui *AI Chat* menggunakan bahasa sehari-hari.

**Apakah tersedia laporan visual untuk arus kas?**
Ya, terdapat modul *Cash Flow Report* yang menyajikan visualisasi grafik batang, garis, atau donat untuk memantau pengeluaran mingguan dan bulanan.

---

## 4. FITUR ISLAMI (ISLAMIC TOOLS)

**Jenis Zakat apa saja yang dapat dihitung?**
Kalkulator Zakat di Yumna mendukung perhitungan otomatis untuk Zakat Maal, Zakat Profesi, dan Zakat Fitrah.

**Apa itu Nisab Tracker?**
Fitur yang memantau ambang batas (nisab) wajib zakat secara otomatis berdasarkan pembaruan harga emas terkini secara real-time.

**Apakah ada fitur untuk merencanakan ibadah tertentu?**
Ya, terdapat fitur *Savings Goals* yang berfungsi sebagai tracker progres menabung khusus untuk tujuan ibadah seperti Umroh, Haji, atau Qurban.

---

## 5. INTEGRASI KECERDASAN BUATAN (AI ASSISTANT)

**Apa fungsi NLP Transaction pada Yumna AI?**
Fitur ini mengubah pesan teks natural (contoh: "Beli bakso 20rb") secara otomatis menjadi data transaksi terstruktur (jumlah: 20.000, kategori: pangan, deskripsi: bakso). Sistem akan meminta konfirmasi sebelum data disimpan ke database.

**Apa itu AI Advisor?**
Fitur premium yang memberikan rekomendasi alokasi keuangan dan saran penghematan berdasarkan pola pengeluaran (*spending pattern*) keluarga tersebut.

**Dapatkah AI membantu dalam manajemen tugas?**
Ya, fitur *NLP Tasking* memungkinkan pengguna membuat agenda atau pengingat hanya melalui perintah chat, seperti "Ingatkan bayar listrik besok jam 8 pagi".

---

## 6. MANAJEMEN TUGAS DAN AGENDA

**Bagaimana keluarga berkoordinasi mengenai jadwal?**
Tersedia fitur *Shared Calendar* yang tersinkronisasi antar seluruh anggota keluarga dan fitur *Task Assignment* untuk memberikan tugas spesifik (checklist) kepada anggota keluarga tertentu.

**Sistem notifikasi apa yang digunakan?**
Aplikasi menggunakan *Smart Reminder* berupa notifikasi push dan email untuk tagihan rutin, jadwal penting, atau batas jatuh tempo zakat.

---

## 7. SPESIFIKASI TEKNIS DAN KEAMANAN

**Teknologi apa yang digunakan untuk membangun Yumna?**
*   **Platform:** Web Responsive dengan dukungan PWA (Progressive Web App).
*   **Database:** PostgreSQL untuk data transaksional dan Redis untuk caching.
*   **AI Model:** OpenAI GPT-4o atau model BERT kustom untuk Bahasa Indonesia.
*   **Real-time:** WebSockets (Socket.io).

**Bagaimana keamanan data pengguna dijamin?**
Data saldo dan informasi sensitif dienkripsi menggunakan standar AES-256, sementara transmisi data dilindungi dengan protokol TLS 1.3.

---

## 8. FITUR PREMIUM DAN SUBSCRIPTION

**Apa saja fitur yang termasuk dalam kategori Premium?**
1. **AI Advisor:** Rekomendasi keuangan berbasis AI.
2. **Data Export:** Ekspor laporan keuangan ke format PDF dan Excel.
3. **Advanced Analytics:** Grafik perbandingan pengeluaran antar bulan yang mendalam.

**Bagaimana cara mengekspor laporan keuangan?**
Pengguna premium dapat mengakses menu *Report Generator* untuk mengunduh laporan bulanan komprehensif dalam format PDF atau Excel.

---

## 9. ROADMAP IMPLEMENTASI

| Fase | Fokus Utama |
| :--- | :--- |
| **Sprint 1-2** | Setup infrastruktur, Manajemen Akun, dan CRUD Keuangan Dasar. |
| **Sprint 3-4** | Integrasi AI Chat (NLP Logging) dan Dashboard Dashboard. |
| **Sprint 5-6** | Modul Zakat, Agenda Keluarga, dan Notifikasi. |
| **Sprint 7-8** | Fitur Premium (AI Advisor & Export) dan UI Polishing. |
| **Sprint 9** | UAT (User Acceptance Test), Perbaikan Bug, dan Deployment. |