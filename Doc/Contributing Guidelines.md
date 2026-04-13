# Panduan Kontribusi (Contributing Guidelines)
## Proyek: Aplikasi Web Pengatur Keuangan Keluarga Islami "Yumna"

Selamat datang di Proyek **Yumna**. Dokumen ini disusun oleh tim Manajemen Produk dan Sistem Analis **PT Digi Antara Masa** sebagai pedoman standar bagi seluruh pengembang, desainer, dan kontributor yang terlibat dalam pengembangan aplikasi Yumna.

Tujuan dari panduan ini adalah untuk memastikan kualitas kode, konsistensi arsitektur, dan kelancaran kolaborasi tim dalam membangun solusi keuangan keluarga yang aman, amanah, dan inovatif.

---

### 1. Standar Kode dan Arsitektur
Seluruh kontribusi harus mematuhi standar teknis berikut:
*   **Keamanan Data:** Enkripsi AES-256 untuk data saldo sensitif dan penggunaan TLS 1.3.
*   **Clean Code:** Mengikuti prinsip SOLID dan desain pola yang konsisten.
*   **Prinsip Syariah:** Logika perhitungan pada modul *Islamic Tools* (Zakat & Nisab) harus merujuk pada standar yang telah ditetapkan dalam FBL dan divalidasi oleh ahli terkait.
*   **Teknologi Utama:** 
    *   Database: PostgreSQL (Relational) & Redis (Caching).
    *   AI: Integrasi OpenAI GPT-4o / BERT.
    *   Komunikasi: WebSockets (Socket.io) untuk sinkronisasi *real-time*.

---

### 2. Alur Kerja Git (Git Workflow)
Kami menggunakan model percabangan **Git Flow** yang dimodifikasi:

| Branch | Fungsi |
| :--- | :--- |
| `main` | Kode stabil yang siap produksi. Hanya dapat di-merge dari `staging`. |
| `staging` | Lingkungan pra-produksi untuk QA dan UAT. |
| `develop` | Branch utama untuk integrasi fitur yang sedang dikembangkan. |
| `feature/ID-nama-fitur` | Branch untuk pengembangan fitur baru (Contoh: `feature/F.1.1.1-social-auth`). |
| `hotfix/nama-perbaikan` | Perbaikan mendesak untuk bug di produksi. |

---

### 3. Konvensi Pesan Commit
Pesan commit harus informatif dan mengikuti format berikut:
`<type>(<scope>): <description>`

**Type yang diperbolehkan:**
*   `feat`: Fitur baru (sesuai FBL).
*   `fix`: Perbaikan bug.
*   `refactor`: Perubahan kode yang tidak mengubah fungsi maupun memperbaiki bug.
*   `docs`: Perubahan dokumentasi.
*   `test`: Menambah atau memperbaiki unit test.
*   `chore`: Pembaruan tugas build, library, dll.

**Contoh:**
`feat(finance): implementasi CRUD Transaction Engine (F.2.2.1)`

---

### 4. Prosedur Pull Request (PR)
Untuk menjaga integritas kode, setiap kontributor wajib mengikuti langkah-langkah PR berikut:

1.  **Sinkronisasi:** Pastikan branch Anda sudah mengambil pembaruan terbaru dari `develop`.
2.  **Self-Review:** Periksa kembali kode Anda terkait *hardcoded values* atau celah keamanan dasar.
3.  **Dokumentasi:** Sertakan penjelasan singkat mengenai apa yang diubah dan ID Fitur yang didelegasikan (merujuk pada FBL).
4.  **Testing:** Pastikan seluruh unit test lulus (pass).
5.  **Reviewer:** Tag minimal satu Senior Developer atau System Analyst untuk melakukan *code review*.
6.  **Merge:** Pull Request hanya akan di-merge setelah mendapatkan persetujuan (Approve) dan status CI/CD hijau.

---

### 5. Pelaporan Bug dan Masukan
Jika menemukan kendala teknis atau celah dalam logika bisnis, harap melaporkannya melalui sistem *Issue Tracker* dengan format:
*   **Judul:** [BUG/ISSUE] Deskripsi singkat.
*   **Langkah Reproduksi:** 1, 2, 3...
*   **Ekspektasi:** Hasil yang seharusnya terjadi.
*   **Hasil Aktual:** Apa yang sebenarnya terjadi.
*   **Prioritas:** (P1 - Urgent, P2 - Medium, P3 - Low).

---

### 6. Matriks Komunikasi Tim
| Kebutuhan | Kontak Utama | Saluran |
| :--- | :--- | :--- |
| Arsitektur & Logika Bisnis | System Analyst | Slack / Jira |
| Manajemen Fitur & Prioritas | Product Manager | Slack / Jira |
| Kendala Teknis / DevOps | Lead Developer | Slack / Dev-Channel |

---

### 7. Etika Kontribusi
Sebagai aplikasi berbasis nilai-nilai Islami, kami menjunjung tinggi profesionalisme, kejujuran dalam melaporkan progres, dan semangat kolaborasi yang sehat. Seluruh kontributor diharapkan untuk menjaga kerahasiaan data internal PT Digi Antara Masa.

---
**PT Digi Antara Masa**  
*Building Better Ummah Through Technology.*