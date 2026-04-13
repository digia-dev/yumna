# DOKUMEN DESAIN TEKNIS & ARSITEKTUR (TECHNICAL DESIGN & ARCHITECTURE)
## Proyek: Aplikasi Web Pengatur Keuangan Keluarga Islami "Yumna"

**Dokumen:** YMN-ARCH-V1.0  
**Perusahaan:** PT Digi Antara Masa  
**Peran:** Senior System Analyst & Product Manager  
**Klasifikasi:** Internal / Confidential  

---

### 1. PENDAHULUAN

Dokumen ini memberikan spesifikasi teknis dan desain arsitektur untuk pengembangan aplikasi "Yumna". Arsitektur ini dirancang untuk mendukung skalabilitas, keamanan data finansial yang tinggi, dan integrasi kecerdasan buatan (AI) guna memberikan pengalaman pengguna yang intuitif sesuai prinsip syariah.

---

### 2. ARSITEKTUR SISTEM (HIGH-LEVEL ARCHITECTURE)

Yumna akan menggunakan arsitektur **Cloud-Native Microservices** untuk memastikan ketersediaan tinggi dan kemudahan pemeliharaan.

*   **Frontend:** React.js / Next.js dengan kapabilitas Progressive Web App (PWA) untuk akses offline dan notifikasi push.
*   **Backend API:** Node.js (NestJS) dengan TypeScript untuk *type-safety* pada logika finansial.
*   **Database Utama:** PostgreSQL (Relational) untuk integritas data transaksi.
*   **Caching & Real-time:** Redis untuk session management dan Socket.io untuk sinkronisasi antar anggota keluarga.
*   **AI Engine:** Integrasi OpenAI API (GPT-4 Model) dengan *custom prompting* untuk ekstraksi NLP.
*   **Identity Provider:** NEXT Authentication

---

### 3. SKEMA DATABASE (DATA MODEL)

Struktur data dirancang dengan isolasi ketat berbasis `FamilyID`.

| Tabel | Deskripsi | Field Kunci |
| :--- | :--- | :--- |
| **Families** | Grup keluarga besar. | `FamilyID` (PK), `SubscriptionStatus`, `CreatedAt` |
| **Users** | Data individu anggota keluarga. | `UserID` (PK), `FamilyID` (FK), `Role`, `Email` |
| **Wallets** | Entitas penyimpan dana (Multi-Wallet). | `WalletID` (PK), `FamilyID`, `Balance`, `Name` |
| **Transactions** | Catatan pengeluaran/pemasukan. | `TxID` (PK), `WalletID`, `UserID`, `Amount`, `Category`, `NLP_Source` |
| **Tasks** | Tugas domestik/finansial bersama. | `TaskID` (PK), `FamilyID`, `AssigneeID`, `Status`, `DueDate` |
| **ZakatLogs** | Riwayat perhitungan dan pembayaran zakat. | `ZakatID` (PK), `FamilyID`, `NisabValue`, `TotalWealth`, `ZakatAmount` |

---

### 4. INTEGRASI AI & NATURAL LANGUAGE PROCESSING (NLP)

Fitur pencatatan berbasis chat menggunakan pipeline berikut:

1.  **Input Ingestion:** User mengirim teks via WebSocket/HTTPS.
2.  **Processing Layer:** 
    *   Sistem mengirim prompt terstruktur ke LLM: *"Ekstrak jumlah, kategori, dan entitas dari kalimat: [Input]"*.
    *   Sistem menyertakan konteks waktu (WIB) dan daftar kategori yang tersedia di database.
3.  **JSON Parsing:** LLM mengembalikan objek JSON: `{ "amount": 50000, "category": "Transportasi", "note": "Beli bensin" }`.
4.  **Validation & Confirmation:** Frontend menampilkan modal konfirmasi sebelum data di-commit ke database.

---

### 5. LOGIKA BISNIS SYARIAH (ZAKAT & NISAB TRACKER)

Sistem mengimplementasikan kalkulasi zakat maal secara otomatis:

*   **API External:** Integrasi dengan API harga emas (misal: Logam Mulia) untuk update nilai Nisab harian (85 gram emas).
*   **Algoritma:** 
    ```
    IF (Total_Wealth >= (Current_Gold_Price * 85)) AND (Holding_Period >= 1_Year):
        Zakat_Due = Total_Wealth * 0.025
    ELSE:
        Zakat_Due = 0
    ```
*   **Haul Tracking:** Sistem melacak saldo terendah dalam satu tahun hijriah/masehi untuk menentukan pemenuhan syarat Haul.

---

### 6. IMPLEMENTASI KEAMANAN & RBAC

Keamanan data diatur melalui lapisan middleware:

1.  **Authentication:** Validasi Firebase JWT Token pada setiap request.
2.  **Authorization (RBAC):**
    *   **Kepala Keluarga:** Memiliki `permission_level: 3` (Full CRUD).
    *   **Istri:** Memiliki `permission_level: 2` (View All, Create/Update Transactions, Manage Tasks).
    *   **Anak:** Memiliki `permission_level: 1` (Create Own Transaction, View Assigned Tasks, Restricted Wallet Access).
3.  **Data Isolation:** Setiap query SQL wajib menyertakan clause `WHERE family_id = CURRENT_USER_FAMILY_ID`.

---

### 7. STRATEGI INFRASTRUKTUR & DEPLOYMENT

*   **Cloud Provider:** AWS (Amazon Web Services) atau Google Cloud Platform.
*   **CI/CD:** GitHub Actions untuk automated testing dan deployment ke lingkungan Staging/Production.
*   **Containerization:** Docker & Kubernetes (EKS/GKE) untuk manajemen container.
*   **Monitoring:** Sentry untuk error tracking dan Prometheus/Grafana untuk performa server.

---

### 8. PENANGANAN KONDISI KHUSUS (EDGE CASES)

| Skenario | Solusi Teknis |
| :--- | :--- |
| **Offline Transaction** | Menggunakan IndexedDB di sisi browser untuk menyimpan antrean transaksi (Service Workers). |
| **Data Inconsistency** | Implementasi *Database Transactions* (ACID) untuk memastikan saldo dompet tidak berkurang jika record transaksi gagal dibuat. |
| **API Timeout (AI)** | Fallback ke form input manual jika response LLM melebihi 5 detik. |
| **Currency Conversion** | Sinkronisasi rate harian jika keluarga menggunakan multi-currency (misal: IDR dan SAR). |

---

**Disetujui Oleh:**

*(Tanda Tangan Digital)*

**Management PT Digi Antara Masa**