import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private geminiModel: any;
  private openai: OpenAI;

  constructor() {
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
      
      KONTEKS TRANSAKSI TERAKHIR:
      ${context || 'Belum ada data transaksi.'}
      
      TUGAS ANDA:
      1. Berikan saran keuangan yang bijak berbasis Syariah.
      2. Jika pengguna ingin mencatat transaksi (misal: "tadi beli beras 50rb"), sertakan JSON di akhir pesan Anda:
         {"action": "TRANSACTION_RECORD", "data": {"amount": 50000, "category": "Pangan", "description": "Beli beras", "type": "EXPENSE"}}
      3. Jika pengguna ingin membuat tugas/pengingat (misal: "ingatkan bayar SPP" atau "tolong belikan susu"), sertakan JSON ini (Task 295):
         {"action": "TASK_CREATE", "data": {"title": "Beli susu", "priority": "Medium"}}
      4. Jika pengguna bertanya tentang tren atau analisis (Task 294):
         Gunakan data di "KONTEKS TRANSAKSI TERAKHIR" untuk memberikan insight.
      
      Gunakan Bahasa Indonesia yang santun. Bantulah pengguna mencapai Falah.
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
    const systemPrompt = `Anda adalah Yumna. Konteks: ${context}. Bantu pengguna dengan santun. Jika ada transaksi atau tugas, gunakan format JSON di akhir pesan.`;
    
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
}
