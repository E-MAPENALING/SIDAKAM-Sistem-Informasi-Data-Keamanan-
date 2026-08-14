import React, { useState } from 'react';
import { 
  InmateProfilingRecord, 
  WBPRecord, 
  RiskLevel, 
  ProfilingCategory, 
  BlockLocation,
  WBPStatus
} from '../types';
import { 
  StructuredProfilingInterviewModal 
} from './StructuredProfilingInterviewModal';
import { 
  InterviewAnswers, 
  OfficerVerification 
} from '../data/profilingInterviewFormula';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  AlertTriangle, 
  UserCheck, 
  Calendar, 
  Trash2, 
  Edit3, 
  X, 
  FileText, 
  ShieldAlert,
  Building,
  User,
  Camera,
  ChevronRight,
  Brain,
  Activity,
  Award,
  Lock,
  Eye,
  Tag,
  Users,
  Sparkles,
  ClipboardList,
  Scale
} from 'lucide-react';
import { APP_LOGO_KEY } from './ImipasLogo';

interface InmateProfilingManagerProps {
  wbpList: WBPRecord[];
  profilingRecords: InmateProfilingRecord[];
  onAddProfilingRecord: (record: Omit<InmateProfilingRecord, 'id'>) => void;
  onUpdateProfilingRecord: (record: InmateProfilingRecord) => void;
  onDeleteProfilingRecord: (id: string) => void;
}

export function InmateProfilingManager({
  wbpList,
  profilingRecords,
  onAddProfilingRecord,
  onUpdateProfilingRecord,
  onDeleteProfilingRecord,
}: InmateProfilingManagerProps) {
  // State Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL'); // ALL | TAHANAN | NARAPIDANA
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL'); // ALL | SANGAT_TINGGI | TINGGI | SEDANG | RENDAH
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // State Modal Input
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InmateProfilingRecord | null>(null);

  // Form Fields State
  const [formWbpId, setFormWbpId] = useState('');
  const [formWbpName, setFormWbpName] = useState('');
  const [formWbpRegNumber, setFormWbpRegNumber] = useState('');
  const [formStatus, setFormStatus] = useState<WBPStatus>('TAHANAN');
  const [formBlock, setFormBlock] = useState<BlockLocation>('Blok Alpha (Tahanan)');
  const [formRoomNumber, setFormRoomNumber] = useState('A-01');
  const [formCrime, setFormCrime] = useState('');
  const [formSentence, setFormSentence] = useState('');
  const [formAssessmentDate, setFormAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [formProfilingCategory, setFormProfilingCategory] = useState<ProfilingCategory>('PROFIL_RISIKO_KEAMANAN');
  const [formRiskLevel, setFormRiskLevel] = useState<RiskLevel>('SEDANG');
  const [formPsychologicalProfile, setFormPsychologicalProfile] = useState('');
  const [formSecurityRiskNotes, setFormSecurityRiskNotes] = useState('');
  const [formSocialBehaviorNotes, setFormSocialBehaviorNotes] = useState('');
  const [formAffiliationNotes, setFormAffiliationNotes] = useState('');
  const [formSpecialNeeds, setFormSpecialNeeds] = useState('');
  const [formRecommendation, setFormRecommendation] = useState('');
  const [formAssessorName, setFormAssessorName] = useState('DODI, S.H. (Tim Profiling KPLP)');
  const [formAssessorRole, setFormAssessorRole] = useState('Tim Profiling KPLP & Wali Pemasyarakatan');
  const [formTags, setFormTags] = useState('Risiko Keamanan, Pengawasan Blok');
  
  // Structured Interview Scoring States
  const [formTotalScore, setFormTotalScore] = useState<number | undefined>(undefined);
  const [formIndicators, setFormIndicators] = useState<string[] | undefined>(undefined);
  const [formAffiliationLevel, setFormAffiliationLevel] = useState<number | undefined>(undefined);
  const [formInterviewAnswers, setFormInterviewAnswers] = useState<InterviewAnswers | undefined>(undefined);
  const [formVerificationData, setFormVerificationData] = useState<OfficerVerification | undefined>(undefined);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  // Input Mode State (Pilih dari Database atau Input Manual Baru)
  const [inputMode, setInputMode] = useState<'DATABASE' | 'MANUAL'>('DATABASE');

  // State Detail Modal
  const [detailRecord, setDetailRecord] = useState<InmateProfilingRecord | null>(null);

  // State Print Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetRecord, setPrintTargetRecord] = useState<InmateProfilingRecord | null>(null);

  // Manual Input States for Signature Section
  const [printDocNumber, setPrintDocNumber] = useState('');
  const [printSignPlaceDate, setPrintSignPlaceDate] = useState(
    `Batang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
  );
  const [printSignRole, setPrintSignRole] = useState('Kepala Kesatuan Pengamanan Lapas');
  const [printSignOffice, setPrintSignOffice] = useState('Lapas Kelas IIB Batang');
  const [printSignName, setPrintSignName] = useState('BAMBANG HERMANTO, A.Md.IP');
  const [printSignNip, setPrintSignNip] = useState('19820412 200212 1 001');

  // Photo State for Print Modal
  const [customPrintPhotoUrl, setCustomPrintPhotoUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (printTargetRecord) {
      const matched = wbpList.find(
        (w) =>
          w.id === printTargetRecord.wbpId ||
          w.regNumber === printTargetRecord.wbpRegNumber ||
          w.name.toLowerCase() === printTargetRecord.wbpName.toLowerCase()
      );
      setCustomPrintPhotoUrl(matched?.photoUrl || null);
    } else {
      setCustomPrintPhotoUrl(null);
    }
  }, [printTargetRecord, wbpList]);

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPrintPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handlePrintDoc = () => {
    try {
      const printContent = document.getElementById('printable-profiling-doc');
      if (!printContent) {
        window.print();
        return;
      }

      const printWin = window.open('', '_blank', 'width=900,height=1000');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Cetak Lembar Profiling WBP</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @page { size: A4; margin: 15mm; }
                body { font-family: 'Times New Roman', Times, serif; background: #ffffff; color: #000000; padding: 20px; }
                input { border: none !important; outline: none !important; background: transparent !important; }
              </style>
            </head>
            <body>
              <div>${printContent.innerHTML}</div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                  }, 400);
                };
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
      } else {
        window.focus();
        window.print();
      }
    } catch (err) {
      console.error('Print error:', err);
      window.focus();
      window.print();
    }
  };

  // Filtered Records
  const filteredRecords = profilingRecords.filter((rec) => {
    const matchesSearch = 
      rec.wbpName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.wbpRegNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.crime.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.psychologicalProfile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.securityRiskNotes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.recommendation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || rec.status === selectedStatus;
    const matchesRisk = selectedRisk === 'ALL' || rec.riskLevel === selectedRisk;
    const matchesCategory = selectedCategory === 'ALL' || rec.profilingCategory === selectedCategory;

    return matchesSearch && matchesStatus && matchesRisk && matchesCategory;
  });

  // Summary Metrics
  const totalProfil = profilingRecords.length;
  const totalTahananProfil = profilingRecords.filter((r) => r.status === 'TAHANAN').length;
  const totalNapiProfil = profilingRecords.filter((r) => r.status === 'NARAPIDANA').length;
  const totalRisikoTinggi = profilingRecords.filter((r) => r.riskLevel === 'SANGAT_TINGGI' || r.riskLevel === 'TINGGI').length;

  // Handlers Open Add / Edit Modal
  const handleOpenModal = (record?: InmateProfilingRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormWbpId(record.wbpId);
      setFormWbpName(record.wbpName);
      setFormWbpRegNumber(record.wbpRegNumber);
      setFormStatus(record.status);
      setFormBlock(record.block);
      setFormRoomNumber(record.roomNumber);
      setFormCrime(record.crime);
      setFormSentence(record.sentence);
      setFormAssessmentDate(record.assessmentDate);
      setFormProfilingCategory(record.profilingCategory);
      setFormRiskLevel(record.riskLevel);
      setFormPsychologicalProfile(record.psychologicalProfile);
      setFormSecurityRiskNotes(record.securityRiskNotes);
      setFormSocialBehaviorNotes(record.socialBehaviorNotes);
      setFormAffiliationNotes(record.affiliationNotes || '');
      setFormSpecialNeeds(record.specialNeeds || '');
      setFormRecommendation(record.recommendation);
      setFormAssessorName(record.assessorName);
      setFormAssessorRole(record.assessorRole || 'Tim Profiling KPLP');
      setFormTags(record.tags ? record.tags.join(', ') : '');
      setFormTotalScore(record.totalScore);
      setFormIndicators(record.indicators);
      setFormAffiliationLevel(record.affiliationLevel);
      setFormInterviewAnswers(record.interviewAnswers);
      setFormVerificationData(record.verificationData as OfficerVerification | undefined);

      const isDb = wbpList.some((w) => w.id === record.wbpId);
      setInputMode(isDb ? 'DATABASE' : 'MANUAL');
    } else {
      setEditingRecord(null);
      if (wbpList.length > 0) {
        setInputMode('DATABASE');
        const firstWbp = wbpList[0];
        setFormWbpId(firstWbp.id);
        setFormWbpName(firstWbp.name);
        setFormWbpRegNumber(firstWbp.regNumber);
        setFormStatus(firstWbp.status);
        setFormBlock(firstWbp.block);
        setFormRoomNumber(firstWbp.roomNumber);
        setFormCrime(firstWbp.crime);
        setFormSentence(firstWbp.sentence);
      } else {
        setInputMode('MANUAL');
        setFormWbpId('manual-' + Date.now());
        setFormWbpName('');
        setFormWbpRegNumber('');
        setFormStatus('TAHANAN');
        setFormBlock('Blok Alpha (Tahanan)');
        setFormRoomNumber('A-01');
        setFormCrime('Perkara Pidana');
        setFormSentence('Proses Persidangan');
      }
      setFormAssessmentDate(new Date().toISOString().split('T')[0]);
      setFormProfilingCategory('PROFIL_RISIKO_KEAMANAN');
      setFormRiskLevel('SEDANG');
      setFormPsychologicalProfile('Kooperatif, mampu berkomunikasi dengan baik, tingkat stres terkontrol.');
      setFormSecurityRiskNotes('Tidak memiliki rekam jejak gangguan keamanan. Perlu pengawasan standar di dalam kamar.');
      setFormSocialBehaviorNotes('Berinteraksi positif dengan sesama penghuni kamar.');
      setFormAffiliationNotes('Nihil afiliasi jaringan berbahaya.');
      setFormSpecialNeeds('Kondisi kesehatan stabil.');
      setFormRecommendation('Ditempatkan pada blok hunian sesuai status persidangan. Pengawasan rutin petugas.');
      setFormAssessorName('DODI, S.H. (Tim Profiling KPLP)');
      setFormAssessorRole('Tim Profiling KPLP & Wali Pemasyarakatan');
      setFormTags('Pengawasan Standar, Kooperatif');
      setFormTotalScore(undefined);
      setFormIndicators(undefined);
      setFormAffiliationLevel(undefined);
      setFormInterviewAnswers(undefined);
      setFormVerificationData(undefined);
    }
    setIsModalOpen(true);
  };

  // Handler Apply Results from Structured Interview Formula
  const handleApplyInterviewResults = (results: {
    totalScore: number;
    riskLevel: RiskLevel;
    psychologicalProfile: string;
    securityRiskNotes: string;
    socialBehaviorNotes: string;
    affiliationNotes: string;
    recommendation: string;
    indicators: string[];
    affiliationLevel: number;
    answers: InterviewAnswers;
    verification: OfficerVerification;
  }) => {
    setFormTotalScore(results.totalScore);
    setFormRiskLevel(results.riskLevel);
    setFormPsychologicalProfile(results.psychologicalProfile);
    setFormSecurityRiskNotes(results.securityRiskNotes);
    setFormSocialBehaviorNotes(results.socialBehaviorNotes);
    setFormAffiliationNotes(results.affiliationNotes);
    setFormRecommendation(results.recommendation);
    setFormIndicators(results.indicators);
    setFormAffiliationLevel(results.affiliationLevel);
    setFormInterviewAnswers(results.answers);
    setFormVerificationData(results.verification);

    // Auto-enrich tags
    const newTags = Array.from(
      new Set([
        ...formTags.split(',').map((t) => t.trim()).filter((t) => t.length > 0),
        `Skor: ${results.totalScore}`,
        results.riskLevel.replace(/_/g, ' '),
        ...(results.indicators || []).slice(0, 2),
      ])
    ).join(', ');
    setFormTags(newTags);
  };

  // Handler Select WBP Change in Form
  const handleWbpSelectionChange = (id: string) => {
    setFormWbpId(id);
    const target = wbpList.find((w) => w.id === id);
    if (target) {
      setFormWbpName(target.name);
      setFormWbpRegNumber(target.regNumber);
      setFormStatus(target.status);
      setFormBlock(target.block);
      setFormRoomNumber(target.roomNumber);
      setFormCrime(target.crime);
      setFormSentence(target.sentence);
    }
  };

  // Submit Save Record
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formWbpName || !formWbpRegNumber) {
      alert('Mohon lengkapi data nama dan nomor registrasi Tahanan/WBP.');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingRecord) {
      const updated: InmateProfilingRecord = {
        ...editingRecord,
        wbpId: formWbpId,
        wbpName: formWbpName,
        wbpRegNumber: formWbpRegNumber,
        status: formStatus,
        block: formBlock,
        roomNumber: formRoomNumber,
        crime: formCrime,
        sentence: formSentence,
        assessmentDate: formAssessmentDate,
        profilingCategory: formProfilingCategory,
        riskLevel: formRiskLevel,
        psychologicalProfile: formPsychologicalProfile,
        securityRiskNotes: formSecurityRiskNotes,
        socialBehaviorNotes: formSocialBehaviorNotes,
        affiliationNotes: formAffiliationNotes,
        specialNeeds: formSpecialNeeds,
        recommendation: formRecommendation,
        assessorName: formAssessorName,
        assessorRole: formAssessorRole,
        tags: tagsArray,
        totalScore: formTotalScore,
        indicators: formIndicators,
        affiliationLevel: formAffiliationLevel,
        interviewAnswers: formInterviewAnswers,
        verificationData: formVerificationData,
      };
      onUpdateProfilingRecord(updated);
    } else {
      const newRecord: Omit<InmateProfilingRecord, 'id'> = {
        wbpId: formWbpId,
        wbpName: formWbpName,
        wbpRegNumber: formWbpRegNumber,
        status: formStatus,
        block: formBlock,
        roomNumber: formRoomNumber,
        crime: formCrime,
        sentence: formSentence,
        assessmentDate: formAssessmentDate,
        profilingCategory: formProfilingCategory,
        riskLevel: formRiskLevel,
        psychologicalProfile: formPsychologicalProfile,
        securityRiskNotes: formSecurityRiskNotes,
        socialBehaviorNotes: formSocialBehaviorNotes,
        affiliationNotes: formAffiliationNotes,
        specialNeeds: formSpecialNeeds,
        recommendation: formRecommendation,
        assessorName: formAssessorName,
        assessorRole: formAssessorRole,
        tags: tagsArray,
        totalScore: formTotalScore,
        indicators: formIndicators,
        affiliationLevel: formAffiliationLevel,
        interviewAnswers: formInterviewAnswers,
        verificationData: formVerificationData,
        createdAt: new Date().toISOString(),
      };
      onAddProfilingRecord(newRecord);
    }

    setIsModalOpen(false);
  };

  // Helper Badge Color for Risk Level
  const getRiskLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case 'SANGAT_TINGGI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white font-extrabold text-[11px] rounded-lg shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SANGAT TINGGI</span>
          </span>
        );
      case 'TINGGI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white font-bold text-[11px] rounded-lg shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>RISIKO TINGGI</span>
          </span>
        );
      case 'SEDANG':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white font-bold text-[11px] rounded-lg shadow-xs">
            <Activity className="w-3.5 h-3.5" />
            <span>RISIKO SEDANG</span>
          </span>
        );
      case 'RENDAH':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-lg shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RISIKO RENDAH</span>
          </span>
        );
    }
  };

  // Helper Card Header Style based on Risk
  const getRiskCardHeaderBg = (level: RiskLevel) => {
    switch (level) {
      case 'SANGAT_TINGGI':
        return 'bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white border-b border-red-700';
      case 'TINGGI':
        return 'bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 text-white border-b border-orange-700';
      case 'SEDANG':
        return 'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white border-b border-slate-700';
      case 'RENDAH':
      default:
        return 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-800';
    }
  };

  const getCategoryLabel = (cat: ProfilingCategory) => {
    switch (cat) {
      case 'PROFIL_RISIKO_KEAMANAN':
        return 'Analisis Risiko Keamanan & Pelarian';
      case 'PSIKOLOGI_DAN_KARAKTER':
        return 'Profil Psikologis & Karakter';
      case 'REKAM_JEJAK_LOKAL':
        return 'Catatan Pengamatan Wali & KPLP';
      case 'AFILIASI_DAN_JARINGAN':
        return 'Afiliasi Kelompok / Jaringan';
      case 'MEDIS_DAN_RIWAYAT_KESEHATAN':
        return 'Catatan Medis & Kesehatan Mental';
      case 'REKOMENDASI_PEMBINAAN':
        return 'Rekomendasi Penempatan & Pembinaan';
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/30 border border-blue-400/30 rounded-xl backdrop-blur-md">
                <Brain className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-widest text-blue-300 uppercase">
                  Sistem Informasi Intelijen & Profiling KPLP
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Catatan Profiling Tahanan / Narapidana
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Modul asesmen risiko keamanan, profil psikologis, analisis potensi gangguan kamtib, serta rekam jejak perilaku tahanan dan narapidana di Lapas Kelas IIB Batang.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => {
                handleOpenModal();
                setIsInterviewModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-orange-950/40 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>📋 Asesmen Wawancara Keamanan (Rumus KPLP)</span>
            </button>
            <button
              onClick={() => {
                setPrintTargetRecord(null);
                setIsPrintModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-300" />
              <span>Cetak Rekap Profiling</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catatan Profiling Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Ter-profiling</p>
            <p className="text-xl font-black text-slate-900">{totalProfil} <span className="text-xs font-normal text-slate-500">WBP</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Tahanan vs Narapidana</p>
            <p className="text-sm font-black text-slate-900">
              <span className="text-indigo-600">{totalTahananProfil}</span> Tahanan / <span className="text-slate-700">{totalNapiProfil}</span> Napi
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Risiko Tinggi / Sangat Tinggi</p>
            <p className="text-xl font-black text-red-600">{totalRisikoTinggi} <span className="text-xs font-normal text-slate-500">Orang</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status Asesmen</p>
            <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block mt-0.5">
              Aktif Ter-update
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama Tahanan/WBP, Reg, Perkara, Catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <span className="text-[11px] font-bold text-slate-500 px-2">Status:</span>
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedStatus('TAHANAN')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedStatus === 'TAHANAN' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tahanan
              </button>
              <button
                onClick={() => setSelectedStatus('NARAPIDANA')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedStatus === 'NARAPIDANA' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Narapidana
              </button>
            </div>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
            >
              <option value="ALL">Semua Level Risiko</option>
              <option value="SANGAT_TINGGI">🔴 Sangat Tinggi</option>
              <option value="TINGGI">🟠 Risiko Tinggi</option>
              <option value="SEDANG">🟡 Risiko Sedang</option>
              <option value="RENDAH">🟢 Risiko Rendah</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
            >
              <option value="ALL">Semua Kategori Profiling</option>
              <option value="PROFIL_RISIKO_KEAMANAN">Risiko Keamanan & Pelarian</option>
              <option value="PSIKOLOGI_DAN_KARAKTER">Profil Psikologis & Karakter</option>
              <option value="REKAM_JEJAK_LOKAL">Catatan Pengamatan Wali & KPLP</option>
              <option value="AFILIASI_DAN_JARINGAN">Afiliasi & Jaringan</option>
              <option value="MEDIS_DAN_RIWAYAT_KESEHATAN">Medis & Kesehatan Mental</option>
              <option value="REKOMENDASI_PEMBINAAN">Rekomendasi Penempatan</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 ml-auto">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  viewMode === 'GRID' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kartu
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  viewMode === 'TABLE' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Matriks Tabel
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Data Profiling Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ada catatan profiling Tahanan / WBP yang cocok dengan kriteria pencarian atau filter yang dipilih.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            + Buat Catatan Profiling Baru
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col group"
            >
              {/* Card Header */}
              <div className={`p-4 ${getRiskCardHeaderBg(rec.riskLevel)}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      rec.status === 'TAHANAN' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-200'
                    }`}>
                      {rec.status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-300 font-bold">{rec.wbpRegNumber}</span>
                  </div>
                  {getRiskLevelBadge(rec.riskLevel)}
                </div>

                <h3 className="font-bold text-white text-base leading-snug line-clamp-1">{rec.wbpName}</h3>
                <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-blue-300" />
                    {rec.block} ({rec.roomNumber})
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Perkara / Kejahatan:</span>
                  <p className="font-semibold text-slate-800 line-clamp-1">{rec.crime}</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                    <Brain className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Profil Kepribadian & Karakter:</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">
                    "{rec.psychologicalProfile}"
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Catatan Risiko Keamanan:
                  </span>
                  <p className="text-slate-700 line-clamp-2 leading-relaxed text-[11px] font-medium">
                    {rec.securityRiskNotes}
                  </p>
                </div>

                <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide block">Rekomendasi KPLP:</span>
                  <p className="text-blue-950 font-semibold text-[11px] line-clamp-2">
                    {rec.recommendation}
                  </p>
                </div>

                {/* Tags */}
                {rec.tags && rec.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {rec.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md border border-slate-200">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="truncate pr-2">
                  <span className="font-medium text-slate-700 block truncate">{rec.assessorName}</span>
                  <span className="text-[10px] text-slate-400">{rec.assessmentDate}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setDetailRecord(rec)}
                    className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    title="Lihat Detail Profiling"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setPrintTargetRecord(rec);
                      setIsPrintModalOpen(true);
                    }}
                    className="p-1.5 bg-white hover:bg-blue-100 text-blue-700 rounded-lg border border-slate-200 transition-colors"
                    title="Cetak Lembar Profiling WBP Ini"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(rec)}
                    className="p-1.5 bg-white hover:bg-amber-100 text-amber-700 rounded-lg border border-slate-200 transition-colors"
                    title="Edit Catatan"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(rec.id)}
                    className="p-1.5 bg-white hover:bg-red-100 text-red-600 rounded-lg border border-slate-200 transition-colors"
                    title="Hapus Profiling"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="p-3.5">No. Reg & Nama Tahanan/WBP</th>
                  <th className="p-3.5">Status & Blok</th>
                  <th className="p-3.5">Perkara / Pidana</th>
                  <th className="p-3.5">Tingkat Risiko</th>
                  <th className="p-3.5">Profil Kepribadian</th>
                  <th className="p-3.5">Rekomendasi Penempatan</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{rec.wbpName}</div>
                      <div className="text-[11px] font-mono font-bold text-slate-500">{rec.wbpRegNumber}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 ${
                        rec.status === 'TAHANAN' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {rec.status}
                      </span>
                      <div className="text-[11px] text-slate-600 font-medium">{rec.block} ({rec.roomNumber})</div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{rec.crime}</div>
                      <div className="text-[11px] text-slate-500 truncate">{rec.sentence}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getRiskLevelBadge(rec.riskLevel)}
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="line-clamp-2 text-slate-600">{rec.psychologicalProfile}</p>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="line-clamp-2 font-semibold text-blue-900">{rec.recommendation}</p>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailRecord(rec)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setPrintTargetRecord(rec);
                            setIsPrintModalOpen(true);
                          }}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                          title="Cetak"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(rec)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(rec.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Catatan Profiling */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-400/30">
                  <Brain className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingRecord ? 'Edit Catatan Profiling Tahanan / Narapidana' : 'Tambah Catatan Profiling Tahanan / Narapidana'}
                  </h3>
                  <p className="text-[11px] text-blue-200">Asesmen Risiko Keamanan, Karakter & Intelijen KPLP</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              {/* Interactive Launch Interview Formula Banner */}
              <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl border border-blue-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded uppercase">
                      Rumus Terstruktur KPLP
                    </span>
                    <span className="text-[11px] font-bold text-blue-300">
                      Bagian A s/d G (78 Pertanyaan & Verifikasi Multi-Sumber)
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-amber-400" />
                    <span>Formulir Wawancara Asesmen Keamanan WBP</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Lakukan wawancara terstruktur untuk otomatis menghitung skor risiko (0-100), level afiliasi (0-3), dan rekomendasi penempatan.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {formTotalScore !== undefined && (
                    <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-right">
                      <span className="text-[10px] text-slate-400 block font-bold">Skor Terhitung:</span>
                      <span className="text-sm font-black text-amber-400 font-mono">{formTotalScore} / 100</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsInterviewModalOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{formTotalScore !== undefined ? 'Ulangi / Edit Wawancara' : 'Mulai Wawancara Keamanan'}</span>
                  </button>
                </div>
              </div>

              {/* Select WBP / Manual Input */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-xs">
                    Sumber & Data Identitas Tahanan / Narapidana:
                  </span>
                  <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode('DATABASE');
                        if (wbpList.length > 0) {
                          const first = wbpList[0];
                          handleWbpSelectionChange(first.id);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        inputMode === 'DATABASE' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Pilih Database
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode('MANUAL');
                        setFormWbpId('manual-' + Date.now());
                      }}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        inputMode === 'MANUAL' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      ✍️ Input Manual
                    </button>
                  </div>
                </div>

                {inputMode === 'DATABASE' && wbpList.length > 0 && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                      Pilih dari Database WBP / SDP:
                    </label>
                    <select
                      value={formWbpId}
                      onChange={(e) => handleWbpSelectionChange(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    >
                      {wbpList.map((w) => (
                        <option key={w.id} value={w.id}>
                          [{w.status}] {w.name} ({w.regNumber}) - {w.block}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Editable Fields for Name & Biodata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                      Nama Lengkap Tahanan / Narapidana <span className="text-red-500">*</span>:
                    </label>
                    <input
                      type="text"
                      value={formWbpName}
                      onChange={(e) => setFormWbpName(e.target.value)}
                      placeholder="Contoh: AHMAD SUBAGJO BIN SULAEMAN"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                      Nomor Registrasi <span className="text-red-500">*</span>:
                    </label>
                    <input
                      type="text"
                      value={formWbpRegNumber}
                      onChange={(e) => setFormWbpRegNumber(e.target.value)}
                      placeholder="Contoh: A.III.102/2026 atau B.I.45/2025"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status Penahanan:</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'TAHANAN' | 'NARAPIDANA')}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-indigo-800"
                    >
                      <option value="TAHANAN">TAHANAN</option>
                      <option value="NARAPIDANA">NARAPIDANA</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Blok Hunian:</label>
                    <input
                      type="text"
                      value={formBlock}
                      onChange={(e) => setFormBlock(e.target.value)}
                      placeholder="Blok Alpha (Tahanan)"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nomor Kamar:</label>
                    <input
                      type="text"
                      value={formRoomNumber}
                      onChange={(e) => setFormRoomNumber(e.target.value)}
                      placeholder="A-01"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Perkara / Pasal KUHP:</label>
                    <input
                      type="text"
                      value={formCrime}
                      onChange={(e) => setFormCrime(e.target.value)}
                      placeholder="Pasal 363 KUHP"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Categorization & Risk Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kategori Utama Profiling:
                  </label>
                  <select
                    value={formProfilingCategory}
                    onChange={(e) => setFormProfilingCategory(e.target.value as ProfilingCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PROFIL_RISIKO_KEAMANAN">Risiko Keamanan & Pelarian</option>
                    <option value="PSIKOLOGI_DAN_KARAKTER">Profil Psikologis & Karakter</option>
                    <option value="REKAM_JEJAK_LOKAL">Catatan Pengamatan Wali & KPLP</option>
                    <option value="AFILIASI_DAN_JARINGAN">Afiliasi & Jaringan</option>
                    <option value="MEDIS_DAN_RIWAYAT_KESEHATAN">Medis & Kesehatan Mental</option>
                    <option value="REKOMENDASI_PEMBINAAN">Rekomendasi Penempatan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tingkat Risiko Keamanan:
                  </label>
                  <select
                    value={formRiskLevel}
                    onChange={(e) => setFormRiskLevel(e.target.value as RiskLevel)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SANGAT_TINGGI">🔴 SANGAT TINGGI (Penanganan Khusus)</option>
                    <option value="TINGGI">🟠 TINGGI (Pengawasan Ketat)</option>
                    <option value="SEDANG">🟡 SEDANG (Pengawasan Standar)</option>
                    <option value="RENDAH">🟢 RENDAH (Kooperatif / Asimilasi)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tanggal Asesmen / Profiling:
                  </label>
                  <input
                    type="date"
                    value={formAssessmentDate}
                    onChange={(e) => setFormAssessmentDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Psychological Profile */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  1. Profil Kepribadian & Psikologis:
                </label>
                <textarea
                  rows={2}
                  value={formPsychologicalProfile}
                  onChange={(e) => setFormPsychologicalProfile(e.target.value)}
                  placeholder="Contoh: Kooperatif, mampu berkomunikasi baik, mudah terpancing emosi saat tertekan, temperamental..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Security Risk Notes */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  2. Analisis Risiko Keamanan & Potensi Gangguan Kamtib:
                </label>
                <textarea
                  rows={2}
                  value={formSecurityRiskNotes}
                  onChange={(e) => setFormSecurityRiskNotes(e.target.value)}
                  placeholder="Catatan analisis potensi pelarian, penyelundupan HP/Narkoba, atau gesekan antar penghuni kamar..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Social Behavior & Affiliation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    3. Interaksi Sosial & Sikap Sesama Tahanan/WBP:
                  </label>
                  <textarea
                    rows={2}
                    value={formSocialBehaviorNotes}
                    onChange={(e) => setFormSocialBehaviorNotes(e.target.value)}
                    placeholder="Sikap interaksi sosial di kamar dan blok hunian..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    4. Afiliasi Kelompok / Jaringan Outside:
                  </label>
                  <textarea
                    rows={2}
                    value={formAffiliationNotes}
                    onChange={(e) => setFormAffiliationNotes(e.target.value)}
                    placeholder="Informasi geng, kelompok, atau jaringan kejahatan luar..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Special Needs & Recommendation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    5. Kebutuhan Khusus / Perhatian Medis:
                  </label>
                  <input
                    type="text"
                    value={formSpecialNeeds}
                    onChange={(e) => setFormSpecialNeeds(e.target.value)}
                    placeholder="Contoh: Riwayat penyakit jantung, obat rutin, kecenderungan depresi..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    6. Tags / Kata Kunci Profiling:
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Pisahkan dengan koma: Tahanan Baru, Risiko Tinggi, Calon Tamping"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1">
                <label className="font-bold text-blue-900 block text-xs">
                  7. Rekomendasi Penempatan & Pola Pengawasan KPLP:
                </label>
                <textarea
                  rows={2}
                  value={formRecommendation}
                  onChange={(e) => setFormRecommendation(e.target.value)}
                  placeholder="Rekomendasi penempatan kamar, pemberian tugas tamping, atau pengawasan khusus..."
                  className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-semibold text-blue-950 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Assessor Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Petugas / Assessor:</label>
                  <input
                    type="text"
                    value={formAssessorName}
                    onChange={(e) => setFormAssessorName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan Petugas:</label>
                  <input
                    type="text"
                    value={formAssessorRole}
                    onChange={(e) => setFormAssessorRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95"
                >
                  {editingRecord ? 'Simpan Perubahan' : 'Simpan Catatan Profiling'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailRecord && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className={`p-5 ${getRiskCardHeaderBg(detailRecord.riskLevel)} flex items-center justify-between`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-white/20 text-white font-black text-[10px] rounded uppercase">
                    {detailRecord.status}
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-200">{detailRecord.wbpRegNumber}</span>
                </div>
                <h3 className="text-lg font-black text-white">{detailRecord.wbpName}</h3>
                <p className="text-xs text-slate-300">{detailRecord.block} ({detailRecord.roomNumber})</p>
              </div>
              <button
                onClick={() => setDetailRecord(null)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Perkara / Kejahatan:</span>
                  <span className="font-bold text-slate-900">{detailRecord.crime}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold text-right">Tingkat Risiko:</span>
                  {getRiskLevelBadge(detailRecord.riskLevel)}
                </div>
              </div>

              <div className="space-y-3">
                {/* Scoring Banner if from Structured Formula */}
                {detailRecord.totalScore !== undefined && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500 text-white rounded-lg">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 block">Hasil Wawancara Keamanan (Rumus KPLP)</span>
                        <span className="font-extrabold text-amber-950 text-xs">
                          Skor Total: <strong className="font-mono text-sm">{detailRecord.totalScore}</strong> / 100 ({detailRecord.riskLevel.replace(/_/g, ' ')})
                        </span>
                      </div>
                    </div>
                    {detailRecord.indicators && detailRecord.indicators.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                        {detailRecord.indicators.slice(0, 2).map((ind, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-amber-200/80 text-amber-900 rounded text-[9px] font-bold">
                            {ind}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-xs">
                    <Brain className="w-4 h-4 text-blue-600" />
                    Profil Kepribadian & Psikologis
                  </h4>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-medium">
                    {detailRecord.psychologicalProfile}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-red-700 flex items-center gap-1.5 mb-1 text-xs">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    Analisis Risiko Keamanan & Intelijen
                  </h4>
                  <p className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-red-950 leading-relaxed font-medium">
                    {detailRecord.securityRiskNotes}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1">Interaksi Sosial:</h5>
                    <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                      {detailRecord.socialBehaviorNotes}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1">Afiliasi Jaringan:</h5>
                    <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                      {detailRecord.affiliationNotes || 'Nihil'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-blue-900 flex items-center gap-1.5 mb-1 text-xs">
                    <Award className="w-4 h-4 text-blue-600" />
                    Rekomendasi Penempatan & Pengawasan KPLP
                  </h4>
                  <p className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-950 font-semibold leading-relaxed">
                    {detailRecord.recommendation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Assessor: <strong className="text-slate-800">{detailRecord.assessorName}</strong> ({detailRecord.assessorRole})</span>
                  <span>Tanggal: <strong className="text-slate-800">{detailRecord.assessmentDate}</strong></span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setDetailRecord(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setPrintTargetRecord(detailRecord);
                  setDetailRecord(null);
                  setIsPrintModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-sm flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Profiling</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Profiling Resmi */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 print:static print:inset-auto print:bg-white print:p-0 print:overflow-visible">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 overflow-hidden animate-in zoom-in-95 duration-150 print:shadow-none print:border-none print:my-0 print:max-w-none print:w-full">
            {/* Control Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Pratinjau Cetak Dokumen Profiling Tahanan / WBP</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDoc}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Sekarang / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Printable View */}
            <div id="printable-profiling-doc" className="p-8 bg-white text-slate-900 space-y-6 font-serif leading-relaxed max-h-[80vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible">
              
              {/* Kop Surat */}
              <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={localStorage.getItem(APP_LOGO_KEY) || 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Ministry_of_Law_and_Human_Rights_Indonesia.svg/300px-Coat_of_arms_of_Ministry_of_Law_and_Human_Rights_Indonesia.svg.png'}
                    alt="Logo Kemenkumham"
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN RI
                    </h4>
                    <h5 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">
                      KANTOR WILAYAH JAWA TENGAH
                    </h5>
                    <h3 className="font-black text-base uppercase tracking-tight text-slate-900">
                      LEMBAGA PEMASYARAKATAN KELAS IIB BATANG
                    </h3>
                    <p className="text-[11px] text-slate-800 font-sans font-semibold">
                      Jl. Raya Batang-Bandar km 4,1, Batang 51216, Telepon: (0285) 4494300
                    </p>
                  </div>
                </div>
              </div>

              {/* Title Dokumen */}
              <div className="text-center space-y-1">
                <h2 className="font-black text-base uppercase tracking-wider border-b border-slate-900 inline-block px-4 pb-0.5">
                  LEMBAR ASESMEN PROFILING RISIKO TAHANAN / NARAPIDANA
                </h2>
                <p className="text-xs font-mono font-bold text-slate-700 flex items-center justify-center gap-1">
                  <span>Nomor:</span>
                  <input
                    type="text"
                    value={printDocNumber}
                    onChange={(e) => setPrintDocNumber(e.target.value)}
                    placeholder=".................................................."
                    className="font-mono font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-blue-500 focus:outline-none text-center min-w-[240px] print:border-none print:placeholder-transparent"
                  />
                </p>
              </div>

              {printTargetRecord ? (
                /* Cetak Profil Individual */
                <div className="space-y-4 text-xs font-sans">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 flex items-start gap-4">
                    {/* Pasfoto 3x4 Tahanan / Narapidana */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div className="relative group w-28 h-36 bg-slate-200 border-2 border-slate-400 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                        {customPrintPhotoUrl ? (
                          <img
                            src={customPrintPhotoUrl}
                            alt={printTargetRecord.wbpName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400">
                            <User className="w-10 h-10 mb-1" />
                            <span className="text-[9px] font-bold uppercase leading-tight">Pasfoto 3x4 WBP</span>
                          </div>
                        )}

                        {/* Hover Overlay Unggah/Ganti Foto (Disembunyikan saat dicetak) */}
                        <label className="absolute inset-0 bg-slate-900/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer print:hidden text-[10px] font-bold p-1 text-center">
                          <Camera className="w-5 h-5 mb-1 text-blue-400" />
                          <span>Ganti / Unggah Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCustomPhotoUpload}
                          />
                        </label>
                      </div>

                      <div className="text-[9px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1 print:hidden">
                        <span>Foto 3x4</span>
                        {customPrintPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setCustomPrintPhotoUrl(null)}
                            className="text-red-500 hover:text-red-700 underline text-[9px] ml-1"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Informasi Biodata WBP */}
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Nama Lengkap:</p>
                        <p className="font-bold text-sm text-slate-900">{printTargetRecord.wbpName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Nomor Registrasi:</p>
                        <p className="font-mono font-bold text-sm text-slate-900">{printTargetRecord.wbpRegNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Status / Perkara:</p>
                        <p className="font-bold text-slate-800">[{printTargetRecord.status}] {printTargetRecord.crime}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Lokasi Blok / Kamar:</p>
                        <p className="font-bold text-slate-800">{printTargetRecord.block} ({printTargetRecord.roomNumber})</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-200 bg-slate-100">
                          <td className="p-2.5 font-bold w-48 text-slate-800">Tingkat Risiko Keamanan</td>
                          <td className="p-2.5 font-bold text-slate-900 flex items-center justify-between">
                            <span>{printTargetRecord.riskLevel.replace(/_/g, ' ')}</span>
                            {printTargetRecord.totalScore !== undefined && (
                              <span className="font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded text-slate-900">
                                Skor Asesmen: <strong>{printTargetRecord.totalScore} / 100</strong>
                              </span>
                            )}
                          </td>
                        </tr>
                        {printTargetRecord.indicators && printTargetRecord.indicators.length > 0 && (
                          <tr className="border-b border-slate-200 bg-amber-50/50">
                            <td className="p-2.5 font-bold text-amber-900">Indikator Terverifikasi</td>
                            <td className="p-2.5 text-amber-950 font-medium">
                              {printTargetRecord.indicators.join(' • ')}
                            </td>
                          </tr>
                        )}
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 font-bold text-slate-800">Profil Kepribadian & Karakter</td>
                          <td className="p-2.5 text-slate-800">{printTargetRecord.psychologicalProfile}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 font-bold text-slate-800">Analisis Keamanan & Potensi Gangguan</td>
                          <td className="p-2.5 text-slate-800 font-medium">{printTargetRecord.securityRiskNotes}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 font-bold text-slate-800">Interaksi Sosial & Sikap</td>
                          <td className="p-2.5 text-slate-800">{printTargetRecord.socialBehaviorNotes}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 font-bold text-slate-800">Afiliasi Jaringan / Kelompok</td>
                          <td className="p-2.5 text-slate-800">{printTargetRecord.affiliationNotes || 'Nihil'}</td>
                        </tr>
                        <tr className="bg-blue-50/50">
                          <td className="p-2.5 font-bold text-blue-950">Rekomendasi Penempatan KPLP</td>
                          <td className="p-2.5 font-bold text-blue-950">{printTargetRecord.recommendation}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Cetak Rekapitulasi Tabel Matriks */
                <div className="space-y-3 text-xs font-sans">
                  <p className="text-xs text-slate-700 font-medium">
                    Berikut adalah Laporan Rekapitulasi Matriks Asesmen Profiling Risiko & Perilaku Tahanan / Narapidana di Lapas Kelas IIB Batang:
                  </p>

                  <table className="w-full border-collapse border border-slate-900 text-[10px]">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 font-bold uppercase tracking-wide border-b border-slate-900">
                        <th className="p-2 border border-slate-900 text-center w-8">No</th>
                        <th className="p-2 border border-slate-900 text-left w-36">Nama & No. Reg</th>
                        <th className="p-2 border border-slate-900 text-left w-28">Status & Lokasi</th>
                        <th className="p-2 border border-slate-900 text-left w-24">Risiko & Perkara</th>
                        <th className="p-2 border border-slate-900 text-left">Catatan Profiling & Risiko Keamanan</th>
                        <th className="p-2 border border-slate-900 text-left w-40">Rekomendasi Penempatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-400">
                      {filteredRecords.map((r, idx) => (
                        <tr key={r.id} className="align-top">
                          <td className="p-2 border border-slate-900 text-center font-bold">{idx + 1}</td>
                          <td className="p-2 border border-slate-900">
                            <strong className="block text-slate-900 text-[11px]">{r.wbpName}</strong>
                            <span className="font-mono text-[9.5px] text-slate-700 block">{r.wbpRegNumber}</span>
                          </td>
                          <td className="p-2 border border-slate-900 font-semibold">
                            <div>[{r.status}]</div>
                            <div className="text-slate-700">{r.block} ({r.roomNumber})</div>
                          </td>
                          <td className="p-2 border border-slate-900">
                            <div className="font-bold text-slate-900">{r.riskLevel.replace(/_/g, ' ')}</div>
                            <div className="text-[9.5px] text-slate-600 truncate max-w-[100px]">{r.crime}</div>
                          </td>
                          <td className="p-2 border border-slate-900 space-y-1">
                            <div>
                              <strong className="text-slate-900">Profil Kepribadian:</strong> {r.psychologicalProfile}
                            </div>
                            <div>
                              <strong className="text-slate-900">Risiko Keamanan:</strong> {r.securityRiskNotes}
                            </div>
                            {r.socialBehaviorNotes && (
                              <div>
                                <strong className="text-slate-900">Perilaku Sosial:</strong> {r.socialBehaviorNotes}
                              </div>
                            )}
                          </td>
                          <td className="p-2 border border-slate-900 font-semibold text-slate-900">
                            {r.recommendation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tanda Tangan (Dapat Diinput / Diedit Manual) */}
              <div className="pt-8 flex justify-end font-sans text-xs">
                <div className="text-center flex flex-col items-center space-y-1 min-w-[280px]">
                  <input
                    type="text"
                    value={printSignPlaceDate}
                    onChange={(e) => setPrintSignPlaceDate(e.target.value)}
                    placeholder="Batang, DD MMMM YYYY"
                    className="text-center font-medium text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-none w-full print:border-none print:placeholder-transparent"
                  />
                  <input
                    type="text"
                    value={printSignRole}
                    onChange={(e) => setPrintSignRole(e.target.value)}
                    placeholder="Jabatan..."
                    className="text-center font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-none w-full print:border-none print:placeholder-transparent"
                  />
                  <input
                    type="text"
                    value={printSignOffice}
                    onChange={(e) => setPrintSignOffice(e.target.value)}
                    placeholder="Instansi / Unit..."
                    className="text-center text-[11px] text-slate-600 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-none w-full print:border-none print:placeholder-transparent"
                  />

                  <div className="h-16"></div>

                  <input
                    type="text"
                    value={printSignName}
                    onChange={(e) => setPrintSignName(e.target.value)}
                    placeholder="Nama Penandatangan..."
                    className="text-center font-black text-slate-900 underline text-sm uppercase tracking-wide bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-none w-full print:border-none print:placeholder-transparent"
                  />
                  <div className="flex items-center justify-center gap-1 w-full text-[11px] text-slate-600">
                    <span className="font-semibold">NIP.</span>
                    <input
                      type="text"
                      value={printSignNip}
                      onChange={(e) => setPrintSignNip(e.target.value)}
                      placeholder="19xxxxxxxxxxxxxx"
                      className="text-center font-mono text-[11px] text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-none min-w-[160px] print:border-none print:placeholder-transparent"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 shadow-2xl max-w-sm w-full space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">Hapus Catatan Profiling?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan profiling Tahanan/WBP ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteProfilingRecord(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Structured Profiling Interview Modal (Rumus Asesmen Keamanan KPLP) */}
      <StructuredProfilingInterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        inmateName={formWbpName || 'Tahanan / WBP'}
        regNumber={formWbpRegNumber || '-'}
        status={formStatus}
        block={formBlock}
        room={formRoomNumber}
        crime={formCrime}
        initialAnswers={formInterviewAnswers}
        initialVerification={formVerificationData}
        onApplyResults={(results) => {
          handleApplyInterviewResults(results);
          setIsInterviewModalOpen(false);
        }}
      />

    </div>
  );
}
