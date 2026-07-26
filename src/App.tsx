import React, { useState } from 'react';
import { 
  SecurityStats, 
  SecurityLevel, 
  IncidentReport, 
  DailyJournalEntry,
  WBPRecord, 
  ViolationRecord, 
  RupamShift,
  IncidentStatus
} from './types';
import { 
  INITIAL_SECURITY_STATS, 
  INITIAL_INCIDENTS, 
  INITIAL_DAILY_JOURNAL,
  INITIAL_WBP_DATA, 
  INITIAL_VIOLATIONS, 
  INITIAL_RUPAM_SHIFTS 
} from './data/mockData';

import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { JournalManager } from './components/JournalManager';
import { IncidentManager } from './components/IncidentManager';
import { ViolationRegisterF } from './components/ViolationRegisterF';
import { RupamShiftManager } from './components/RupamShiftManager';
import { AiSecurityAnalyst } from './components/AiSecurityAnalyst';
import { EmergencyPanicModal } from './components/EmergencyPanicModal';
import { PrintReportModal } from './components/PrintReportModal';

import { 
  LayoutDashboard, 
  BookOpen,
  ShieldAlert, 
  Lock, 
  Building, 
  Sparkles, 
  Radio
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'violations' | 'rupam' | 'ai-analyst'>('overview');

  // Application Data States
  const [stats, setStats] = useState<SecurityStats>(() => {
    try {
      const saved = localStorage.getItem('kemenimipas_security_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_SECURITY_STATS, ...parsed };
      }
    } catch (e) {
      console.error('Error loading stats from localStorage:', e);
    }
    return INITIAL_SECURITY_STATS;
  });

  const handleUpdateStats = (newStats: Partial<SecurityStats>) => {
    setStats((prev) => {
      const updated = { ...prev, ...newStats };
      try {
        localStorage.setItem('kemenimipas_security_stats', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving stats to localStorage:', e);
      }
      return updated;
    });
  };
  const [journalEntries, setJournalEntries] = useState<DailyJournalEntry[]>(INITIAL_DAILY_JOURNAL);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [wbpList, setWbpList] = useState<WBPRecord[]>(INITIAL_WBP_DATA);
  const [violations, setViolations] = useState<ViolationRecord[]>(INITIAL_VIOLATIONS);
  const [shifts, setShifts] = useState<RupamShift[]>(INITIAL_RUPAM_SHIFTS);

  // Modals State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [selectedBapForPrint, setSelectedBapForPrint] = useState<ViolationRecord | null>(null);

  // Handlers
  const handleSecurityLevelChange = (newLevel: SecurityLevel) => {
    setStats((prev) => ({ ...prev, currentSecurityLevel: newLevel }));
  };

  const handleAddJournalEntry = (newEntryData: Omit<DailyJournalEntry, 'id'>) => {
    const newEntry: DailyJournalEntry = {
      ...newEntryData,
      id: 'journal-' + Date.now(),
    };
    setJournalEntries([newEntry, ...journalEntries]);
  };

  const handleUpdateJournalEntry = (updatedEntry: DailyJournalEntry) => {
    setJournalEntries((prev) =>
      prev.map((item) => (item.id === updatedEntry.id ? updatedEntry : item))
    );
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((j) => j.id !== id));
  };

  const handleAddIncident = (newIncData: Omit<IncidentReport, 'id' | 'code'>) => {
    const newId = 'inc-' + Date.now();
    const count = incidents.length + 1;
    const code = `INC-BTG-2026-${String(count).padStart(3, '0')}`;

    const newIncident: IncidentReport = {
      ...newIncData,
      id: newId,
      code,
    };

    setIncidents([newIncident, ...incidents]);

    // Update active incidents count stat if not complete
    if (newIncident.status !== 'SELESAI') {
      setStats((prev) => ({
        ...prev,
        activeIncidentsCount: prev.activeIncidentsCount + 1,
      }));
    }
  };

  const handleUpdateIncidentStatus = (id: string, newStatus: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          return { ...inc, status: newStatus };
        }
        return inc;
      })
    );

    // Recalculate stats
    const updatedList = incidents.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc));
    const activeCount = updatedList.filter((i) => i.status !== 'SELESAI').length;
    setStats((prev) => ({ ...prev, activeIncidentsCount: activeCount }));
  };

  const handleAddViolation = (newViolData: Omit<ViolationRecord, 'id' | 'bapNumber'>) => {
    const newId = 'viol-' + Date.now();
    const count = violations.length + 1;
    const bapNumber = `BAP/KPLP/BTG/2026/${String(count + 14).padStart(3, '0')}`;

    const newViolation: ViolationRecord = {
      ...newViolData,
      id: newId,
      bapNumber,
    };

    setViolations([newViolation, ...violations]);

    // Update WBP status in list if isolasi active
    if (newViolation.punishment === 'ISOLASI_TUTUPAN_SUNYI') {
      setWbpList((prev) =>
        prev.map((w) => {
          if (w.id === newViolation.wbpId) {
            return {
              ...w,
              punishmentStatus: 'ISOLASI_AKTIF',
              violationCount: w.violationCount + 1,
            };
          }
          return w;
        })
      );

      setStats((prev) => ({
        ...prev,
        activeIsolationsCount: prev.activeIsolationsCount + 1,
        registerFActiveCount: prev.registerFActiveCount + 1,
      }));
    }
  };

  const handleAddShift = (newShift: RupamShift) => {
    setShifts([newShift, ...shifts]);
    setStats((prev) => ({
      ...prev,
      rupamActive: newShift.reguName,
      danrupamActive: newShift.danrupamName,
    }));
  };

  const handleEmergencyTrigger = (title: string, location: string) => {
    const now = new Date();
    const timestamp =
      now.toISOString().split('T')[0] +
      ' ' +
      now.toTimeString().split(' ')[0].substring(0, 5);

    handleAddIncident({
      timestamp,
      location: location as any,
      category: 'PERCOBAAN_PELARIAN',
      urgency: 'KRITIS',
      status: 'DALAM_INVESTIGASI',
      title,
      description: `[ALARM DARURAT SIRENE] Aktivasi Panic Button KPLP Lapas Batang. Seluruh regu penanganan diminta merapat ke lokasi ${location}.`,
      reporterName: 'KPLP Lapas Batang (Panic Button)',
      reporterRole: 'Aktivasi Otomatis Sirene',
      involvedInmates: [],
      actionTaken: 'P2U ditutup total, Pengetatan Blok, Patroli Menara Atas siaga penuh.',
      isEmergency: true,
    });

    setStats((prev) => ({ ...prev, currentSecurityLevel: 'BAHAYA' }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Top Main Navigation Header */}
      <Header
        securityLevel={stats.currentSecurityLevel}
        onSecurityLevelChange={handleSecurityLevelChange}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        rupamActive={stats.rupamActive}
        danrupamActive={stats.danrupamActive}
        totalWBP={stats.totalWBP}
      />

      {/* Main Tab Bar Navigation */}
      <nav id="kplp-primary-tabs" className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar text-xs">
            
            <button
              id="tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Utama</span>
            </button>

            <button
              id="tab-journal"
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 ${
                activeTab === 'journal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-300" />
              <span>Jurnal Harian KPLP</span>
            </button>

            <button
              id="tab-violations"
              onClick={() => setActiveTab('violations')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 ${
                activeTab === 'violations'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Data Pelanggaran</span>
            </button>

            <button
              id="tab-rupam"
              onClick={() => setActiveTab('rupam')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 ${
                activeTab === 'rupam'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Serah Terima RUPAM</span>
            </button>

            <button
              id="tab-ai-analyst"
              onClick={() => setActiveTab('ai-analyst')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 ${
                activeTab === 'ai-analyst'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-indigo-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Analyst & Draft Lapsitkam</span>
            </button>

          </div>
        </div>
      </nav>

      {/* Main Container View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            stats={stats}
            incidents={incidents}
            violations={violations}
            onNavigateTab={(t) => setActiveTab(t as any)}
            onQuickAddIncident={() => setActiveTab('journal')}
            onQuickAddViolation={() => setActiveTab('violations')}
            onUpdateIncidentStatus={handleUpdateIncidentStatus}
            onUpdateStats={handleUpdateStats}
          />
        )}

        {activeTab === 'journal' && (
          <JournalManager
            journalEntries={journalEntries}
            onAddJournalEntry={handleAddJournalEntry}
            onUpdateJournalEntry={handleUpdateJournalEntry}
            onDeleteJournalEntry={handleDeleteJournalEntry}
          />
        )}

        {activeTab === 'violations' && (
          <ViolationRegisterF
            wbpList={wbpList}
            violations={violations}
            onAddViolation={handleAddViolation}
            onPrintBap={(v) => setSelectedBapForPrint(v)}
          />
        )}

        {activeTab === 'rupam' && (
          <RupamShiftManager shifts={shifts} onAddShift={handleAddShift} />
        )}

        {activeTab === 'ai-analyst' && (
          <AiSecurityAnalyst stats={stats} incidents={incidents} violations={violations} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-3 text-center text-[11px] font-semibold text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Enkripsi Database Active</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Sinkronisasi SDP Berhasil</span>
          </div>
          <div>DIREKTORAT JENDERAL PEMASYARAKATAN &copy; 2026 — KPLP LAPAS KELAS IIB BATANG</div>
        </div>
      </footer>

      {/* Emergency Panic Modal */}
      <EmergencyPanicModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onTriggerEmergencyIncident={handleEmergencyTrigger}
      />

      {/* Print BAP Modal */}
      <PrintReportModal
        violation={selectedBapForPrint}
        onClose={() => setSelectedBapForPrint(null)}
      />

    </div>
  );
}
