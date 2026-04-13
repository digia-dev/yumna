# API SPECIFICATION: YUMNA WEB APP (V1.0)

**Proyek:** Aplikasi Web Pengatur Keuangan Keluarga Islami "Yumna"  
**Versi Dokumen:** YMN-API-V1.0  
**Instansi:** PT Digi Antara Masa  
**Status:** Confidential / Internal Only  

---

## 1. INFORMASI UMUM

Dokumen ini mendefinisikan kontrak antarmuka pemrograman aplikasi (API) untuk sistem Yumna. API ini dikembangkan menggunakan arsitektur RESTful dengan standar output JSON.

*   **Base URL:** `https://api.yumna.co.id/v1`
*   **Protokol:** HTTPS (TLS 1.3)
*   **Format Data:** JSON
*   **Zona Waktu:** UTC+7 (WIB)

---

## 2. KEAMANAN & OTENTIKASI

Seluruh endpoint (kecuali webhook publik) dilindungi oleh lapisan otentikasi Firebase.

*   **Mekanisme:** Bearer Token (JWT).
*   **Header:** `Authorization: Bearer <FIREBASE_JWT_TOKEN>`
*   **Validasi:** Setiap request akan melewati middleware untuk verifikasi `UserID` dan `FamilyID` guna memastikan isolasi data.

---

## 3. RINGKASAN ENDPOINT

### 3.1. Manajemen Dompet (Wallets)

| Method | Endpoint | Deskripsi | Akses Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/wallets` | Mengambil daftar semua dompet keluarga. | Semua |
| `POST` | `/wallets` | Membuat dompet baru (misal: Tabungan Haji). | Kepala Keluarga, Istri |
| `GET` | `/wallets/:id` | Detail saldo dan histori singkat dompet tertentu. | Semua |
| `PATCH` | `/wallets/:id` | Memperbarui nama atau target saldo dompet. | Kepala Keluarga, Istri |

### 3.2. Transaksi & NLP (Transactions)

| Method | Endpoint | Deskripsi | Akses Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/transactions/process-nlp` | Mengirim teks mentah ke AI untuk ekstraksi JSON. | Semua |
| `POST` | `/transactions` | Commit transaksi ke database (Finalisasi). | Semua |
| `GET` | `/transactions` | List transaksi dengan filter kategori/tanggal. | Semua |
| `DELETE` | `/transactions/:id` | Membatalkan/menghapus catatan transaksi. | Kepala Keluarga, Istri |

### 3.3. Modul Zakat (Zakat & Nisab)

| Method | Endpoint | Deskripsi | Akses Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/zakat/status` | Mengambil status haul dan nisab saat ini. | Kepala Keluarga, Istri |
| `GET` | `/zakat/calculate` | Simulasi perhitungan zakat berdasarkan saldo. | Kepala Keluarga, Istri |
| `POST` | `/zakat/pay` | Mencatat pembayaran zakat yang telah ditunaikan. | Kepala Keluarga, Istri |

---

## 4. SPESIFIKASI DETAIL ENDPOINT

### 4.1. Ekstraksi NLP (AI Engine)
Digunakan untuk memproses input bahasa alami menjadi data terstruktur sebelum disimpan.

*   **URL:** `POST /transactions/process-nlp`
*   **Request Body:**
```json
{
  "raw_text": "Beli bensin motor 50 ribu tadi siang di Pertamina",
  "wallet_id": "uuid-wallet-001"
}
```
*   **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "amount": 50000,
    "category": "Transportasi",
    "transaction_type": "EXPENSE",
    "note": "Beli bensin motor di Pertamina",
    "is_confirmed": false
  }
}
```

### 4.2. Pencatatan Transaksi (Finalize)
Menyimpan data ke database dan memperbarui saldo `Wallets` secara atomik (ACID).

*   **URL:** `POST /transactions`
*   **Request Body:**
```json
{
  "wallet_id": "uuid-wallet-001",
  "amount": 50000,
  "category": "Transportasi",
  "transaction_type": "EXPENSE",
  "note": "Beli bensin motor",
  "nlp_source": "Beli bensin motor 50 ribu..."
}
```
*   **Success Response (201 Created):**
```json
{
  "status": "success",
  "transaction_id": "tx-99821",
  "new_balance": 450000
}
```

### 4.3. Cek Status Zakat
Mengintegrasikan harga emas harian untuk kalkulasi nisab.

*   **URL:** `GET /zakat/status`
*   **Success Response (200 OK):**
```json
{
  "current_gold_price_per_gram": 1200000,
  "nisab_threshold": 102000000,
  "total_wealth_detected": 150000000,
  "is_nisab_reached": true,
  "haul_start_date": "2023-05-24T00:00:00Z",
  "estimated_zakat": 3750000
}
```

---

## 5. PENANGANAN ERROR (ERROR HANDLING)

Yumna menggunakan standar kode status HTTP untuk merepresentasikan kegagalan API.

| Kode | Pesan | Penjelasan |
| :--- | :--- | :--- |
| `400` | `Bad Request` | Parameter input tidak valid atau format JSON salah. |
| `401` | `Unauthorized` | Token Firebase tidak valid atau kadaluwarsa. |
| `403` | `Forbidden` | User tidak memiliki hak akses (RBAC) atau beda `FamilyID`. |
| `404` | `Not Found` | Resource (Wallet/Transaction) tidak ditemukan. |
| `422` | `Unprocessable Entity` | Saldo tidak cukup atau gagal memproses logika AI. |
| `500` | `Internal Server Error` | Terjadi kegagalan pada sistem internal atau database. |

**Contoh Response Error:**
```json
{
  "error": true,
  "code": "INSUFFICIENT_FUNDS",
  "message": "Saldo dompet tidak mencukupi untuk transaksi ini.",
  "trace_id": "req-992-xab"
}
```

---

## 6. BATASAN PENGGUNAAN (RATE LIMITING)

Untuk menjaga stabilitas sistem dan efisiensi biaya API OpenAI:
1.  **Standard API:** 100 request per menit per User.
2.  **AI NLP API:** 10 request per menit per User.
3.  **Zakat Update:** Sinkronisasi harga emas dilakukan otomatis setiap jam 09:00 WIB.

---

**Disiapkan Oleh:**
System Analyst & Product Management Team
**PT Digi Antara Masa**