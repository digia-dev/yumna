import { Injectable, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import axios from 'axios';
import { FinanceService } from '../finance/finance.service';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private geminiModel: any;
  private openai: OpenAI;

  constructor(
    @Inject(forwardRef(() => FinanceService))
    private financeService: FinanceService
  ) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      this.genAI = new GoogleGenerativeAI(geminiKey);
      this.geminiModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
      });
    }
  }

  async extractTransaction(text: string) {
    if (this.openai) {
      return this.extractWithOpenAI(text);
    } else if (this.geminiModel) {
      return this.extractWithGemini(text);
    } else {
      throw new InternalServerErrorException('AI Service not configured (Missing API Keys)');
    }
  }

  private async extractWithOpenAI(text: string) {
    const prompt = `
      Anda adalah Yumna, asissten AI profesional untuk keuangan keluarga Islami.
      Tugas Anda adalah mengekstrak data transaksi dari input pengguna ke dalam format JSON terstruktur untuk dikonfirmasi.
      
      Input Pengguna: "${text}"
      
      Aturan Ekstraksi:
      1. Identifikasi nominal (amount), kategori (category), deskripsi (description), dan dompet (wallet) jika disebutkan.
      2. Kategori yang tersedia: Pangan, Transportasi, Utilitas, Cicilan, Sedekah, Pendidikan, Hiburan, Kesehatan, Wakaf, Lainnya.
      3. Tentukan tipe: INCOME atau EXPENSE.
      4. Gunakan Bahasa Indonesia yang sopan.
      
      Format Output JSON:
      {
        "action": "TRANSACTION_RECORD",
        "data": {
          "amount": number,
          "category": "string",
          "description": "string",
          "wallet": "string atau null",
          "type": "EXPENSE atau INCOME"
        }
      }
      
      Hanya keluarkan JSON.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('OpenAI Extraction Error:', error);
      throw new InternalServerErrorException('Gagal memproses teks dengan OpenAI.');
    }
  }

  private async extractWithGemini(text: string) {
    const prompt = `
      Anda adalah Yumna, asissten AI profesional untuk keuangan keluarga Islami.
      Tugas Anda adalah mengekstrak data transaksi dari input pengguna ke dalam format JSON terstruktur untuk dikonfirmasi.
      
      Input Pengguna: "${text}"
      
      Aturan Ekstraksi:
      1. Identifikasi nominal (amount), kategori (category), deskripsi (description), dan dompet (wallet) jika disebutkan.
      2. Kategori yang tersedia: Pangan, Transportasi, Utilitas, Cicilan, Sedekah, Pendidikan, Hiburan, Kesehatan, Wakaf, Lainnya.
      3. Tentukan tipe: INCOME atau EXPENSE.
      
      Format Output JSON:
      {
        "action": "TRANSACTION_RECORD",
        "data": {
          "amount": number,
          "category": "string",
          "description": "string",
          "wallet": "string atau null",
          "type": "EXPENSE atau INCOME"
        }
      }
      
      Hanya keluarkan JSON tanpa markdown.
    `;

    try {
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().trim();
      const cleanedJson = jsonText.replace(/```json|```/g, '');
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error('Gemini Extraction Error:', error);
      throw new InternalServerErrorException('Gagal memproses teks dengan Gemini.');
    }
  }

  async chat(message: string, history: any[] = [], context: string = '') {
    if (!this.openai && !this.geminiModel) {
      throw new InternalServerErrorException('AI Service not configured');
    }

    if (this.openai) {
      return this.chatWithOpenAI(message, history, context);
    } else {
      return this.chatWithGemini(message, history, context);
    }
  }

  private async chatWithOpenAI(message: string, history: any[], context: string) {
    const systemPrompt = `
      Anda adalah Yumna, asisten AI profesional untuk keuangan keluarga Islami. Karakter: Amanah, Empatik, dan Proaktif.
      
      WAKTU SEKARANG: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} (WIB)
      
      KONTEKS TRANSAKSI TERAKHIR:
      ${context || 'Belum ada data transaksi.'}
      
      TUGAS ANDA:
      1. Berikan saran keuangan yang bijak berbasis Syariah (Fikih Muamalah).
      2. Identifikasi NIAT pengguna dan berikan respon yang empatik.
      3. Jika pengguna menyebutkan transaksi, tugas, atau pengingat, keluarkan format JSON di akhir pesan.
      4. PENTING: Jika ada LEBIH DARI SATU aksi (misal: "beli bensin dan beli roti"), keluarkan SEMUA aksi tersebut dalam sebuah ARRAY JSON.
      
      CONTOH MULTI-AKSI:
      Input: "tadi beli bensin 100rb dan roti 20rb"
      Output: [
        {"action": "TRANSACTION_RECORD", "data": {"amount": 100000, "category": "Transportasi", "description": "Beli bensin", "type": "EXPENSE"}},
        {"action": "TRANSACTION_RECORD", "data": {"amount": 20000, "category": "Pangan", "description": "Beli roti", "type": "EXPENSE"}}
      ]
      
      SUPPORTED ACTIONS:
      - TRANSACTION_RECORD: {"amount", "category", "description", "wallet", "type"}
      - TASK_CREATE: {"title", "priority"}
      - REMINDER_CREATE: {"title", "remindAt"}
      
      BAHASA & STYLE:
      - Gunakan Bahasa Indonesia yang santun, hangat (seperti keluarga), dan religius (gunakan salam, doa/dzikir pendek seperti Alhamdulillah/Barakallah jika relevan).
      - Jangan terlalu kaku seperti robot.
    `;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Chat Error:', error);
      throw new InternalServerErrorException('Gagal melakukan chat dengan OpenAI.');
    }
  }

  private async chatWithGemini(message: string, history: any[], context: string) {
    const systemPrompt = `Anda adalah Yumna. Waktu: ${new Date().toISOString()}. Konteks: ${context}. Bantu pengguna dengan santun. Jika ada transaksi, tugas, atau pengingat, gunakan format JSON di akhir pesan (TRANSACTION_RECORD, TASK_CREATE, atau REMINDER_CREATE).`;
    
    try {
      const chat = this.geminiModel.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Baik, saya Yumna. Saya siap membantu.' }] },
          ...history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          }))
        ],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      throw new InternalServerErrorException('Gagal melakukan chat dengan Gemini.');
    }
  }

  // Task 306: AI Moderation
  async generateAdvisorInsight(familyId: string) {
    const data = await this.financeService.getWeeklyAdvisorData(familyId);
    
    const prompt = `
      Sebagai Yumna, asisten keuangan keluarga Islami, berikan 1 kalimat saran singkat (maksimal 20 kata) berdasarkan data keuangan minggu ini:
      Pemasukan: ${data.income}
      Pengeluaran: ${data.expense}
      Kategori Terbesar: ${JSON.stringify(data.topExpenseCategories)}
      Progress Tabungan: ${JSON.stringify(data.savingsProgress)}
      
      Berikan saran yang memotivasi, praktis, dan religius. Jangan gunakan placeholder.
    `;

    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return { insight: text.trim() };
  }

  async moderateContent(text: string): Promise<boolean> {
    if (!this.openai) return true; // Skip if OpenAI not configured

    try {
      const moderation = await this.openai.moderations.create({ input: text });
      const results = moderation.results[0];
      return !results.flagged;
    } catch (error) {
      console.error('AI Moderation Error:', error);
      return true; // Assume safe if check fails to avoid blocking users
    }
  }

  // Task 327: Image-to-Transaction (OCR for receipts)
  async processReceipt(imageUrl: string) {
    if (!this.geminiModel) {
      throw new InternalServerErrorException('Gemini not configured for vision tasks.');
    }

    try {
      // Fetch image bytes
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      const prompt = `
        Ekstrak data transaksi dari gambar struk/nota ini ke dalam format JSON.
        Identifikasi: nominal (amount), kategori (category), deskripsi (description), dan tipe (EXPENSE).
        Kategori: Pangan, Transportasi, Utilitas, Cicilan, Sedekah, Pendidikan, Hiburan, Kesehatan, Wakaf, Lainnya.
        
        Output JSON:
        {
          "action": "TRANSACTION_RECORD",
          "data": {
            "amount": number,
            "category": "string",
            "description": "string (nama merchant/item)",
            "type": "EXPENSE"
          }
        }
      `;

      const result = await this.geminiModel.generateContent([
        prompt,
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: 'image/jpeg', // Assume jpeg, or detect from URL
          },
        },
      ]);

      const text = result.response.text();
      const cleanedJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error('OCR Error:', error);
      return null;
    }
  }

  // Task 326: Auto-translate
  async translateText(text: string, targetLang: string = 'Indonesian') {
    const prompt = `Translate the following chat message to ${targetLang}. Preserve the emotional tone and any Islamic terms. Only return the translation.\n\nMessage: "${text}"`;
    
    try {
      if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
        });
        return response.choices[0].message.content;
      } else {
        const result = await this.geminiModel.generateContent(prompt);
        return result.response.text();
      }
    } catch (error) {
       console.error('Translation Error:', error);
       return text;
    }
  }

  async suggestTasks(familyId: string) {
    const context = await this.financeService.getWeeklyAdvisorData(familyId);
    
    const prompt = `
      Sebagai Yumna, asisten keluarga Islami, sarankan 3 tugas barakah yang relevan untuk keluarga ini minggu ini.
      Konteks Keuangan: Pemasukan ${context.income || 0}, Pengeluaran ${context.expense || 0}.
      Kategori Terbesar: ${JSON.stringify(context.topExpenseCategories || [])}.
      
      Tugas bisa berupa: belanja kebutuhan yang tertunda, menabung, sedekah, atau persiapan acara Islami terdekat.
      
      Format Output JSON:
      [
        {"title": "string", "description": "string", "priority": "LOW/MEDIUM/HIGH/URGENT", "category": "Belanja/Sedekah/Tabungan/Lainnya"}
      ]
      Hanya keluarkan JSON.
    `;

    try {
      if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });
        const content = response.choices[0].message.content || '[]';
        return JSON.parse(content);
      } else {
        const result = await this.geminiModel.generateContent(prompt);
        const text = result.response.text().trim();
        const cleanedJson = text.replace(/```json|```/g, '');
        return JSON.parse(cleanedJson);
      }
    } catch (error) {
       console.error('Task Suggestions Error:', error);
       return [];
    }
  }
}
