/**
 * Yumna Tone of Voice: Sakinah & Empathetic
 * 
 * Rules:
 * 1. Use polite Indonesian (Santun).
 * 2. Incorporate subtle Islamic terms (Barakallah, Bismillah, InshaAllah).
 * 3. Focus on "Keberkahan" (Blessing) rather than just "Profit".
 * 4. Empathetic towards spending, supportive of savings.
 */

export const MICROCOPY = {
  GLOBAL: {
    APP_NAME: "Yumna",
    TAGLINE: "Asisten Keuangan Keluarga Islami",
    BISMILLAH: "Bismillah",
    BARAKALLAH: "Barakallah",
  },
  AUTH: {
    WELCOME: "Selamat Datang di Keluarga Yumna",
    SUBTITLE: "Mulai perjalanan finansial yang penuh berkah bersama orang tercinta.",
    LOGIN_SUCCESS: "Alhamdulillah, selamat datang kembali.",
    LOGOUT_CONFIRM: "Apakah Anda ingin mengakhiri sesi ini? Semoga hari Anda penuh berkah.",
  },
  TRANSACTIONS: {
    SUCCESS_SAVE: "Barakallah, transaksi Anda telah tercatat dengan amanah.",
    EMPTY_STATE: "Belum ada amanah harta yang dicatat hari ini. Mari mulai dengan Bismillah.",
    CATEGORY_PROMPT: "Mohon maaf, pengeluaran ini ingin dimasukkan ke kategori apa?",
  },
  ZAKAT: {
    CALCULATOR_TITLE: "Pembersih Harta (Zakat)",
    NISAB_INFO: "Nisab saat ini setara dengan 85gr Emas. Semoga Allah melimpahkan rezeki.",
    REMINDER: "Waktunya Zakat Maal. Membersihkan harta, menenangkan jiwa.",
  },
  TASKS: {
    ASSIGN_PROMPT: "Amanah ini ingin ditugaskan kepada siapa?",
    DUE_DATE: "Tenggat waktu pengerjaan amanah.",
  }
} as const;
