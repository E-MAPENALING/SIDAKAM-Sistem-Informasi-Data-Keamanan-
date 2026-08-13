import React, { useState, useEffect } from 'react';
import { 
  SecurityStats, 
  SecurityLevel, 
  IncidentReport, 
  DailyJournalEntry,
  WBPRecord, 
  ViolationRecord, 
  RupamShift,
  SecurityOfficer,
  IncidentStatus,
  InmateBehaviorRecord
} from './types';
import { 
  INITIAL_SECURITY_STATS, 
  INITIAL_INCIDENTS, 
  INITIAL_DAILY_JOURNAL,
  INITIAL_WBP_DATA, 
  INITIAL_VIOLATIONS, 
  INITIAL_RUPAM_SHIFTS,
  INITIAL_OFFICERS,
  INITIAL_BEHAVIOR_RECORDS
} from './data/mockData';
import { 
  seedInitialDataIfEmpty, 
  subscribeToStats, 
  subscribeToCollection, 
  saveStatsToCloud, 
  saveDocumentToCloud, 
  deleteDocumentFromCloud, 
  COLLECTIONS,
  db
} from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { APP_LOGO_KEY } from './components/ImipasLogo';

import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { JournalManager } from './components/JournalManager';
import { IncidentManager } from './components/IncidentManager';
import { ViolationRegisterF } from './components/ViolationRegisterF';
import { RupamShiftManager } from './components/RupamShiftManager';
import { InmateBehaviorManager } from './components/InmateBehaviorManager';
import { AiSecurityAnalyst } from './components/AiSecurityAnalyst';
import { EmergencyPanicModal } from './components/EmergencyPanicModal';
import { PrintReportModal } from './components/PrintReportModal';

import { 
  LayoutDashboard, 
  BookOpen,
  ShieldAlert, 
  Lock, 
  Users, 
  Sparkles, 
  Radio,
  ClipboardList
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'violations' | 'rupam' | 'behavior' | 'ai-analyst'>('overview');

  // Application Data States
  const [stats, setStats] = useState<SecurityStats>(INITIAL_SECURITY_STATS);
  const [journalEntries, setJournalEntries] = useState<DailyJournalEntry[]>(INITIAL_DAILY_JOURNAL);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [wbpList, setWbpList] = useState<WBPRecord[]>(INITIAL_WBP_DATA);
  const [violations, setViolations] = useState<ViolationRecord[]>(INITIAL_VIOLATIONS);
  const [shifts, setShifts] = useState<RupamShift[]>(INITIAL_RUPAM_SHIFTS);
  const [officers, setOfficers] = useState<SecurityOfficer[]>(INITIAL_OFFICERS);
  const [behaviorRecords, setBehaviorRecords] = useState<InmateBehaviorRecord[]>(INITIAL_BEHAVIOR_RECORDS);

  // Modals State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [selectedBapForPrint, setSelectedBapForPrint] = useState<ViolationRecord | null>(null);

  // --- Realtime Sync Listeners across HP & Web ---
  useEffect(() => {
    // Seed initial data if Firebase Firestore is empty
    seedInitialDataIfEmpty();

    // Subscribe to Security Stats
    const unsubStats = subscribeToStats((newStats) => {
      setStats(newStats);
    });

    // Subscribe to Journal Entries
    const unsubJournal = subscribeToCollection<DailyJournalEntry>(
      COLLECTIONS.JOURNAL,
      setJournalEntries,
      INITIAL_DAILY_JOURNAL
    );

    // Subscribe to Incident Reports
    const unsubIncidents = subscribeToCollection<IncidentReport>(
      COLLECTIONS.INCIDENTS,
      setIncidents,
      INITIAL_INCIDENTS
    );

    // Subscribe to WBP Records
    const unsubWbp = subscribeToCollection<WBPRecord>(
      COLLECTIONS.WBP,
      setWbpList,
      INITIAL_WBP_DATA
    );

    // Subscribe to Violation Records
    const unsubViolations = subscribeToCollection<ViolationRecord>(
      COLLECTIONS.VIOLATIONS,
      setViolations,
      INITIAL_VIOLATIONS
    );

    // Subscribe to Rupam Shifts
    const unsubShifts = subscribeToCollection<RupamShift>(
      COLLECTIONS.SHIFTS,
      setShifts,
      INITIAL_RUPAM_SHIFTS
    );

    // Subscribe to Security Officers
    const unsubOfficers = subscribeToCollection<SecurityOfficer>(
      COLLECTIONS.OFFICERS,
      setOfficers,
      INITIAL_OFFICERS
    );

    // Subscribe to Behavior Records
    const unsubBehavior = subscribeToCollection<InmateBehaviorRecord>(
      COLLECTIONS.BEHAVIOR_NOTES,
      setBehaviorRecords,
      INITIAL_BEHAVIOR_RECORDS
    );

    // Subscribe to App Logo settings across devices
    const logoDocRef = doc(db, COLLECTIONS.SETTINGS, 'app_logo');
    const unsubLogo = onSnapshot(logoDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const logoUrl = snapshot.data().url;
        if (logoUrl) {
          localStorage.setItem(APP_LOGO_KEY, logoUrl);
          window.dispatchEvent(new Event('app_logo_changed'));
        }
      } else {
        localStorage.removeItem(APP_LOGO_KEY);
        window.dispatchEvent(new Event('app_logo_changed'));
      }
    });

    return () => {
      unsubStats();
      unsubJournal();
      unsubIncidents();
      unsubWbp();
      unsubViolations();
      unsubShifts();
      unsubOfficers();
      unsubBehavior();
      unsubLogo();
    };
  }, []);

  // Handlers for Behavior Records
  const handleAddBehaviorRecord = (recordData: Omit<InmateBehaviorRecord, 'id'>) => {
    const newRecord: InmateBehaviorRecord = {
      ...recordData,
      id: 'beh-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    saveDocumentToCloud(COLLECTIONS.BEHAVIOR_NOTES, newRecord);
  };

  const handleUpdateBehaviorRecord = (updatedRecord: InmateBehaviorRecord) => {
    saveDocumentToCloud(COLLECTIONS.BEHAVIOR_NOTES, updatedRecord);
  };

  const handleDeleteBehaviorRecord = (id: string) => {
    deleteDocumentFromCloud(COLLECTIONS.BEHAVIOR_NOTES, id);
  };

  // Handlers with Cloud Sync
  const handleUpdateStats = (newStats: Partial<SecurityStats>) => {
    setStats((prev) => {
      const updated = { ...prev, ...newStats };
      saveStatsToCloud(updated);
      return updated;
    });
  };

  const handleSecurityLevelChange = (newLevel: SecurityLevel) => {
    const updated = { ...stats, currentSecurityLevel: newLevel };
    setStats(updated);
    saveStatsToCloud(updated);
  };

  const handleAddJournalEntry = (newEntryData: Omit<DailyJournalEntry, 'id'>) => {
    const newEntry: DailyJournalEntry = {
      ...newEntryData,
      id: 'journal-' + Date.now(),
    };
    saveDocumentToCloud(COLLECTIONS.JOURNAL, newEntry);
  };

  const handleUpdateJournalEntry = (updatedEntry: DailyJournalEntry) => {
    saveDocumentToCloud(COLLECTIONS.JOURNAL, updatedEntry);
  };

  const handleDeleteJournalEntry = (id: string) => {
    deleteDocumentFromCloud(COLLECTIONS.JOURNAL, id);
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

    saveDocumentToCloud(COLLECTIONS.INCIDENTS, newIncident);

    // Update active incidents count stat if not complete
    if (newIncident.status !== 'SELESAI') {
      const updatedStats = {
        ...stats,
        activeIncidentsCount: stats.activeIncidentsCount + 1,
      };
      setStats(updatedStats);
      saveStatsToCloud(updatedStats);
    }
  };

  const handleUpdateIncidentStatus = (id: string, newStatus: IncidentStatus) => {
    const target = incidents.find((inc) => inc.id === id);
    if (target) {
      const updatedIncident = { ...target, status: newStatus };
      saveDocumentToCloud(COLLECTIONS.INCIDENTS, updatedIncident);

      // Recalculate stats
      const updatedList = incidents.map((inc) => (inc.id === id ? updatedIncident : inc));
      const activeCount = updatedList.filter((i) => i.status !== 'SELESAI').length;
      const updatedStats = { ...stats, activeIncidentsCount: activeCount };
      setStats(updatedStats);
      saveStatsToCloud(updatedStats);
    }
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

    setViolations((prev) => [newViolation, ...prev.filter((v) => v.id !== newId)]);
    saveDocumentToCloud(COLLECTIONS.VIOLATIONS, newViolation);

    // Update WBP status in list if isolasi active
    if (newViolation.punishment === 'ISOLASI_TUTUPAN_SUNYI') {
      const targetWbp = wbpList.find((w) => w.id === newViolation.wbpId);
      if (targetWbp) {
        const updatedWbp: WBPRecord = {
          ...targetWbp,
          punishmentStatus: 'ISOLASI_AKTIF',
          violationCount: targetWbp.violationCount + 1,
        };
        setWbpList((prev) => prev.map((w) => (w.id === updatedWbp.id ? updatedWbp : w)));
        saveDocumentToCloud(COLLECTIONS.WBP, updatedWbp);
      }

      const updatedStats = {
        ...stats,
        activeIsolationsCount: stats.activeIsolationsCount + 1,
        registerFActiveCount: stats.registerFActiveCount + 1,
      };
      setStats(updatedStats);
      saveStatsToCloud(updatedStats);
    }
  };

  const handleUpdateViolation = (updatedViol: ViolationRecord) => {
    setViolations((prev) => prev.map((v) => (v.id === updatedViol.id ? updatedViol : v)));
    saveDocumentToCloud(COLLECTIONS.VIOLATIONS, updatedViol);
  };

  const handleDeleteViolation = (id: string) => {
    const targetViol = violations.find((v) => v.id === id);

    // Filter out violation
    const updatedViolations = violations.filter((v) => v.id !== id);
    setViolations(updatedViolations);
    deleteDocumentFromCloud(COLLECTIONS.VIOLATIONS, id);

    // Sync corresponding WBP if exists
    if (targetViol) {
      const remainingForWbp = updatedViolations.filter(
        (v) =>
          (targetViol.wbpId && v.wbpId === targetViol.wbpId) ||
          (targetViol.wbpRegNumber && v.wbpRegNumber.toLowerCase() === targetViol.wbpRegNumber.toLowerCase()) ||
          (targetViol.wbpName && v.wbpName.toLowerCase() === targetViol.wbpName.toLowerCase())
      );

      const targetWbp = wbpList.find(
        (w) =>
          (targetViol.wbpId && w.id === targetViol.wbpId) ||
          (targetViol.wbpRegNumber && w.regNumber.toLowerCase() === targetViol.wbpRegNumber.toLowerCase()) ||
          (targetViol.wbpName && w.name.toLowerCase() === targetViol.wbpName.toLowerCase())
      );

      if (targetWbp) {
        const updatedWbp: WBPRecord = {
          ...targetWbp,
          punishmentStatus: remainingForWbp.length > 0 ? targetWbp.punishmentStatus : 'BEBAS_PELANGGARAN',
          violationCount: remainingForWbp.length,
        };
        setWbpList((prev) => prev.map((w) => (w.id === updatedWbp.id ? updatedWbp : w)));
        saveDocumentToCloud(COLLECTIONS.WBP, updatedWbp);
      }
    }
  };

  const handleResetWbpStatus = (wbpId: string) => {
    const targetWbp = wbpList.find((w) => w.id === wbpId);
    if (!targetWbp) return;

    const updatedWbp: WBPRecord = {
      ...targetWbp,
      punishmentStatus: 'BEBAS_PELANGGARAN',
      violationCount: 0,
    };
    setWbpList((prev) => prev.map((w) => (w.id === wbpId ? updatedWbp : w)));
    saveDocumentToCloud(COLLECTIONS.WBP, updatedWbp);

    const associatedViolations = violations.filter(
      (v) =>
        v.wbpId === wbpId ||
        (v.wbpRegNumber && v.wbpRegNumber.toLowerCase() === targetWbp.regNumber.toLowerCase()) ||
        (v.wbpName && v.wbpName.toLowerCase() === targetWbp.name.toLowerCase())
    );

    associatedViolations.forEach((v) => {
      deleteDocumentFromCloud(COLLECTIONS.VIOLATIONS, v.id);
    });

    setViolations((prev) =>
      prev.filter(
        (v) =>
          v.wbpId !== wbpId &&
          (v.wbpRegNumber ? v.wbpRegNumber.toLowerCase() !== targetWbp.regNumber.toLowerCase() : true) &&
          (v.wbpName ? v.wbpName.toLowerCase() !== targetWbp.name.toLowerCase() : true)
      )
    );
  };

  const handleDeleteWbp = (wbpId: string) => {
    handleResetWbpStatus(wbpId);
    setWbpList((prev) => prev.filter((w) => w.id !== wbpId));
    deleteDocumentFromCloud(COLLECTIONS.WBP, wbpId);
  };

  const handleAddShift = (newShift: RupamShift) => {
    saveDocumentToCloud(COLLECTIONS.SHIFTS, newShift);
    const updatedStats = {
      ...stats,
      rupamActive: newShift.reguName,
      danrupamActive: newShift.danrupamName,
    };
    setStats(updatedStats);
    saveStatsToCloud(updatedStats);
  };

  const handleAddOfficer = (newOfficer: SecurityOfficer) => {
    saveDocumentToCloud(COLLECTIONS.OFFICERS, newOfficer);
  };

  const handleUpdateOfficer = (updatedOfficer: SecurityOfficer) => {
    saveDocumentToCloud(COLLECTIONS.OFFICERS, updatedOfficer);
  };

  const handleDeleteOfficer = (id: string) => {
    deleteDocumentFromCloud(COLLECTIONS.OFFICERS, id);
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

    const updatedStats = { ...stats, currentSecurityLevel: 'BAHAYA' as SecurityLevel };
    setStats(updatedStats);
    saveStatsToCloud(updatedStats);
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
              <Users className="w-4 h-4" />
              <span>Data Petugas Keamanan</span>
            </button>

            <button
              id="tab-behavior"
              onClick={() => setActiveTab('behavior')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 ${
                activeTab === 'behavior'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <span>Catatan Perilaku WBP</span>
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
            officers={officers}
            onUpdateOfficer={handleUpdateOfficer}
            onAddOfficer={handleAddOfficer}
            onDeleteOfficer={handleDeleteOfficer}
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
            onUpdateViolation={handleUpdateViolation}
            onDeleteViolation={handleDeleteViolation}
            onResetWbpStatus={handleResetWbpStatus}
            onDeleteWbp={handleDeleteWbp}
            onPrintBap={(v) => setSelectedBapForPrint(v)}
          />
        )}

        {activeTab === 'rupam' && (
          <RupamShiftManager 
            shifts={shifts} 
            officers={officers}
            onAddShift={handleAddShift} 
            onAddOfficer={handleAddOfficer}
            onUpdateOfficer={handleUpdateOfficer}
            onDeleteOfficer={handleDeleteOfficer}
          />
        )}

        {activeTab === 'behavior' && (
          <InmateBehaviorManager
            wbpList={wbpList}
            behaviorRecords={behaviorRecords}
            onAddBehaviorRecord={handleAddBehaviorRecord}
            onUpdateBehaviorRecord={handleUpdateBehaviorRecord}
            onDeleteBehaviorRecord={handleDeleteBehaviorRecord}
          />
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
