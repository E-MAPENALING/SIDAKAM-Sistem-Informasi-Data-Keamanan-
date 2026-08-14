import { RiskLevel, BlockLocation, WBPStatus } from '../types';

export interface InterviewQuestionItem {
  id: string;
  number: number;
  question: string;
  type: 'SELECT' | 'YES_NO' | 'TEXT';
  options?: { label: string; value: string; score: number }[];
  yesScore?: number;
  noScore?: number;
  explanationRequired?: boolean;
  explanationPlaceholder?: string;
}

export interface InterviewSection {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  code: string;
  title: string;
  goal: string;
  questions: InterviewQuestionItem[];
}

export interface InterviewAnswers {
  [questionId: string]: {
    answer: string;
    explanation?: string;
    score: number;
  };
}

export interface OfficerVerification {
  directObservation: boolean;
  directObservationNotes: string;
  registrationRecords: boolean;
  registrationNotes: string;
  disciplineHistoryRegisterF: boolean;
  disciplineNotes: string;
  kplpIntelligenceInfo: boolean;
  intelligenceNotes: string;
  bapasAssessment: boolean;
  bapasNotes: string;
  verificationConclusion: string;
}

export const INTERVIEW_SECTIONS: InterviewSection[] = [
  {
    id: 'A',
    code: 'A',
    title: 'PROFIL KEPRIBADIAN & KARAKTER',
    goal: 'Mengetahui sikap, pengendalian diri, kepatuhan, dan karakter Tahanan/Narapidana.',
    questions: [
      {
        id: 'A1',
        number: 1,
        question: 'Bagaimana hubungan Saudara dengan petugas selama berada di Lapas/Rutan?',
        type: 'SELECT',
        options: [
          { label: 'Baik', value: 'Baik', score: 0 },
          { label: 'Cukup', value: 'Cukup', score: 1 },
          { label: 'Kurang', value: 'Kurang', score: 3 },
        ],
      },
      {
        id: 'A2',
        number: 2,
        question: 'Apakah Saudara bersedia mengikuti arahan dan perintah petugas?',
        type: 'YES_NO',
        yesScore: 0,
        noScore: 3,
      },
      {
        id: 'A3',
        number: 3,
        question: 'Apakah Saudara pernah merasa marah atau emosi ketika mendapat teguran dari petugas?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'A4',
        number: 4,
        question: 'Jika ditegur petugas, bagaimana biasanya Saudara merespons?',
        type: 'SELECT',
        options: [
          { label: 'Tenang', value: 'Tenang', score: 0 },
          { label: 'Keberatan', value: 'Keberatan', score: 2 },
          { label: 'Melawan', value: 'Melawan', score: 4 },
        ],
      },
      {
        id: 'A5',
        number: 5,
        question: 'Apakah Saudara mudah tersinggung terhadap perkataan atau tindakan orang lain?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'A6',
        number: 6,
        question: 'Apakah Saudara pernah terlibat pertengkaran atau perselisihan dengan Tahanan/Narapidana lain?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'A7',
        number: 7,
        question: 'Ketika menghadapi masalah dengan orang lain, apa yang biasanya Saudara lakukan?',
        type: 'SELECT',
        options: [
          { label: 'Berdiskusi', value: 'Berdiskusi', score: 0 },
          { label: 'Menghindar', value: 'Menghindar', score: 0 },
          { label: 'Melawan', value: 'Melawan', score: 3 },
          { label: 'Lainnya', value: 'Lainnya', score: 1 },
        ],
      },
      {
        id: 'A8',
        number: 8,
        question: 'Apakah Saudara merasa mampu mengendalikan emosi ketika menghadapi masalah?',
        type: 'YES_NO',
        yesScore: 0,
        noScore: 2,
      },
      {
        id: 'A9',
        number: 9,
        question: 'Apakah Saudara bersedia menaati seluruh tata tertib Lapas/Rutan?',
        type: 'YES_NO',
        yesScore: 0,
        noScore: 3,
      },
      {
        id: 'A10',
        number: 10,
        question: 'Apakah Saudara pernah dengan sengaja melanggar tata tertib selama berada di Lapas/Rutan?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'A11',
        number: 11,
        question: 'Apakah Saudara merasa menyesal atas pelanggaran yang pernah dilakukan?',
        type: 'YES_NO',
        yesScore: 0,
        noScore: 2,
      },
      {
        id: 'A12',
        number: 12,
        question: 'Apa yang Saudara lakukan untuk mencegah agar pelanggaran tersebut tidak terulang?',
        type: 'TEXT',
        explanationPlaceholder: 'Tuliskan langkah / komitmen WBP untuk mencegah pelanggaran...',
      },
    ],
  },
  {
    id: 'B',
    code: 'B',
    title: 'INTERAKSI SOSIAL & SIKAP TERHADAP SESAMA TAHANAN/NARAPIDANA',
    goal: 'Mengetahui pola pergaulan dan pengaruh sosial yang dimiliki.',
    questions: [
      {
        id: 'B1',
        number: 1,
        question: 'Dengan siapa Saudara paling sering berinteraksi di dalam Lapas/Rutan?',
        type: 'TEXT',
        explanationPlaceholder: 'Teman sekamar, rekan asal daerah sama, tamping, dll...',
      },
      {
        id: 'B2',
        number: 2,
        question: 'Apakah Saudara memiliki teman dekat atau kelompok pergaulan tertentu di dalam Lapas/Rutan?',
        type: 'YES_NO',
        yesScore: 1,
        noScore: 0,
        explanationRequired: true,
        explanationPlaceholder: 'Sebutkan nama atau kelompoknya...',
      },
      {
        id: 'B3',
        number: 3,
        question: 'Jika Ya, siapa saja yang paling sering berinteraksi dengan Saudara?',
        type: 'TEXT',
        explanationPlaceholder: 'Nama-nama WBP yang sering bersama...',
      },
      {
        id: 'B4',
        number: 4,
        question: 'Apakah Saudara mengetahui latar belakang perkara atau pelanggaran yang dilakukan teman dekat Saudara?',
        type: 'YES_NO',
        yesScore: 1,
        noScore: 0,
      },
      {
        id: 'B5',
        number: 5,
        question: 'Apakah Saudara sering diminta bantuan atau pendapat oleh Tahanan/Narapidana lain?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'B6',
        number: 6,
        question: 'Apakah Saudara merasa memiliki pengaruh terhadap Tahanan/Narapidana lain?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'B7',
        number: 7,
        question: 'Apakah pernah ada Tahanan/Narapidana lain yang meminta Saudara menyimpan atau menyampaikan sesuatu?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'B8',
        number: 8,
        question: 'Apakah pernah ada Tahanan/Narapidana lain yang meminta Saudara melakukan sesuatu yang bertentangan dengan tata tertib?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
      {
        id: 'B9',
        number: 9,
        question: 'Apakah Saudara pernah menerima titipan barang dari Tahanan/Narapidana lain?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'B10',
        number: 10,
        question: 'Apakah Saudara pernah memberikan barang atau sesuatu kepada Tahanan/Narapidana lain tanpa melalui prosedur yang berlaku?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'B11',
        number: 11,
        question: 'Apakah Saudara pernah terlibat perselisihan atau konflik dengan kelompok Tahanan/Narapidana tertentu?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'B12',
        number: 12,
        question: 'Apakah ada Tahanan/Narapidana tertentu yang menurut Saudara perlu dihindari? Mengapa?',
        type: 'TEXT',
        explanationPlaceholder: 'Sebutkan nama WBP dan alasan konflik/kekhawatiran...',
      },
    ],
  },
  {
    id: 'C',
    code: 'C',
    title: 'AFILIASI JARINGAN / KELOMPOK',
    goal: 'Mendeteksi potensi hubungan atau jaringan luar/dalam secara netral dan objektif.',
    questions: [
      {
        id: 'C1',
        number: 1,
        question: 'Apakah Saudara memiliki teman atau kenalan yang pernah menjalani pidana di Lapas/Rutan lain?',
        type: 'YES_NO',
        yesScore: 1,
        noScore: 0,
      },
      {
        id: 'C2',
        number: 2,
        question: 'Apakah Saudara memiliki hubungan dengan Tahanan/Narapidana yang pernah melakukan pelanggaran tata tertib?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'C3',
        number: 3,
        question: 'Apakah Saudara masih berkomunikasi dengan mantan Tahanan/Narapidana yang telah bebas?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'C4',
        number: 4,
        question: 'Jika Ya, apa hubungan Saudara dengan orang tersebut?',
        type: 'TEXT',
        explanationPlaceholder: 'Keluarga, rekan kerja, mantan teman sekamar, dll...',
      },
      {
        id: 'C5',
        number: 5,
        question: 'Apakah Saudara pernah bergabung atau menjadi bagian dari kelompok tertentu sebelum masuk Lapas/Rutan?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'C6',
        number: 6,
        question: 'Apakah kelompok tersebut masih berkomunikasi dengan Saudara selama berada di Lapas/Rutan?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'C7',
        number: 7,
        question: 'Apakah ada pihak tertentu di dalam atau di luar Lapas/Rutan yang sering meminta bantuan kepada Saudara?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'C8',
        number: 8,
        question: 'Apakah Saudara pernah diminta menyampaikan pesan kepada Tahanan/Narapidana lain?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'C9',
        number: 9,
        question: 'Apakah Saudara pernah diminta meneruskan barang atau sesuatu kepada orang lain?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'C10',
        number: 10,
        question: 'Apakah ada orang tertentu yang Saudara anggap sebagai bagian dari kelompok atau jaringan pergaulan Saudara?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'C11',
        number: 11,
        question: 'Jika ada, siapa dan apa hubungan Saudara dengan orang tersebut?',
        type: 'TEXT',
        explanationPlaceholder: 'Uraian rincian identitas & hubungan...',
      },
      {
        id: 'C12',
        number: 12,
        question: 'Apakah Saudara masih memiliki hubungan atau kepentingan dengan kelompok/pergaulan sebelum menjalani pidana?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
    ],
  },
  {
    id: 'D',
    code: 'D',
    title: 'POTENSI PELANGGARAN KEAMANAN',
    goal: 'Bagian krusial untuk mengukur Tingkat Risiko Keamanan & Pelanggaran Tata Tertib.',
    questions: [
      {
        id: 'D1',
        number: 1,
        question: 'Apakah Saudara pernah melanggar tata tertib selama menjalani pidana?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'D2',
        number: 2,
        question: 'Apakah Saudara pernah menyimpan barang yang dilarang berada di dalam Lapas/Rutan?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
      {
        id: 'D3',
        number: 3,
        question: 'Apakah Saudara pernah menerima barang dari pihak lain tanpa melalui prosedur yang berlaku?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'D4',
        number: 4,
        question: 'Apakah Saudara pernah memberikan barang kepada Tahanan/Narapidana lain tanpa prosedur yang berlaku?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'D5',
        number: 5,
        question: 'Apakah Saudara pernah diminta memasukkan atau mengeluarkan barang dari Lapas/Rutan secara tidak resmi?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
      {
        id: 'D6',
        number: 6,
        question: 'Apakah Saudara pernah mengetahui adanya peredaran barang terlarang di dalam Lapas/Rutan?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'D7',
        number: 7,
        question: 'Jika mengetahui, apakah Saudara pernah diminta untuk membantu kegiatan tersebut?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
      {
        id: 'D8',
        number: 8,
        question: 'Apakah pernah ada pihak yang menawarkan keuntungan kepada Saudara sebagai imbalan untuk melakukan sesuatu di dalam Lapas/Rutan?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
      {
        id: 'D9',
        number: 9,
        question: 'Apakah Saudara pernah diminta menjadi perantara antara Tahanan/Narapidana dengan pihak luar?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
      {
        id: 'D10',
        number: 10,
        question: 'Apakah Saudara pernah menerima atau menyampaikan pesan yang berkaitan dengan kegiatan yang melanggar aturan?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
      {
        id: 'D11',
        number: 11,
        question: 'Apakah Saudara mengetahui adanya rencana pelanggaran yang akan dilakukan Tahanan/Narapidana lain?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'D12',
        number: 12,
        question: 'Apakah Saudara pernah diajak melakukan pelanggaran tata tertib oleh Tahanan/Narapidana lain?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
    ],
  },
  {
    id: 'E',
    code: 'E',
    title: 'RIWAYAT RESIDIVISME DAN PENGULANGAN PELANGGARAN',
    goal: 'Menganalisis pengulangan tindak pidana dan konsistensi kepatuhan hukum.',
    questions: [
      {
        id: 'E1',
        number: 1,
        question: 'Apakah ini pertama kalinya Saudara menjalani pidana?',
        type: 'YES_NO',
        yesScore: 0,
        noScore: 3,
      },
      {
        id: 'E2',
        number: 2,
        question: 'Apakah Saudara pernah menjalani pidana sebelumnya?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'E3',
        number: 3,
        question: 'Jika pernah, di Lapas/Rutan mana Saudara pernah menjalani pidana?',
        type: 'TEXT',
        explanationPlaceholder: 'Nama Lapas / Rutan sebelumnya...',
      },
      {
        id: 'E4',
        number: 4,
        question: 'Apa perkara yang menyebabkan Saudara menjalani pidana sebelumnya?',
        type: 'TEXT',
        explanationPlaceholder: 'Kasus pidana sebelumnya...',
      },
      {
        id: 'E5',
        number: 5,
        question: 'Apakah Saudara pernah mendapatkan hukuman disiplin selama menjalani pidana sebelumnya?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'E6',
        number: 6,
        question: 'Apakah Saudara pernah melakukan pelanggaran yang sama lebih dari satu kali?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
      {
        id: 'E7',
        number: 7,
        question: 'Menurut Saudara, apa yang menyebabkan pelanggaran tersebut terjadi kembali?',
        type: 'TEXT',
        explanationPlaceholder: 'Faktor pendorong pengulangan perkara / pergaulan...',
      },
      {
        id: 'E8',
        number: 8,
        question: 'Apa yang akan Saudara lakukan agar tidak mengulangi pelanggaran tersebut?',
        type: 'TEXT',
        explanationPlaceholder: 'Komitmen perubahan perilaku...',
      },
    ],
  },
  {
    id: 'F',
    code: 'F',
    title: 'POTENSI KETERLIBATAN BARANG TERLARANG (HP / NARKOBA / SAJAM)',
    goal: 'Khusus KPLP: Menyelidiki potensi perantara, kurir, dan penyelundupan barang terlarang.',
    questions: [
      {
        id: 'F1',
        number: 1,
        question: 'Apakah Saudara pernah mengetahui adanya barang terlarang yang beredar di dalam Lapas/Rutan?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'F2',
        number: 2,
        question: 'Bagaimana Saudara mengetahui keberadaan barang tersebut?',
        type: 'TEXT',
        explanationPlaceholder: 'Melihat langsung, dengar kabar, ditawari...',
      },
      {
        id: 'F3',
        number: 3,
        question: 'Apakah pernah ada orang yang menawarkan barang terlarang kepada Saudara?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'F4',
        number: 4,
        question: 'Apakah Saudara pernah diminta menyimpan barang milik orang lain?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
      {
        id: 'F5',
        number: 5,
        question: 'Apakah Saudara pernah menerima titipan barang yang tidak Saudara ketahui isinya?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'F6',
        number: 6,
        question: 'Apakah pernah ada pihak yang menawarkan uang atau keuntungan kepada Saudara untuk membawa atau menyerahkan barang tertentu?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
      {
        id: 'F7',
        number: 7,
        question: 'Apakah Saudara pernah diminta menjadi perantara dalam transaksi atau penyerahan barang?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
      {
        id: 'F8',
        number: 8,
        question: 'Apakah Saudara mengetahui siapa saja yang sering melakukan aktivitas tersebut?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'F9',
        number: 9,
        question: 'Apakah Saudara pernah terlibat secara langsung maupun tidak langsung?',
        type: 'YES_NO',
        yesScore: 5,
        noScore: 0,
      },
      {
        id: 'F10',
        number: 10,
        question: 'Apakah saat ini masih ada pihak yang menghubungi Saudara terkait aktivitas tersebut?',
        type: 'YES_NO',
        yesScore: 4,
        noScore: 0,
      },
    ],
  },
  {
    id: 'G',
    code: 'G',
    title: 'PERTANYAAN REKOMENDASI PENEMPATAN BLOK & KAMAR',
    goal: 'Mendeteksi potensi kerentanan, konflik kamar, dan kebutuhan tingkat pengawasan.',
    questions: [
      {
        id: 'G1',
        number: 1,
        question: 'Apakah Saudara merasa aman ditempatkan bersama Tahanan/Narapidana lainnya?',
        type: 'YES_NO',
        yesScore: 0,
        noScore: 3,
      },
      {
        id: 'G2',
        number: 2,
        question: 'Apakah terdapat Tahanan/Narapidana tertentu yang sebaiknya tidak ditempatkan bersama Saudara?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'G3',
        number: 3,
        question: 'Apakah Saudara memiliki konflik dengan Tahanan/Narapidana tertentu?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'G4',
        number: 4,
        question: 'Apakah ada pihak yang pernah mengancam atau menekan Saudara?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'G5',
        number: 5,
        question: 'Apakah ada pihak yang meminta Saudara melakukan sesuatu yang bertentangan dengan aturan?',
        type: 'YES_NO',
        yesScore: 3,
        noScore: 0,
      },
      {
        id: 'G6',
        number: 6,
        question: 'Apakah Saudara memiliki hubungan dekat dengan Tahanan/Narapidana yang memiliki riwayat pelanggaran?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'G7',
        number: 7,
        question: 'Apakah Saudara merasa perlu mendapatkan pengawasan khusus?',
        type: 'YES_NO',
        yesScore: 2,
        noScore: 0,
      },
      {
        id: 'G8',
        number: 8,
        question: 'Apakah terdapat kondisi tertentu yang dapat membuat Saudara melakukan pelanggaran kembali?',
        type: 'TEXT',
        explanationPlaceholder: 'Kondisi emosi, utang piutang, ancaman luar...',
      },
      {
        id: 'G9',
        number: 9,
        question: 'Apakah Saudara bersedia ditempatkan pada blok hunian yang ditentukan petugas berdasarkan pertimbangan keamanan?',
        type: 'YES_NO',
        yesScore: 0,
        noScore: 3,
      },
      {
        id: 'G10',
        number: 10,
        question: 'Apakah Saudara bersedia mengikuti pengawasan dan pembinaan yang lebih intensif apabila diperlukan?',
        type: 'YES_NO',
        yesScore: 0,
        noScore: 2,
      },
    ],
  },
];

// Helper Functions for Calculating Score and Generating Profiling Summary
export function calculateInterviewScore(answers: InterviewAnswers, verification?: OfficerVerification): {
  totalScore: number;
  riskLevel: RiskLevel;
  sectionScores: Record<string, number>;
  indicators: string[];
  affiliationLevel: number; // 0, 1, 2, 3
  affiliationLabel: string;
  calculatedRecommendation: string;
  calculatedPsychology: string;
  calculatedSecurityRisk: string;
  calculatedSocialBehavior: string;
  calculatedAffiliation: string;
} {
  let totalScore = 0;
  const sectionScores: Record<string, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    G: 0,
  };

  const indicators: string[] = [];

  // 1. Calculate Section Scores
  Object.keys(answers).forEach((qId) => {
    const item = answers[qId];
    if (item && typeof item.score === 'number') {
      const sec = qId.charAt(0);
      if (sectionScores[sec] !== undefined) {
        sectionScores[sec] += item.score;
      }
      totalScore += item.score;
    }
  });

  // 2. Adjust with Officer Verification Additions (Cross-validation check)
  if (verification) {
    if (verification.disciplineHistoryRegisterF) {
      totalScore += 5;
    }
    if (verification.kplpIntelligenceInfo) {
      totalScore += 5;
    }
  }

  // 3. Section Specific Indicator Determinations
  // Section A Indicators
  const isCooperative = answers['A2']?.answer === 'Ya' && answers['A9']?.answer === 'Ya';
  if (isCooperative) {
    indicators.push('Kooperatif terhadap Arahan');
  } else {
    indicators.push('Kurang Kooperatif');
  }

  const isEmotionControlled = answers['A8']?.answer === 'Ya' && answers['A5']?.answer === 'Tidak';
  if (isEmotionControlled) {
    indicators.push('Pengendalian Emosi Baik');
  } else {
    indicators.push('Pengendalian Emosi Perlu Perhatian');
  }

  if (answers['A10']?.answer === 'Tidak') {
    indicators.push('Patuh terhadap Tata Tertib');
  } else {
    indicators.push('Berpotensi Melakukan Pelanggaran Berulang');
  }

  // Section B Indicators
  if (answers['B2']?.answer === 'Ya') {
    indicators.push('Memiliki Kelompok Tertentu');
  } else {
    indicators.push('Pola Pergaulan Normal');
  }

  if (answers['B6']?.answer === 'Ya') {
    indicators.push('Memiliki Pengaruh terhadap WBP Lain');
  }

  if (answers['B7']?.answer === 'Ya' || answers['B9']?.answer === 'Ya' || answers['B10']?.answer === 'Ya') {
    indicators.push('Berpotensi Menjadi Penghubung Antar-WBP');
  }

  if (answers['B11']?.answer === 'Ya') {
    indicators.push('Memiliki Riwayat Konflik Kelompok');
  }

  // Section C Affiliation Indicator Level
  let affiliationLevel = 0;
  const affScore = sectionScores['C'] || 0;
  if (affScore >= 8 || answers['C6']?.answer === 'Ya' || answers['C10']?.answer === 'Ya') {
    affiliationLevel = 3;
  } else if (affScore >= 4 || answers['C2']?.answer === 'Ya' || answers['C3']?.answer === 'Ya') {
    affiliationLevel = 2;
  } else if (affScore > 0 || answers['C1']?.answer === 'Ya') {
    affiliationLevel = 1;
  }

  let affiliationLabel = '0 – Tidak terindikasi (Nihil hubungan berpotensi gangguan kamtib)';
  if (affiliationLevel === 1) {
    affiliationLabel = '1 – Terindikasi ringan (Hubungan sosial biasa tanpa indikasi pelanggaran)';
  } else if (affiliationLevel === 2) {
    affiliationLabel = '2 – Terindikasi sedang (Hubungan dengan pihak berpelanggaran, perlu pengawasan komunikasi)';
  } else if (affiliationLevel === 3) {
    affiliationLabel = '3 – Terindikasi kuat (Terdeteksi peran aktif dalam jaringan yang berpotensi menimbulkan gangguan keamanan)';
  }

  // Section D & F Contraband Indicators
  if (answers['F4']?.answer === 'Ya' || answers['F7']?.answer === 'Ya' || answers['F9']?.answer === 'Ya') {
    indicators.push('Potensi Keterlibatan Barang Terlarang / Kurir');
  }

  // Section E Residivism Indicators
  if (answers['E1']?.answer === 'Tidak' || answers['E2']?.answer === 'Ya') {
    indicators.push('Residivis');
    if (answers['E6']?.answer === 'Ya') {
      indicators.push('Pelanggaran Berulang Pola Sama');
    }
  } else {
    indicators.push('Bukan Residivis (Primer)');
  }

  // 4. Map Total Score to Risk Level
  // Rumus Ambang Batas:
  // 0 - 20   : RISIKO RENDAH
  // 21 - 40  : RISIKO SEDANG
  // 41 - 60  : RISIKO TINGGI
  // > 60     : RISIKO SANGAT TINGGI
  let riskLevel: RiskLevel = 'RENDAH';
  if (totalScore > 60) {
    riskLevel = 'SANGAT_TINGGI';
  } else if (totalScore >= 41) {
    riskLevel = 'TINGGI';
  } else if (totalScore >= 21) {
    riskLevel = 'SEDANG';
  } else {
    riskLevel = 'RENDAH';
  }

  // 5. Synthesize Recommendations & Descriptions
  let calculatedRecommendation = '';
  let calculatedPsychology = '';
  let calculatedSecurityRisk = '';
  let calculatedSocialBehavior = '';
  let calculatedAffiliation = '';

  if (riskLevel === 'SANGAT_TINGGI') {
    calculatedRecommendation =
      'Penempatan pada Blok Pengawasan Maksimum / Sel Khusus. Wajib pengawasan melekat 24 jam oleh Rupam & KPLP. Pembatasan akses interaksi bebas, sterilisasi barang bawaan ekstra ketat, dan pelarangan penugasan sebagai tamping strategis.';
    calculatedPsychology =
      `Sikap ${answers['A2']?.answer === 'Ya' ? 'terbuka bersyarat' : 'resisten terhadap arahan petugas'}, kontrol emosi ${isEmotionControlled ? 'cukup stabil' : 'labil/mudah terprovokasi'}. Menunjukkan indikasi kepribadian manipulatif atau keterikatan kuat dengan kelompok.`;
    calculatedSecurityRisk =
      `Skor Risiko Total: ${totalScore} (Sangat Tinggi). Terindikasi kuat berpotensi menimbulkan gangguan keamanan (pelarian/penyelundupan/gesekan kelompok). Diperlukan pengawasan intelijen aktif.`;
    calculatedSocialBehavior =
      `Pola interaksi menunjukkan pengaruh signifikan dan/atau potensi menjadi penghubung jaringan antar-WBP. Terdapat riwayat konflik atau keterkaitan dengan kelompok berisiko.`;
    calculatedAffiliation = affiliationLabel;
  } else if (riskLevel === 'TINGGI') {
    calculatedRecommendation =
      'Penempatan pada Blok Hunian dengan Pengawasan Intensif. Monitoring rutin oleh Danrupam dan Wali Pemasyarakatan. Larangan penempatan bersama kelompok afiliasinya serta pemeriksaan kamar secara berkala.';
    calculatedPsychology =
      `Karakter ${isCooperative ? 'kooperatif namun perlu pendampingan' : 'kurang kooperatif'}, respons terhadap teguran ${answers['A4']?.answer || 'bervariasi'}. Memerlukan penguatan konseling kepribadian.`;
    calculatedSecurityRisk =
      `Skor Risiko Total: ${totalScore} (Tinggi). Terdapat faktor risiko pada aspek kepatuhan aturan, riwayat residivisme, atau kerentanan terhadap titipan barang terlarang.`;
    calculatedSocialBehavior =
      `Cenderung bergaul dalam kelompok tertentu di dalam blok hunian. Perlu pemantauan agar tidak dimanfaatkan sebagai kurir/perantara.`;
    calculatedAffiliation = affiliationLabel;
  } else if (riskLevel === 'SEDANG') {
    calculatedRecommendation =
      'Penempatan pada Blok Hunian Umum Standar (Blok Alpha/Beta). Dilakukan pengawasan berkala dan evaluasi perilaku rutin setiap bulan. Diikutsertakan dalam program pembinaan kepribadian dan kemandirian.';
    calculatedPsychology =
      'Karakter relatif kooperatif dan mampu berkomunikasi dengan baik dengan petugas. Tingkat stabilitas emosi cukup baik dalam situasi normal.';
    calculatedSecurityRisk =
      `Skor Risiko Total: ${totalScore} (Sedang). Risiko keamanan dalam batas terkontrol. Tidak ditemukan niat aktif merusak tata tertib, namun tetap memerlukan pengawasan standar.`;
    calculatedSocialBehavior =
      'Pola pergaulan wajar dengan sesama tahanan/narapidana satu kamar. Menunjukkan adaptasi sosial yang baik tanpa catatan konflik berarti.';
    calculatedAffiliation = affiliationLabel;
  } else {
    calculatedRecommendation =
      'Penempatan pada Blok Hunian Reguler. Memenuhi syarat untuk diusulkan program asimilasi, kegiatan kerja kemandirian, dan penugasan tamping kebersihan/ibadah dengan pengawasan wajar.';
    calculatedPsychology =
      'Kooperatif, patuh terhadap seluruh tata tertib dan arahan petugas, memiliki pengendalian diri yang sangat baik dan penyesalan positif.';
    calculatedSecurityRisk =
      `Skor Risiko Total: ${totalScore} (Rendah). Nihil potensi gangguan kamtib. Rekam jejak disiplin kondusif.`;
    calculatedSocialBehavior =
      'Pola interaksi positif, tidak memiliki kelompok eksklusif, serta mampu bekerja sama secara harmonis dengan seluruh warga binaan.';
    calculatedAffiliation = affiliationLabel;
  }

  return {
    totalScore,
    riskLevel,
    sectionScores,
    indicators,
    affiliationLevel,
    affiliationLabel,
    calculatedRecommendation,
    calculatedPsychology,
    calculatedSecurityRisk,
    calculatedSocialBehavior,
    calculatedAffiliation,
  };
}
