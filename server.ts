import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini SDK with User-Agent header
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Si-KPLP Lapas Batang", timestamp: new Date().toISOString() });
  });

  // AI Lapsitkam Generator Endpoint
  app.post("/api/gemini/analyze-lapsitkam", async (req, res) => {
    try {
      const { incidents, securityStats, date } = req.body;
      const ai = getAiClient();

      const prompt = `
Anda adalah Asisten Kecerdasan Buatan Khusus Kepala Pengamanan Lembaga Pemasyarakatan (KPLP) Lapas Kelas IIB Batang.
Tugas Anda: Buat draft Laporan Situasi Keamanan dan Ketertiban (Lapsitkam) Harian Resmi untuk dikirimkan kepada Kepala Lapas Kelas IIB Batang dan Kadivpas Kantor Wilayah Kemenimipas Jawa Tengah.

Data Keamanan Hari Ini (${date || new Date().toLocaleDateString('id-ID')}):
- Status Keamanan: ${securityStats?.currentSecurityLevel || 'KONDUSIF'}
- Total Penghuni (WBP): ${securityStats?.totalWBP || 352} orang (Tahanan: ${securityStats?.tahananCount || 84}, Narapidana: ${securityStats?.napiCount || 268})
- Kapasitas Maksimal Lapas: ${securityStats?.capacityMax || 220} orang (Kondisi Overkapasitas)
- Regu Pengamanan Aktif: ${securityStats?.rupamActive || 'Regu III (Gamma)'} - Danrupam: ${securityStats?.danrupamActive || 'Aiptu Triyono'}
- Jumlah Insiden Hari Ini: ${incidents?.length || 0} kejadian
- Detail Insiden:
${JSON.stringify(incidents, null, 2)}

Petunjuk Format Laporan Resmi KPLP:
1. **KOP LAPORAN**: LAPORAN SITUASI KEAMANAN DAN KETERTIBAN (LAPSITKAM) KPLP LAPAS KELAS IIB BATANG
2. **RINGKASAN EKSEKUTIF**: Tinjauan umum situasi keamanan fisik & psikologis WBP.
3. **ANALISIS & KRONOLOGI INSIDEN**: Penjelasan singkat insiden penting, penyebab, dan penanganan yang telah diambil.
4. **REKOMENDASI KPLP**: 3-4 langkah taktis pencegahan (Sidak/Geledah, Penguatan P2U, Optimalisasi Patroli Menara Atas, Pembinaan Mental/Konseling WBP).
5. Format dalam Markdown bersih dengan penataan bullet point yang rapi dan bahasa kedinasan pemasyarakatan yang tepat.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah analis keamanan pemasyarakatan profesional KPLP Lapas Batang yang lugas, tegas, dan berpedoman pada Permenkumham No. 6 Tahun 2013 tentang Tata Tertib Lapas/Rutan.",
        },
      });

      res.json({
        success: true,
        report: response.text,
      });
    } catch (error: any) {
      console.error("Gemini Lapsitkam Error:", error);
      res.status(500).json({
        success: false,
        error: error?.message || "Gagal membuat analisis Lapsitkam.",
      });
    }
  });

  // AI Risk Matrix & Recommendation Endpoint
  app.post("/api/gemini/wbp-risk-assessment", async (req, res) => {
    try {
      const { wbpList, violations, incidents } = req.body;
      const ai = getAiClient();

      const prompt = `
Sebagai Analis Kerawanan KPLP Lapas Batang, lakukan analisis deteksi dini potensi gangguan keamanan berdasarkan data berikut:
Data WBP Pelanggar & Register F:
${JSON.stringify(violations, null, 2)}

Data Riwayat Insiden Terakhir:
${JSON.stringify(incidents, null, 2)}

Berikan output berupa:
1. **Matriks Kerawanan Blok Hunian** (Tingkat Risiko: Blok Alpha, Blok Beta, Blok Gamma, Sel Isolasi).
2. **Pola Pelanggaran Utama** (contoh: Kecenderungan Penyelundupan HP/Narkoba atau Perkelahian Antar Kamar).
3. **Rekomendasi Tindakan Preventif KPLP**:
   - Jadwal Geledah Insidental / Sidak Blok
   - Pengawasan Khusus WBP Residivis
   - Pemeriksaan P2U (Pintu Utama)
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({
        success: true,
        analysis: response.text,
      });
    } catch (error: any) {
      console.error("Gemini Risk Assessment Error:", error);
      res.status(500).json({
        success: false,
        error: error?.message || "Gagal melakukan analisis risiko.",
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Si-KPLP Lapas Batang running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
