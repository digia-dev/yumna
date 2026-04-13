# DOKUMEN TIMELINE & QA PLAN: APLIKASI WEB YUMNA (V1.0)

**Proyek:**"Yumna"  
**Instansi:** PT Digi Antara Masa  
**Peran:** System Analyst & Product Manager Senior  
**Status:** Internal Confidential  

---

## 1. PENDAHULUAN
Dokumen ini disusun untuk memberikan panduan strategis mengenai jadwal pengembangan (Timeline) dan rencana penjaminan kualitas (QA Plan) bagi aplikasi Yumna. Fokus utama adalah memastikan integrasi antara modul manajemen keuangan konvensional dengan fitur syariah (Zakat) serta teknologi NLP berjalan secara presisi dan aman.

---

## 2. TIMELINE PENGEMBANGAN (7 MINGGU)

Jadwal ini mencakup siklus hidup pengembangan sistem (SDLC) mulai dari persiapan infrastruktur hingga peluncuran versi 1.0.

| Fase | Aktivitas Utama | Durasi | Output / Deliverables |
| :--- | :--- | :--- | :--- |
| **W1: Fondasi & Auth** | Setup environment, integrasi Firebase Auth, skema database, dan middleware keamanan. | 1 Minggu | API Auth & Database Schema |
| **W2: Modul Wallets** | Pengembangan CRUD Wallets, logika isolasi data `FamilyID`, dan RBAC (Kepala Keluarga/Istri). | 1 Minggu | Endpoint `/wallets` (Stable) |
| **W3: AI & NLP Core** | Integrasi Engine AI untuk proses teks mentah menjadi JSON terstruktur (NLP). | 1 Minggu | Endpoint `/transactions/process-nlp` |
| **W4: Transaksi & ACID** | Implementasi pencatatan transaksi dan update saldo otomatis (Atomic transaction). | 1 Minggu | Endpoint `/transactions` (Stable) |
| **W5: Modul Zakat** | Integrasi API harga emas, logika perhitungan nisab, haul, dan simulasi zakat. | 1 Minggu | Endpoint `/zakat` (Stable) |
| **W6: QA & Bug Fixing** | Pengujian menyeluruh (Unit, Integration, Security) dan perbaikan bug hasil temuan QA. | 1 Minggu | Bug Report & QA Clearance |
| **W7: UAT & Launch** | User Acceptance Test dengan stakeholder dan deployment ke produksi. | 1 Minggu | Production Release (V1.0) |

---

## 3. RENCANA PENJAMINAN KUALITAS (QA PLAN)

### 3.1. Strategi Pengujian
Untuk menjamin reliabilitas aplikasi keuangan, kami menerapkan pendekatan *Multi-Layer Testing*:

1.  **Unit Testing:** Pengujian logika dasar pada setiap fungsi, terutama pada kalkulasi saldo dan konversi nisab zakat.
2.  **Integration Testing:** Memastikan alur data dari input NLP AI masuk ke database transaksi dengan benar tanpa anomali data.
3.  **Security Testing:** Verifikasi token JWT Firebase dan pengujian penetrasi untuk memastikan data antar keluarga tidak bocor (*IDOR protection*).
4.  **Performance Testing:** Memastikan sistem mampu menangani *rate limiting* sesuai spesifikasi (100 req/min).

### 3.2. Skenario Pengujian Kritis (High Priority)

| ID | Fitur | Skenario Uji | Hasil yang Diharapkan |
| :--- | :--- | :--- | :--- |
| **TC-01** | Keamanan | Akses data `Wallet` milik `FamilyID` lain menggunakan token valid. | Sistem mengembalikan error `403 Forbidden`. |
| **TC-02** | NLP Engine | Input teks: "Bayar sekolah anak 1 juta dari tabungan". | AI mengekstraksi `amount: 1000000` dan kategori yang sesuai. |
| **TC-03** | Transaksi | Input transaksi melebihi saldo dompet yang tersedia. | Sistem mengembalikan `422 Unprocessable Entity` (Insufficient Funds). |
| **TC-04** | Zakat | Perhitungan nisab saat harga emas fluktuatif. | Kalkulasi otomatis mengikuti harga emas terbaru pukul 09:00 WIB. |
| **TC-05** | Rate Limit | Melakukan request AI lebih dari 10 kali dalam 1 menit. | Sistem melakukan *throttling* dan mengembalikan status 429. |

### 3.3. Metrik Keparahan Bug (Bug Severity)
*   **S1 (Blocker):** Kegagalan fungsi kritis (misal: saldo tidak berkurang setelah transaksi, kebocoran data).
*   **S2 (Critical):** Fungsi utama tidak berjalan namun ada *workaround* (misal: NLP gagal tapi input manual bisa).
*   **S3 (Major):** Kesalahan pada UI atau respon pesan error yang membingungkan user.
*   **S4 (Minor):** Typo pada teks atau masalah estetika minor.

---

## 4. KRITERIA KEBERTERIMAAN (ACCEPTANCE CRITERIA)

Proyek dinyatakan siap rilis jika memenuhi kriteria berikut:
1.  **Fungsional:** Seluruh endpoint (10 endpoint) berfungsi sesuai kontrak API V1.0.
2.  **Akurasi Keuangan:** Logika perhitungan zakat dan saldo dompet memiliki akurasi 100% (zero tolerance for calculation error).
3.  **Keamanan:** Lulus uji verifikasi isolasi data `FamilyID` dan otentikasi Firebase.
4.  **Performa:** Respons waktu API rata-rata < 500ms (tidak termasuk durasi proses AI eksternal).
5.  **Dokumentasi:** Swagger/Postman Collection telah diperbarui untuk konsumsi tim Frontend.

---

## 5. MANAJEMEN RISIKO

| Risiko | Dampak | Mitigasi |
| :--- | :--- | :--- |
| Latensi API AI Tinggi | User Experience terganggu | Implementasi *loading state* yang interaktif dan *asynchronous processing* jika diperlukan. |
| Harga Emas Gagal Sinkron | Perhitungan zakat tidak akurat | Menyediakan mekanisme *fallback* menggunakan harga emas terakhir yang tersimpan di cache/DB. |
| Kebocoran Data Keluarga | Reputasi Perusahaan | Audit ketat pada middleware `FamilyID` dan enkripsi data sensitif. |

---

**Disetujui Oleh,**

*(Tanda Tangan Elektronik)*

**Product Manager Senior**  
PT Digi Antara Masa