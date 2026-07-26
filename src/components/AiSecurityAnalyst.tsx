import React, { useState } from 'react';
import { IncidentReport, SecurityStats, ViolationRecord } from '../types';
import { TrendingUp, Sparkles, Copy, Check, FileText, AlertTriangle, RefreshCw } from 'lucide-react';

interface AiSecurityAnalystProps {
  stats: SecurityStats;
  incidents: IncidentReport[];
  violations: ViolationRecord[];
}

export const AiSecurityAnalyst: React.FC<AiSecurityAnalystProps> = ({
  stats,
  incidents,
  violations,
}) => {
  const [reportOutput, setReportOutput] = useState<string>('');
  const [riskOutput, setRiskOutput] = useState<string>('');
  const [loadingLapsitkam, setLoadingLapsitkam] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [copiedLapsitkam, setCopiedLapsitkam] = useState(false);
  const [copiedRisk, setCopiedRisk] = useState(false);

  const handleGenerateLapsitkam = async () => {
    setLoadingLapsitkam(true);
    try {
      const response = await fetch('/api/gemini/analyze-lapsitkam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidents,
          securityStats: stats,
          date: new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReportOutput(data.report);
      } else {
        alert('Gagal membuat Lapsitkam: ' + (data.error || 'Server error'));
      }
    } catch (error: any) {
      console.error('Error fetching Lapsitkam:', error);
      alert('Terjadi kesalahan saat menghubungi layanan AI Gemini.');
    } finally {
      setLoadingLapsitkam(false);
    }
  };

  const handleGenerateRiskAssessment = async () => {
    setLoadingRisk(true);
    try {
      const response = await fetch('/api/gemini/wbp-risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidents,
          violations,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRiskOutput(data.analysis);
      } else {
        alert('Gagal analisis risiko: ' + (data.error || 'Server error'));
      }
    } catch (error: any) {
      console.error('Error fetching Risk Assessment:', error);
      alert('Terjadi kesalahan saat menghubungi layanan AI Gemini.');
    } finally {
      setLoadingRisk(false);
    }
  };

  const copyToClipboard = (text: string, isLapsitkam: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLapsitkam) {
      setCopiedLapsitkam(true);
      setTimeout(() => setCopiedLapsitkam(false), 2000);
    } else {
      setCopiedRisk(true);
      setTimeout(() => setCopiedRisk(false), 2000);
    }
  };

  return (
    <div id="ai-security-analyst-container" className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/60 border border-blue-700/50 rounded-full text-xs text-blue-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Gemini AI Security Assistant</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Analisis Keamanan & Pembuat Draft Lapsitkam Kedinasan
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Hasilkan Laporan Situasi Keamanan (Lapsitkam) format resmi Kemenimipas / Ditjenpas dan pemetaan matriks potensi kerawanan secara otomatis berbasis data real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-generate-ai-lapsitkam"
              onClick={handleGenerateLapsitkam}
              disabled={loadingLapsitkam}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95"
            >
              {loadingLapsitkam ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Laporan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Lapsitkam Otomatis</span>
                </>
              )}
            </button>

            <button
              id="btn-generate-ai-risk"
              onClick={handleGenerateRiskAssessment}
              disabled={loadingRisk}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 font-bold text-xs rounded-md border border-slate-700 shadow-sm transition-all active:scale-95"
            >
              {loadingRisk ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengevaluasi...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Deteksi Kerawanan Blok</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Lapsitkam Official Report Output */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">Draft Lapsitkam Resmi Lapas Batang</h3>
              </div>

              {reportOutput && (
                <button
                  onClick={() => copyToClipboard(reportOutput, true)}
                  className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-800 font-semibold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md"
                >
                  {copiedLapsitkam ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLapsitkam ? 'Tersalin!' : 'Salin Laporan'}</span>
                </button>
              )}
            </div>

            {loadingLapsitkam && (
              <div className="p-12 text-center text-slate-500 text-xs space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p>AI Gemini sedang menyusun kronologi insiden & membuat format laporan resmi kedinasan...</p>
              </div>
            )}

            {!loadingLapsitkam && !reportOutput && (
              <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-lg space-y-2">
                <p>Klik tombol <strong>"Generate Lapsitkam Otomatis"</strong> untuk membuat ringkasan eksekutif harian KPLP.</p>
              </div>
            )}

            {!loadingLapsitkam && reportOutput && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {reportOutput}
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Risk Assessment & Recommendation Output */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-800">Matriks Deteksi Dini Kerawanan</h3>
              </div>

              {riskOutput && (
                <button
                  onClick={() => copyToClipboard(riskOutput, false)}
                  className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md"
                >
                  {copiedRisk ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRisk ? 'Tersalin!' : 'Salin Analisis'}</span>
                </button>
              )}
            </div>

            {loadingRisk && (
              <div className="p-12 text-center text-slate-500 text-xs space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                <p>Sistem mengevaluasi riwayat pelanggaran WBP, rasio hunian blok, dan memetakan pola gangguan kamtib...</p>
              </div>
            )}

            {!loadingRisk && !riskOutput && (
              <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-lg space-y-2">
                <p>Klik <strong>"Deteksi Kerawanan Blok"</strong> untuk rekomendasi sidak dan langkah mitigasi KPLP.</p>
              </div>
            )}

            {!loadingRisk && riskOutput && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {riskOutput}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
