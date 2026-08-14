export type SecurityLevel = 'KONDUSIF' | 'SIAGA' | 'BAHAYA';

export type BlockLocation = 
  | 'Blok Alpha (Tahanan)'
  | 'Blok Beta (Narapidana Dewasa)'
  | 'Blok Edelweis (Wanita / Khusus)'
  | 'Blok Sel Isolasi / Tutupan Sunyi'
  | 'P2U (Pintu Utama)'
  | 'Pos Menara Atas'
  | 'Poliklinik & Dapur'
  | 'Bengkel Kerja / Area Asimilasi';

export type IncidentCategory = 
  | 'PERKELAHIAN'
  | 'PENYELUNDUPAN_HP_NARKOBA'
  | 'SENJATA_TAJAM'
  | 'PERCOBAAN_PELARIAN'
  | 'PELANGGARAN_TATIB'
  | 'KERUSAKAN_SARPRAS'
  | 'KESEHATAN_MEDIS'
  | 'UNJUK_RASA'
  | 'LAINNYA';

export type UrgencyLevel = 'RENDAH' | 'SEDANG' | 'TINGGI' | 'KRITIS';

export type IncidentStatus = 
  | 'MENUNGGU_TINDAKAN'
  | 'DALAM_INVESTIGASI'
  | 'DISANKSI_REGISTER_F'
  | 'SELESAI';

export interface IncidentReport {
  id: string;
  code: string; // e.g. INC-BTG-2026-041
  timestamp: string;
  location: BlockLocation;
  category: IncidentCategory;
  urgency: UrgencyLevel;
  status: IncidentStatus;
  title: string;
  description: string;
  reporterName: string;
  reporterRole: string;
  involvedInmates: string[];
  actionTaken: string;
  evidenceUrl?: string;
  isEmergency?: boolean;
}

export interface DailyJournalEntry {
  id: string;
  dayName: string; // e.g. Sabtu
  date: string; // e.g. 04 November 2023 or 2026-07-25
  timeRange: string; // e.g. 07.30 s/d selesai
  activityDescription: string;
  documentationUrl?: string;
  documentationCaption?: string;
  officerName?: string;
  location?: string;
}

export type WBPStatus = 'TAHANAN' | 'NARAPIDANA';

export type WBPPunishmentStatus = 
  | 'BEBAS_PELANGGARAN'
  | 'DALAM_PROSES_BAP'
  | 'ISOLASI_AKTIF'
  | 'REGISTER_F_AKTIF';

export interface WBPRecord {
  id: string;
  regNumber: string; // e.g. BI.042/2025 or A.III.012/2026
  nik: string;
  name: string;
  status: WBPStatus;
  block: BlockLocation;
  roomNumber: string;
  crime: string;
  sentence: string;
  entryDate: string;
  releaseDate: string;
  punishmentStatus: WBPPunishmentStatus;
  violationCount: number;
  photoUrl?: string;
}

export type ViolationSeverity = 'RINGAN' | 'SEDANG' | 'BERAT' | (string & {});

export type PunishmentType = 
  | 'TEGURAN_LISAN'
  | 'TEGURAN_TERTULIS'
  | 'ISOLASI_TUTUPAN_SUNYI'
  | 'PENCABUTAN_HAK_REMISI_PB'
  | (string & {});

export interface ViolationRecord {
  id: string;
  bapNumber: string; // e.g. BAP/KPLP/BTG/2026/014
  wbpId: string;
  wbpName: string;
  wbpRegNumber: string;
  incidentId?: string;
  date: string;
  violationDetail: string;
  severity: ViolationSeverity;
  punishment: PunishmentType;
  isolationDays?: number;
  isolationStartDate?: string;
  isolationEndDate?: string;
  registerFStatus: 'AKTIF' | 'SELESAI' | 'PEMUTIHAN';
  investigatorName: string;
  kplpSignatureApproved: boolean;
  chronologyDocUrl?: string;
  chronologyDocName?: string;
}

export interface SecurityOfficer {
  id: string;
  nip: string;
  name: string;
  rank: string;
  position: string;
  regu: string;
  status?: 'HADIR_DINAS' | 'LEPAS_DINAS' | 'CUTI' | 'IZIN' | 'SAKIT' | string;
  phone: string;
  photoUrl?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  leaveType?: 'Cuti Tahunan' | 'Cuti Alasan Penting' | 'Cuti Sakit' | 'Cuti Melahirkan' | 'Cuti Besar' | string;
  leaveReason?: string;
  leaveDocNumber?: string;
}

export interface RupamShift {
  id: string;
  reguName: string;
  shiftType: 'PAGI (07.00 - 13.00)' | 'SIANG (13.00 - 19.00)' | 'MALAM (19.00 - 07.00)';
  danrupamName: string;
  officerCount: number;
  presentOfficers: number;
  wbpCountTahanan: number;
  wbpCountNapi: number;
  totalWBP: number;
  inventoryCheck: {
    weaponsLockers: boolean;
    keysCheck: boolean;
    htRadiosCount: number;
    handcuffsCount: number;
    cctvStatus: 'Normal (24 Kamera Active)' | '2 Kamera Off (Perbaikan)' | 'Kritikal Gangguan';
  };
  handoverNotes: string;
  verifiedByKplp: boolean;
  date: string;
}

export interface RoomDetail {
  id: string;
  name: string;
  maxCapacity: number;
  currentOccupants: number;
  description?: string;
  notes?: string; // Keterangan manual per kamar (e.g. Kamar Tamping Blok, Kamar Lansia, dll)
}

export interface BlockRoomInfo {
  id: string;
  name: string;
  roomCount: number;
  maxPerRoom?: number;
  description?: string;
  rooms?: RoomDetail[];
  totalOccupants?: number;
}

export interface InspectionDailyData {
  date: string;
  blockSearchesCount: number;
  p2uSearchesCount: number;
  forbiddenItemsFound: string;
}

export interface SecurityStats {
  totalWBP: number;
  capacityMax: number;
  tahananCount: number;
  napiCount: number;
  activeIncidentsCount: number;
  activeIsolationsCount: number;
  registerFActiveCount: number;
  rupamActive: string;
  danrupamActive: string;
  currentSecurityLevel: SecurityLevel;
  dailySearches?: InspectionDailyData;
  blocksInfo?: BlockRoomInfo[];
}

export type BehaviorCategory = 
  | 'POSITIF_PRESTASI'
  | 'CATATAN_PEMBINAAN'
  | 'PELANGGARAN_RINGAN'
  | 'PELANGGARAN_SEDANG'
  | 'PELANGGARAN_BERAT';

export interface InmateBehaviorRecord {
  id: string;
  wbpId: string;
  wbpName: string;
  wbpRegNumber: string;
  block: BlockLocation;
  roomNumber: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: BehaviorCategory;
  scorePoint: number; // e.g. +10, +5, 0, -5, -10
  behaviorTitle: string;
  description: string;
  reporterName: string;
  reporterRole?: string;
  followUpAction?: string;
  createdAt?: string;
}

export type RiskLevel = 'SANGAT_TINGGI' | 'TINGGI' | 'SEDANG' | 'RENDAH';

export type ProfilingCategory = 
  | 'PROFIL_RISIKO_KEAMANAN'
  | 'PSIKOLOGI_DAN_KARAKTER'
  | 'REKAM_JEJAK_LOKAL'
  | 'AFILIASI_DAN_JARINGAN'
  | 'MEDIS_DAN_RIWAYAT_KESEHATAN'
  | 'REKOMENDASI_PEMBINAAN';

export interface InmateProfilingRecord {
  id: string;
  wbpId: string;
  wbpName: string;
  wbpRegNumber: string;
  status: WBPStatus; // 'TAHANAN' | 'NARAPIDANA'
  block: BlockLocation;
  roomNumber: string;
  crime: string;
  sentence: string;
  assessmentDate: string; // YYYY-MM-DD
  profilingCategory: ProfilingCategory;
  riskLevel: RiskLevel;
  psychologicalProfile: string; // e.g. Kooperatif, Pendiam, Emosional, Manipulatif
  securityRiskNotes: string; // Analisis risiko keamanan & potensi gangguan
  socialBehaviorNotes: string; // Interaksi sosial antar sesama WBP
  affiliationNotes?: string; // Jaringan/Geng/Kelompok
  specialNeeds?: string; // Perhatian khusus (kesehatan, fobia, kecenderungan depresi)
  recommendation: string; // Rekomendasi penempatan & pengawasan
  assessorName: string; // Nama Petugas/Assessor/Tim Profiling
  assessorRole?: string; // Jabatan Petugas
  tags?: string[];
  totalScore?: number; // Total skor asesmen wawancara keamanan (0-100)
  indicators?: string[]; // Indikator hasil asesmen
  affiliationLevel?: number; // Level afiliasi (0-3)
  interviewAnswers?: Record<string, { answer: string; explanation?: string; score: number }>;
  verificationData?: {
    directObservation?: boolean;
    registrationRecords?: boolean;
    disciplineHistoryRegisterF?: boolean;
    kplpIntelligenceInfo?: boolean;
    bapasAssessment?: boolean;
    verificationNotes?: string;
  };
  createdAt?: string;
}

