# Yumna: Aplikasi Pengatur Keuangan Keluarga Islami

![Project Status](https://img.shields.io/badge/Status-Development-orange)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Classification](https://img.shields.io/badge/Classification-Internal-red)

## 1. Deskripsi Proyek
**Yumna** adalah aplikasi manajemen keuangan berbasis web yang dirancang khusus untuk membantu keluarga dalam mengelola ekosistem finansial mereka berdasarkan prinsip-prinsip Islami. Aplikasi ini tidak hanya berfungsi sebagai pencatat transaksi, tetapi juga sebagai asisten cerdas yang mengintegrasikan kecerdasan buatan (AI) untuk menyederhanakan input data dan memberikan saran keuangan yang strategis.

Proyek ini dikembangkan oleh **PT Digi Antara Masa** untuk menjawab tantangan pengelolaan kas keluarga yang seringkali kompleks, tidak terpusat, dan kurang memperhatikan aspek kewajiban syariat seperti zakat.

---

## 2. Fitur Utama (Core Features)

### 2.1 Manajemen Akses Keluarga (Family Centric)
*   **Family Grouping:** Sinkronisasi data antar anggota keluarga (Ayah, Ibu, Anak) dalam satu ekosistem.
*   **Role-Based Access Control (RBAC):** Pengaturan hak akses spesifik untuk menjaga privasi dan batasan tanggung jawab setiap anggota.

### 2.2 Core Finance Engine
*   **Multi-Wallet System:** Pemisahan dana berdasarkan tujuan penggunaan (Tabungan, Operasional, Dana Darurat).
*   **Automated Reporting:** Visualisasi arus kas bulanan dan mingguan secara real-time.

### 2.3 Islamic Finance Tools
*   **Zakat Calculator:** Penghitungan otomatis Zakat Maal, Profesi, dan Fitrah.
*   **Nisab Tracker:** Pemantauan ambang batas zakat yang terintegrasi dengan harga emas terkini.
*   **Savings Goals:** Pelacakan target tabungan untuk ibadah seperti Umroh dan Qurban.

### 2.4 Yumna AI Assistant (Generative AI)
*   **NLP Transaction:** Pencatatan transaksi cukup melalui perintah teks natural (contoh: "Beli bensin 50rb").
*   **AI Advisor:** Analisis pola pengeluaran untuk memberikan rekomendasi alokasi anggaran yang lebih bijak.
*   **Group AI Chat:** Interaksi langsung di dalam grup keluarga untuk tugas dan pengingat finansial.

---

## 3. Spesifikasi Teknis

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Platform** | Web Responsive | Mendukung Progressive Web App (PWA). |
| **Backend** | Node.js / Python | Penanganan logika bisnis dan API. |
| **Database** | PostgreSQL | Penyimpanan data relasional dan transaksi. |
| **Caching** | Redis | Manajemen session dan chat real-time. |
| **AI Model** | OpenAI GPT-4o | Pemrosesan bahasa alami (NLP) dan penasihat AI. |
| **Keamanan** | AES-256 & TLS 1.3 | Enkripsi data sensitif dan transmisi aman. |
| **Real-time** | Socket.io | Sinkronisasi data antar perangkat anggota keluarga. |

---

## 4. Struktur Modul

Aplikasi dibagi menjadi beberapa modul utama untuk memastikan skalabilitas:

1.  **Modul User & Access:** Pendaftaran SSO, sistem undangan keluarga, dan manajemen peran.
2.  **Modul Finance:** Mesin transaksi CRUD dan visualisasi grafik (Chart.js/Recharts).
3.  **Modul Islamic Tools:** Kalkulator zakat dan tracker nisab berbasis API eksternal.
4.  **Modul AI Integration:** Antarmuka chat dan engine ekstraksi entitas untuk NLP.
5.  **Modul Agenda:** Kalender bersama dan sistem penugasan (task assignment).
6.  **Modul Premium:** Ekspor data laporan (PDF/Excel) dan analisis mendalam.

---

## 5. Roadmap Pengembangan

| Fase | Durasi | Fokus Utama |
| :--- | :--- | :--- |
| **Sprint 1-2** | 4 Minggu | Fondasi Database, Autentikasi, dan CRUD Keuangan Dasar. |
| **Sprint 3-4** | 4 Minggu | Integrasi NLP AI Chat dan Dashboard Utama. |
| **Sprint 5-6** | 4 Minggu | Modul Islami, Manajemen Agenda, dan Notifikasi. |
| **Sprint 7-8** | 4 Minggu | Fitur Premium, Export Data, dan Optimalisasi UI/UX. |
| **Sprint 9** | 2 Minggu | Bug Fixing, QA, UAT, dan Final Deployment. |

---

## 6. Standar Keamanan & Data
*   Seluruh data saldo dan nominal transaksi dienkripsi menggunakan standar **AES-256** di tingkat database.
*   Implementasi **Middleware Subscription** untuk proteksi fitur berbayar.
*   Penerapan **Step Confirmation** pada setiap input berbasis AI untuk akurasi data 100%.

---

**Informasi Kontak & Maintenance:**
*   **Product Manager:** Senior PM - PT Digi Antara Masa
*   **System Analyst:** Senior System Analyst - PT Digi Antara Masa
*   **Repository:** Internal Git PT Digi Antara Masa

---
*© 2024 PT Digi Antara Masa. Seluruh hak cipta dilindungi undang-undang.*