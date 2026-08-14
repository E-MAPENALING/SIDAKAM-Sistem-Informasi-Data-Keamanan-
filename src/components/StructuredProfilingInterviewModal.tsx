import React, { useState, useMemo } from 'react';
import { 
  INTERVIEW_SECTIONS, 
  InterviewAnswers, 
  OfficerVerification, 
  calculateInterviewScore 
} from '../data/profilingInterviewFormula';
import { WBPRecord, RiskLevel } from '../types';
import { 
  Brain, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckSquare, 
  Square, 
  HelpCircle,
  X,
  Printer,
  Info,
  Scale
} from 'lucide-react';

interface StructuredProfilingInterviewModalProps {
  isOpen?: boolean;
  wbp?: {
    id?: string;
    name?: string;
    regNumber?: string;
    status?: string;
    block?: string;
    roomNumber?: string;
    crime?: string;
  } | null;
  inmateName?: string;
  regNumber?: string;
  status?: string;
  block?: string;
  room?: string;
  crime?: string;
  initialAnswers?: InterviewAnswers;
  initialVerification?: OfficerVerification;
  onApplyResults: (results: {
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
  }) => void;
  onClose: () => void;
}

export function StructuredProfilingInterviewModal({
  isOpen = true,
  wbp,
  inmateName,
  regNumber,
  status,
  block,
  room,
  crime,
  initialAnswers,
  initialVerification,
  onApplyResults,
  onClose,
}: StructuredProfilingInterviewModalProps) {
  if (isOpen === false) return null;

  const displayName = inmateName || wbp?.name || 'Tahanan / WBP';
  const displayReg = regNumber || wbp?.regNumber || '-';
  const displayStatus = status || wbp?.status || 'WBP';
  const displayBlock = block || wbp?.block || 'Blok Hunian';
  const displayRoom = room || wbp?.roomNumber || '-';
  const displayCrime = crime || wbp?.crime || '-';
  // Active Section State: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
  const [activeSectionId, setActiveSectionId] = useState<string>('A');

  // Answers State
  const [answers, setAnswers] = useState<InterviewAnswers>(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      return initialAnswers;
    }
    // Default answers: default positive/cooperative baseline
    const defaults: InterviewAnswers = {};
    INTERVIEW_SECTIONS.forEach((sec) => {
      sec.questions.forEach((q) => {
        if (q.type === 'YES_NO') {
          // Default to non-risk answer (Ya or Tidak depending on question)
          const isYesSafe = q.yesScore === 0;
          defaults[q.id] = {
            answer: isYesSafe ? 'Ya' : 'Tidak',
            score: 0,
            explanation: '',
          };
        } else if (q.type === 'SELECT' && q.options && q.options.length > 0) {
          const defaultOpt = q.options[0];
          defaults[q.id] = {
            answer: defaultOpt.value,
            score: defaultOpt.score,
            explanation: '',
          };
        } else {
          defaults[q.id] = {
            answer: '',
            score: 0,
            explanation: '',
          };
        }
      });
    });
    return defaults;
  });

  // Verification State
  const [verification, setVerification] = useState<OfficerVerification>(() => {
    if (initialVerification) {
      return initialVerification;
    }
    return {
      directObservation: true,
      directObservationNotes: 'Perilaku tenang, tidak terpantau berselisih dengan rekan sekamar.',
      registrationRecords: true,
      registrationNotes: 'Berkas registrasi lengkap, data perkara dan masa pidana valid.',
      disciplineHistoryRegisterF: false,
      disciplineNotes: 'Nihil riwayat sanksi pelanggaran disiplin Register F.',
      kplpIntelligenceInfo: false,
      intelligenceNotes: 'Nihil laporan intelejen terkait peredaran barang terlarang.',
      bapasAssessment: true,
      bapasNotes: 'Litmas awal merekomendasikan pembinaan umum.',
      verificationConclusion: 'Data wawancara telah diverifikasi silang dengan observasi fisik dan data buku register kamtib.',
    };
  });

  // Calculate Real-time Score
  const calculation = useMemo(() => {
    return calculateInterviewScore(answers, verification);
  }, [answers, verification]);

  // Handlers for Question Answering
  const handleSelectAnswer = (qId: string, value: string, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        answer: value,
        score: score,
      },
    }));
  };

  const handleExplanationChange = (qId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        explanation: text,
      },
    }));
  };

  // Quick Preset Handlers
  const handleApplyPreset = (type: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK') => {
    const newAnswers: InterviewAnswers = {};
    INTERVIEW_SECTIONS.forEach((sec) => {
      sec.questions.forEach((q) => {
        if (q.type === 'YES_NO') {
          if (type === 'LOW_RISK') {
            const safe = q.yesScore === 0 ? 'Ya' : 'Tidak';
            newAnswers[q.id] = { answer: safe, score: 0, explanation: '' };
          } else if (type === 'MEDIUM_RISK') {
            // Some moderate risk triggers
            if (['A3', 'B2', 'C1', 'E1', 'G2'].includes(q.id)) {
              newAnswers[q.id] = { answer: 'Ya', score: q.yesScore || 2, explanation: 'Faktor pergaulan pertemanan' };
            } else {
              const safe = q.yesScore === 0 ? 'Ya' : 'Tidak';
              newAnswers[q.id] = { answer: safe, score: 0, explanation: '' };
            }
          } else {
            // High risk triggers
            if (['A3', 'A6', 'A10', 'B2', 'B6', 'B8', 'C6', 'C10', 'D2', 'D5', 'E2', 'E6', 'F4', 'F9', 'G3'].includes(q.id)) {
              newAnswers[q.id] = { answer: 'Ya', score: q.yesScore || 3, explanation: 'Terindikasi riwayat pelanggaran' };
            } else {
              const safe = q.yesScore === 0 ? 'Ya' : 'Tidak';
              newAnswers[q.id] = { answer: safe, score: 0, explanation: '' };
            }
          }
        } else if (q.type === 'SELECT' && q.options) {
          if (type === 'LOW_RISK') {
            newAnswers[q.id] = { answer: q.options[0].value, score: q.options[0].score, explanation: '' };
          } else if (type === 'MEDIUM_RISK') {
            const opt = q.options[1] || q.options[0];
            newAnswers[q.id] = { answer: opt.value, score: opt.score, explanation: '' };
          } else {
            const opt = q.options[q.options.length - 1];
            newAnswers[q.id] = { answer: opt.value, score: opt.score, explanation: '' };
          }
        } else {
          newAnswers[q.id] = {
            answer: '',
            score: 0,
            explanation: type === 'HIGH_RISK' ? 'Perlu pengawasan khusus dan sterilisasi rutin' : '',
          };
        }
      });
    });
    setAnswers(newAnswers);
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'SANGAT_TINGGI':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'TINGGI':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'SEDANG':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'RENDAH':
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  const currentSection = INTERVIEW_SECTIONS.find((s) => s.id === activeSectionId);

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full my-4 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-400/30 text-blue-300">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  Rumus Asesmen Keamanan KPLP
                </span>
                <span className="text-xs font-mono text-slate-300 font-bold">
                  [{displayStatus}] {displayName} ({displayReg}) • {displayBlock} ({displayRoom})
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Formulir Wawancara Keamanan Tahanan / Narapidana
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Calculation Score Bar */}
        <div className="bg-slate-900 text-white p-3.5 px-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Skor Risiko Terhitung:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white font-mono">{calculation.totalScore}</span>
                <span className="text-xs text-slate-400 font-bold">/ 100</span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

            {/* Risk Badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Tingkat Risiko:</span>
              <span className={`px-3 py-1 rounded-lg font-black text-xs border ${getRiskColor(calculation.riskLevel)}`}>
                {calculation.riskLevel === 'SANGAT_TINGGI' && '🔴 SANGAT TINGGI (>60)'}
                {calculation.riskLevel === 'TINGGI' && '🟠 TINGGI (41-60)'}
                {calculation.riskLevel === 'SEDANG' && '🟡 SEDANG (21-40)'}
                {calculation.riskLevel === 'RENDAH' && '🟢 RENDAH (0-20)'}
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase hidden md:inline">Preset Simulasi:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('LOW_RISK')}
              className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 font-bold text-[11px] rounded-lg border border-emerald-800 transition-colors"
            >
              Kooperatif (Rendah)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('MEDIUM_RISK')}
              className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900 text-amber-300 font-bold text-[11px] rounded-lg border border-amber-800 transition-colors"
            >
              Sedang
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('HIGH_RISK')}
              className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 font-bold text-[11px] rounded-lg border border-red-800 transition-colors"
            >
              Risiko Tinggi
            </button>
          </div>
        </div>

        {/* Section Tabs Bar */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs shrink-0">
          {INTERVIEW_SECTIONS.map((sec) => {
            const secScore = calculation.sectionScores[sec.id] || 0;
            const isActive = activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSectionId(sec.id)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isActive ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700'
                }`}>
                  {sec.code}
                </span>
                <span className="truncate max-w-[130px] sm:max-w-none">{sec.title.split(' ')[0]}</span>
                {secScore > 0 && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    +{secScore}
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveSectionId('H')}
            className={`px-3.5 py-2 rounded-xl font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ml-auto ${
              activeSectionId === 'H'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>H. Hasil & Verifikasi</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {activeSectionId !== 'H' && currentSection && (
            <div className="space-y-4">
              {/* Section Header Info */}
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-blue-950 text-sm">
                    Bagian {currentSection.code}. {currentSection.title}
                  </h3>
                  <p className="text-xs text-blue-900 font-medium">{currentSection.goal}</p>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {currentSection.questions.map((q) => {
                  const currentAns = answers[q.id] || { answer: '', score: 0, explanation: '' };

                  return (
                    <div
                      key={q.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs space-y-3 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px] shrink-0">
                            No. {q.number}
                          </span>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                            {q.question}
                          </p>
                        </div>

                        {currentAns.score > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded-md shrink-0">
                            +{currentAns.score} Poin Risiko
                          </span>
                        )}
                      </div>

                      {/* Options Controls */}
                      {q.type === 'YES_NO' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, 'Ya', q.yesScore ?? 1)}
                            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                              currentAns.answer === 'Ya'
                                ? q.yesScore && q.yesScore > 0
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Ya</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, 'Tidak', q.noScore ?? 0)}
                            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                              currentAns.answer === 'Tidak'
                                ? q.noScore && q.noScore > 0
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Tidak</span>
                          </button>
                        </div>
                      )}

                      {q.type === 'SELECT' && q.options && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {q.options.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSelectAnswer(q.id, opt.value, opt.score)}
                              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                currentAns.answer === opt.value
                                  ? opt.score > 1
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Explanation Field for all questions or text types */}
                      {(q.type === 'TEXT' || q.explanationRequired || currentAns.score > 0) && (
                        <div className="pt-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                            {q.type === 'TEXT' ? 'Uraian Jawaban Tahanan/WBP:' : 'Keterangan Tambahan / Penjelasan WBP:'}
                          </label>
                          <input
                            type="text"
                            value={currentAns.explanation || ''}
                            onChange={(e) => handleExplanationChange(q.id, e.target.value)}
                            placeholder={q.explanationPlaceholder || 'Tuliskan keterangan detail jika ada...'}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigation Section Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = INTERVIEW_SECTIONS.findIndex((s) => s.id === activeSectionId);
                    if (currentIndex > 0) {
                      setActiveSectionId(INTERVIEW_SECTIONS[currentIndex - 1].id);
                    }
                  }}
                  disabled={activeSectionId === 'A'}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = INTERVIEW_SECTIONS.findIndex((s) => s.id === activeSectionId);
                    if (currentIndex < INTERVIEW_SECTIONS.length - 1) {
                      setActiveSectionId(INTERVIEW_SECTIONS[currentIndex + 1].id);
                    } else {
                      setActiveSectionId('H');
                    }
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Lanjut</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Section H: Rekapitulasi Skor & Verifikasi Petugas */}
          {activeSectionId === 'H' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Top Banner Summary */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">
                      Alur: Wawancara → Jawaban WBP → Skor → Verifikasi Petugas → Indikator → Rekomendasi
                    </span>
                    <h3 className="text-lg font-black text-white">
                      Matriks Hasil Asesmen Profiling Keamanan
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl font-black text-xs border ${getRiskColor(calculation.riskLevel)}`}>
                      {calculation.riskLevel} (Skor: {calculation.totalScore})
                    </span>
                  </div>
                </div>

                {/* Score Breakdown by Section */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  {INTERVIEW_SECTIONS.map((sec) => (
                    <div key={sec.id} className="bg-slate-800/80 p-2 rounded-lg text-center">
                      <span className="text-slate-400 block font-bold">Bag. {sec.code}</span>
                      <span className="text-white font-mono font-bold">+{calculation.sectionScores[sec.id] || 0} Poin</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indikator Otomatis yang Terdeteksi */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span>Indikator Aspek Keamanan yang Terdeteksi Otomatis:</span>
                </h4>
                <div className="flex flex-wrap items-center gap-1.5">
                  {calculation.indicators.map((ind, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold text-[11px] rounded-lg border border-slate-300"
                    >
                      ✓ {ind}
                    </span>
                  ))}
                </div>
                <div className="pt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                  <strong>Indikator Afiliasi Jaringan:</strong> {calculation.affiliationLabel}
                </div>
              </div>

              {/* Verifikasi Multi-Sumber Petugas */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <div>
                    <h4 className="font-black text-amber-950 text-xs">
                      Verifikasi Petugas KPLP (Cross-Validation Multi-Sumber)
                    </h4>
                    <p className="text-[11px] text-amber-900">
                      Hasil wawancara diverifikasi dengan observasi lapangan, berkas registrasi, sanksi disiplin & intelijen.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-start gap-2 bg-white p-3 rounded-xl border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verification.directObservation}
                      onChange={(e) => setVerification({ ...verification, directObservation: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">1. Observasi Langsung Perilaku</span>
                      <span className="text-[10px] text-slate-500">Pengamatan interaksi di kamar dan blok hunian.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 bg-white p-3 rounded-xl border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verification.registrationRecords}
                      onChange={(e) => setVerification({ ...verification, registrationRecords: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">2. Data Buku Register & Berkas</span>
                      <span className="text-[10px] text-slate-500">Pengecekan vonis, ekspirasi, dan riwayat pelarian.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 bg-white p-3 rounded-xl border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verification.disciplineHistoryRegisterF}
                      onChange={(e) => setVerification({ ...verification, disciplineHistoryRegisterF: e.target.checked })}
                      className="mt-0.5 rounded text-red-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">3. Riwayat Hukuman Disiplin (Register F)</span>
                      <span className="text-[10px] text-slate-500">Pernah disanksi Register F (+5 Poin Risiko).</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 bg-white p-3 rounded-xl border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verification.kplpIntelligenceInfo}
                      onChange={(e) => setVerification({ ...verification, kplpIntelligenceInfo: e.target.checked })}
                      className="mt-0.5 rounded text-red-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">4. Catatan Informasi Intelijen KPLP</span>
                      <span className="text-[10px] text-slate-500">Laporan intelijen terkait jaringan/barang (+5 Poin).</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">
                    Catatan Kesimpulan Verifikasi Petugas:
                  </label>
                  <textarea
                    rows={2}
                    value={verification.verificationConclusion}
                    onChange={(e) => setVerification({ ...verification, verificationConclusion: e.target.value })}
                    className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Rangkuman Otomatis untuk Lembar Profiling */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-3">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  Preview Rangkuman Hasil Asesmen untuk Lembar Profiling:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <strong className="text-slate-800 block mb-1">1. Profil Psikologis & Karakter:</strong>
                    <p className="text-slate-600">{calculation.calculatedPsychology}</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <strong className="text-red-700 block mb-1">2. Catatan Risiko Keamanan:</strong>
                    <p className="text-slate-600">{calculation.calculatedSecurityRisk}</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <strong className="text-slate-800 block mb-1">3. Interaksi Sosial:</strong>
                    <p className="text-slate-600">{calculation.calculatedSocialBehavior}</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <strong className="text-blue-900 block mb-1">4. Rekomendasi Penempatan KPLP:</strong>
                    <p className="text-slate-600">{calculation.calculatedRecommendation}</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 text-xs cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onApplyResults({
                  totalScore: calculation.totalScore,
                  riskLevel: calculation.riskLevel,
                  psychologicalProfile: calculation.calculatedPsychology,
                  securityRiskNotes: calculation.calculatedSecurityRisk,
                  socialBehaviorNotes: calculation.calculatedSocialBehavior,
                  affiliationNotes: calculation.calculatedAffiliation,
                  recommendation: calculation.calculatedRecommendation,
                  indicators: calculation.indicators,
                  affiliationLevel: calculation.affiliationLevel,
                  answers: answers,
                  verification: verification,
                });
                onClose();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-md text-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Terapkan Rumus & Hasil Asesmen</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
