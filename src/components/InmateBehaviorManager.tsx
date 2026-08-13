import React, { useState } from 'react';
import { 
  InmateBehaviorRecord, 
  WBPRecord, 
  BehaviorCategory, 
  BlockLocation 
} from '../types';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit3, 
  X, 
  FileText, 
  ShieldAlert,
  Building,
  User,
  Star,
  ChevronRight
} from 'lucide-react';
import { APP_LOGO_KEY } from './ImipasLogo';

interface InmateBehaviorManagerProps {
  wbpList: WBPRecord[];
  behaviorRecords: InmateBehaviorRecord[];
  onAddBehaviorRecord: (record: Omit<InmateBehaviorRecord, 'id'>) => void;
  onUpdateBehaviorRecord: (record: InmateBehaviorRecord) => void;
  onDeleteBehaviorRecord: (id: string) => void;
}

export function InmateBehaviorManager({
  wbpList,
  behaviorRecords,
  onAddBehaviorRecord,
  onUpdateBehaviorRecord,
  onDeleteBehaviorRecord,
}: InmateBehaviorManagerProps) {
  // State Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // State Modal Input
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InmateBehaviorRecord | null>(null);

  // Form Fields State
  const [formWbpId, setFormWbpId] = useState('');
  const [formWbpName, setFormWbpName] = useState('');
  const [formWbpRegNumber, setFormWbpRegNumber] = useState('');
  const [formBlock, setFormBlock] = useState<BlockLocation>('Blok Beta (Narapidana Dewasa)');
  const [formRoomNumber, setFormRoomNumber] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('09:00');
  const [formCategory, setFormCategory] = useState<BehaviorCategory>('POSITIF_PRESTASI');
  const [formScorePoint, setFormScorePoint] = useState<number>(10);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReporterName, setFormReporterName] = useState('DODI, S.H. (Wali Pemasyarakatan)');
  const [formReporterRole, setFormReporterRole] = useState('Wali Pemasyarakatan');
  const [formFollowUpAction, setFormFollowUpAction] = useState('');

  // State Print Report Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<'INDIVIDUAL' | 'SUMMARY'>('SUMMARY');
  const [selectedTargetWbpId, setSelectedTargetWbpId] = useState<string>('');
  const [reportDocNumber, setReportDocNumber] = useState('');

  // Filtered Records
  const filteredRecords = behaviorRecords.filter((rec) => {
    const matchesSearch = 
      rec.wbpName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.wbpRegNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.behaviorTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.reporterName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || rec.category === selectedCategory;
    const matchesBlock = selectedBlock === 'ALL' || rec.block === selectedBlock;

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && rec.date >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && rec.date <= endDate;
    }

    return matchesSearch && matchesCategory && matchesBlock && matchesDate;
  });

  // Summary Metrics
  const totalCatatan = behaviorRecords.length;
  const totalPositif = behaviorRecords.filter((r) => r.category === 'POSITIF_PRESTASI').length;
  const totalPembinaan = behaviorRecords.filter((r) => r.category === 'CATATAN_PEMBINAAN').length;
  const totalPelanggaran = behaviorRecords.filter((r) => 
    r.category === 'PELANGGARAN_RINGAN' || 
    r.category === 'PELANGGARAN_SEDANG' || 
    r.category === 'PELANGGARAN_BERAT'
  ).length;

  const totalScorePositif = behaviorRecords
    .filter((r) => r.scorePoint > 0)
    .reduce((acc, curr) => acc + curr.scorePoint, 0);

  // Handlers Open Add / Edit Modal
  const handleOpenModal = (record?: InmateBehaviorRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormWbpId(record.wbpId);
      setFormWbpName(record.wbpName);
      setFormWbpRegNumber(record.wbpRegNumber);
      setFormBlock(record.block);
      setFormRoomNumber(record.roomNumber);
      setFormDate(record.date);
      setFormTime(record.time || '09:00');
      setFormCategory(record.category);
      setFormScorePoint(record.scorePoint);
      setFormTitle(record.behaviorTitle);
      setFormDescription(record.description);
      setFormReporterName(record.reporterName);
      setFormReporterRole(record.reporterRole || 'Wali Pemasyarakatan');
      setFormFollowUpAction(record.followUpAction || '');
    } else {
      setEditingRecord(null);
      const firstWbp = wbpList[0];
      if (firstWbp) {
        setFormWbpId(firstWbp.id);
        setFormWbpName(firstWbp.name);
        setFormWbpRegNumber(firstWbp.regNumber);
        setFormBlock(firstWbp.block);
        setFormRoomNumber(firstWbp.roomNumber);
      } else {
        setFormWbpId('');
        setFormWbpName('');
        setFormWbpRegNumber('');
        setFormBlock('Blok Beta (Narapidana Dewasa)');
        setFormRoomNumber('B-01');
      }
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormTime('09:00');
      setFormCategory('POSITIF_PRESTASI');
      setFormScorePoint(10);
      setFormTitle('');
      setFormDescription('');
      setFormReporterName('DODI, S.H. (Wali Pemasyarakatan)');
      setFormReporterRole('Wali Pemasyarakatan');
      setFormFollowUpAction('Diberikan catatan motivasi dan diusulkan dalam pertimbangan evaluasi pembinaan.');
    }
    setIsModalOpen(true);
  };

  // Select WBP dropdown listener inside modal
  const handleWbpSelectChange = (wbpId: string) => {
    setFormWbpId(wbpId);
    const target = wbpList.find((w) => w.id === wbpId);
    if (target) {
      setFormWbpName(target.name);
      setFormWbpRegNumber(target.regNumber);
      setFormBlock(target.block);
      setFormRoomNumber(target.roomNumber);
    }
  };

  // Auto-set score based on category choice
  const handleCategoryChange = (cat: BehaviorCategory) => {
    setFormCategory(cat);
    if (cat === 'POSITIF_PRESTASI') setFormScorePoint(10);
    else if (cat === 'CATATAN_PEMBINAAN') setFormScorePoint(5);
    else if (cat === 'PELANGGARAN_RINGAN') setFormScorePoint(-5);
    else if (cat === 'PELANGGARAN_SEDANG') setFormScorePoint(-10);
    else if (cat === 'PELANGGARAN_BERAT') setFormScorePoint(-15);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWbpName.trim() || !formTitle.trim()) {
      alert('Mohon isi nama WBP dan Judul Catatan Perilaku.');
      return;
    }

    if (editingRecord) {
      onUpdateBehaviorRecord({
        ...editingRecord,
        wbpId: formWbpId,
        wbpName: formWbpName.trim(),
        wbpRegNumber: formWbpRegNumber.trim(),
        block: formBlock,
        roomNumber: formRoomNumber.trim(),
        date: formDate,
        time: formTime,
        category: formCategory,
        scorePoint: Number(formScorePoint),
        behaviorTitle: formTitle.trim(),
        description: formDescription.trim(),
        reporterName: formReporterName.trim(),
        reporterRole: formReporterRole.trim(),
        followUpAction: formFollowUpAction.trim(),
      });
    } else {
      onAddBehaviorRecord({
        wbpId: formWbpId || 'wbp-custom-' + Date.now(),
        wbpName: formWbpName.trim(),
        wbpRegNumber: formWbpRegNumber.trim() || 'REG-PENDING',
        block: formBlock,
        roomNumber: formRoomNumber.trim() || '-',
        date: formDate,
        time: formTime,
        category: formCategory,
        scorePoint: Number(formScorePoint),
        behaviorTitle: formTitle.trim(),
        description: formDescription.trim(),
        reporterName: formReporterName.trim(),
        reporterRole: formReporterRole.trim(),
        followUpAction: formFollowUpAction.trim(),
      });
    }

    setIsModalOpen(false);
  };

  // Category Badge Helper
  const getCategoryBadge = (category: BehaviorCategory, score: number) => {
    switch (category) {
      case 'POSITIF_PRESTASI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Prestasi / Kelakuan Baik (+{score})</span>
          </span>
        );
      case 'CATATAN_PEMBINAAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Evaluasi Pembinaan (+{score})</span>
          </span>
        );
      case 'PELANGGARAN_RINGAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Pelanggaran Ringan ({score})</span>
          </span>
        );
      case 'PELANGGARAN_SEDANG':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
            <span>Pelanggaran Sedang ({score})</span>
          </span>
        );
      case 'PELANGGARAN_BERAT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Pelanggaran Berat / Indisipliner ({score})</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Helper WBP Target List for Individual Report
  const targetWbpObj = wbpList.find((w) => w.id === selectedTargetWbpId) || wbpList[0];
  const targetIndividualRecords = selectedTargetWbpId 
    ? behaviorRecords.filter((r) => r.wbpId === selectedTargetWbpId || r.wbpRegNumber === targetWbpObj?.regNumber)
    : (targetWbpObj ? behaviorRecords.filter((r) => r.wbpId === targetWbpObj.id) : []);

  const totalIndividualScore = targetIndividualRecords.reduce((acc, curr) => acc + curr.scorePoint, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Title & Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              CATATAN PERILAKU & PEMBINAAN NARAPIDANA
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 pl-11">
            Sistem Pemantauan Perilaku WBP, Rekam Jejak Sikap/Prestasi, Evaluasi Wali Pemasyarakatan & Cetak Laporan Resmi
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Input Catatan Perilaku</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (wbpList.length > 0 && !selectedTargetWbpId) {
                setSelectedTargetWbpId(wbpList[0].id);
              }
              setIsPrintModalOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Perilaku WBP</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">TOTAL REKAM CATATAN</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCatatan}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Catatan Perilaku & Evaluasi</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">PERILAKU BAIK / PRESTASI</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{totalPositif}</h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">+{totalScorePositif} Poin Apresiasi</p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">EVALUASI PEMBINAAN</p>
            <h3 className="text-2xl font-black text-sky-700 mt-1">{totalPembinaan}</h3>
            <p className="text-[11px] text-sky-600 mt-0.5">Konseling Wali & Kegiatan</p>
          </div>
          <div className="p-3 bg-sky-100 text-sky-700 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">PELANGGARAN / INDISIPLINER</p>
            <h3 className="text-2xl font-black text-rose-700 mt-1">{totalPelanggaran}</h3>
            <p className="text-[11px] text-rose-600 mt-0.5">Teguran & BAP Disiplin</p>
          </div>
          <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Search, Filter & Date Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Nama WBP, No. Registrasi, Judul Catatan, Deskripsi, Petugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 shrink-0">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Kategori:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kategori Perilaku</option>
              <option value="POSITIF_PRESTASI">Prestasi / Kelakuan Baik</option>
              <option value="CATATAN_PEMBINAAN">Evaluasi Pembinaan</option>
              <option value="PELANGGARAN_RINGAN">Pelanggaran Ringan</option>
              <option value="PELANGGARAN_SEDANG">Pelanggaran Sedang</option>
              <option value="PELANGGARAN_BERAT">Pelanggaran Berat</option>
            </select>

            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Blok Hunian</option>
              <option value="Blok Alpha (Tahanan)">Blok Alpha (Tahanan)</option>
              <option value="Blok Beta (Narapidana Dewasa)">Blok Beta (Narapidana Dewasa)</option>
              <option value="Blok Edelweis (Wanita / Khusus)">Blok Edelweis (Wanita)</option>
              <option value="Blok Sel Isolasi / Tutupan Sunyi">Blok Sel Isolasi</option>
            </select>
          </div>

        </div>

        {/* Date Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Filter Tanggal:
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">S/d:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-medium"
            />
          </div>

          {(startDate || endDate || selectedCategory !== 'ALL' || selectedBlock !== 'ALL' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSelectedCategory('ALL');
                setSelectedBlock('ALL');
                setSearchTerm('');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold underline ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Records List Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              DAFTAR REKAM JEJAK CATATAN PERILAKU WBP ({filteredRecords.length})
            </h2>
          </div>
          <span className="text-xs text-slate-300">
            Real-time Sync Database KPLP
          </span>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {filteredRecords.map((record) => (
              <div key={record.id} className="p-5 hover:bg-slate-50/80 transition-colors space-y-3">
                
                {/* Header Row: WBP Info & Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-extrabold text-sm border border-indigo-200 shrink-0">
                      {record.wbpName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-extrabold text-slate-900">{record.wbpName}</h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[11px] rounded border border-slate-300">
                          {record.wbpRegNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          {record.block} ({record.roomNumber})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {getCategoryBadge(record.category, record.scorePoint)}
                  </div>
                </div>

                {/* Body Row: Behavior Title & Description */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{record.behaviorTitle}</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {record.description}
                  </p>

                  {record.followUpAction && (
                    <div className="pt-2 border-t border-slate-200/80 text-xs text-indigo-900 bg-indigo-50/60 p-2 rounded-lg border border-indigo-100 flex items-start gap-1.5">
                      <ChevronRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-indigo-950">Tindak Lanjut / Rekomendasi:</strong>{' '}
                        <span>{record.followUpAction}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Row: Date, Reporter, Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {record.date} {record.time ? `• ${record.time} WIB` : ''}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      Pencatat: {record.reporterName} {record.reporterRole ? `(${record.reporterRole})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTargetWbpId(record.wbpId);
                        setPrintMode('INDIVIDUAL');
                        setIsPrintModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-md border border-indigo-200 flex items-center gap-1 transition-colors"
                      title="Cetak Transkrip Perilaku WBP Perorangan"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Transkrip WBP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenModal(record)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Catatan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus catatan perilaku "${record.behaviorTitle}" untuk WBP ${record.wbpName}?`)) {
                          onDeleteBehaviorRecord(record.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <ClipboardList className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Belum Ada Rekam Catatan Perilaku WBP</p>
            <p className="text-xs text-slate-400">Silakan klik tombol "Input Catatan Perilaku" di atas untuk menambahkan catatan baru.</p>
          </div>
        )}

      </div>

      {/* --- MODAL 1: ADD / EDIT BEHAVIOR RECORD --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wide">
                  {editingRecord ? 'EDIT CATATAN PERILAKU WBP' : 'INPUT CATATAN PERILAKU WBP BARU'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              
              {/* Select WBP */}
              <div>
                <label className="block text-slate-800 font-extrabold mb-1">
                  Pilih WBP (Warga Binaan Pemasyarakatan):
                </label>
                <select
                  value={formWbpId}
                  onChange={(e) => handleWbpSelectChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {wbpList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — No. Reg: {w.regNumber} ({w.block} {w.roomNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Or Manual WBP info if needed */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama WBP (Konfirmasi):</label>
                  <input
                    type="text"
                    value={formWbpName}
                    onChange={(e) => setFormWbpName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 font-bold text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">No. Registrasi WBP:</label>
                  <input
                    type="text"
                    value={formWbpRegNumber}
                    onChange={(e) => setFormWbpRegNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Block & Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Blok Hunian:</label>
                  <select
                    value={formBlock}
                    onChange={(e) => setFormBlock(e.target.value as BlockLocation)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="Blok Alpha (Tahanan)">Blok Alpha (Tahanan)</option>
                    <option value="Blok Beta (Narapidana Dewasa)">Blok Beta (Narapidana Dewasa)</option>
                    <option value="Blok Edelweis (Wanita / Khusus)">Blok Edelweis (Wanita / Khusus)</option>
                    <option value="Blok Sel Isolasi / Tutupan Sunyi">Blok Sel Isolasi / Tutupan Sunyi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Kamar / Sel:</label>
                  <input
                    type="text"
                    placeholder="Contoh: B-04 / A-02 / ISO-01"
                    value={formRoomNumber}
                    onChange={(e) => setFormRoomNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Tanggal Pengamatan:</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Jam Waktu:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 08:30 WIB"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Category & Score */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Kategori Perilaku:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as BehaviorCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="POSITIF_PRESTASI">🟢 Perilaku Baik / Prestasi (+)</option>
                    <option value="CATATAN_PEMBINAAN">🔵 Evaluasi Pembinaan Routine (+)</option>
                    <option value="PELANGGARAN_RINGAN">🟡 Pelanggaran Ringan (-)</option>
                    <option value="PELANGGARAN_SEDANG">🟠 Pelanggaran Sedang (-)</option>
                    <option value="PELANGGARAN_BERAT">🔴 Pelanggaran Berat / Indisipliner (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Poin Nilai (Bobot Skor):</label>
                  <input
                    type="number"
                    value={formScorePoint}
                    onChange={(e) => setFormScorePoint(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">Judul Perilaku / Kejadian:</label>
                <input
                  type="text"
                  placeholder="Contoh: Menjadi Tamping Kebersihan Masjid, Menjaga Ketertiban Kamar, Cekcok Kecil..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">Detail Deskripsi Pengamatan Perilaku:</label>
                <textarea
                  rows={3}
                  placeholder="Uraikan detail pengamatan perilaku WBP, keaktifan dalam program pembinaan, atau kronologi singkat..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Reporter Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Petugas / Wali Pencatat:</label>
                  <input
                    type="text"
                    value={formReporterName}
                    onChange={(e) => setFormReporterName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Jabatan / Role Wali:</label>
                  <input
                    type="text"
                    value={formReporterRole}
                    onChange={(e) => setFormReporterRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Follow Up */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">Tindak Lanjut / Rekomendasi Pembinaan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Diusulkan Apresiasi Remisi / Konseling Rutin Wali / Diberikan Teguran Lisan..."
                  value={formFollowUpAction}
                  onChange={(e) => setFormFollowUpAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingRecord ? 'Simpan Perubahan' : 'Simpan Catatan Baru'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CETAK LAPORAN OFFICIAL PERILAKU WBP --- */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-300 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:rounded-none">
            
            {/* Modal Control Header (Hidden when printing) */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wide">
                  CETAK LAPORAN RESMI CATATAN PERILAKU WBP
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Cetak PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Settings Options (Hidden when printing) */}
            <div className="bg-slate-100 border-b border-slate-200 p-4 space-y-3 print:hidden text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Jenis Laporan:</span>
                  <div className="inline-flex rounded-lg bg-slate-200 p-1">
                    <button
                      type="button"
                      onClick={() => setPrintMode('SUMMARY')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        printMode === 'SUMMARY'
                          ? 'bg-white text-indigo-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Rekapitulasi Periode / Kolektif
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintMode('INDIVIDUAL')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        printMode === 'INDIVIDUAL'
                          ? 'bg-white text-indigo-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Transkrip Perorangan WBP
                    </button>
                  </div>
                </div>

                {printMode === 'INDIVIDUAL' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="font-bold text-slate-700 shrink-0">Pilih WBP Target:</span>
                    <select
                      value={selectedTargetWbpId}
                      onChange={(e) => setSelectedTargetWbpId(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 text-xs flex-1 sm:flex-initial"
                    >
                      {wbpList.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.regNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-200 text-xs">
                <span className="font-bold text-slate-600">Nomor Dokumen Laporan:</span>
                <input
                  type="text"
                  value={reportDocNumber}
                  onChange={(e) => setReportDocNumber(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-800 w-64"
                />
              </div>
            </div>

            {/* --- PRINTABLE DOCUMENT PAPER BODY --- */}
            <div className="p-8 sm:p-10 bg-white text-slate-900 space-y-6 text-xs font-serif leading-relaxed print:p-0 print:text-black">
              
              {/* Official Kop Surat */}
              <div className="border-b-4 border-double border-slate-900 pb-3 text-center flex items-center justify-center gap-4">
                <img
                  src={localStorage.getItem(APP_LOGO_KEY) || 'https://upload.wikimedia.org/wikipedia/commons/9/98/Pengayoman_Kemenkumham.png'}
                  alt="Logo Instansi"
                  className="w-16 h-16 object-contain shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                    KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN RI
                  </h2>
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                    KANTOR WILAYAH JAWA TENGAH
                  </h3>
                  <h1 className="text-sm sm:text-base font-black uppercase tracking-widest text-slate-900">
                    LEMBAGA PEMASYARAKATAN KELAS IIB BATANG
                  </h1>
                  <p className="text-[11px] font-sans font-semibold text-slate-800">
                    Jl. Raya Batang-Bandar km 4,1, Batang 51216, Telepon: (0285) 4494300
                  </p>
                </div>
              </div>

              {/* Document Header Title */}
              <div className="text-center space-y-1">
                <h3 className="text-sm sm:text-base font-black uppercase underline tracking-wide">
                  {printMode === 'INDIVIDUAL' 
                    ? 'TRANSKRIP & REKAPITULASI CATATAN PERILAKU WBP'
                    : 'LAPORAN REKAPITULASI CATATAN PERILAKU NARAPIDANA'
                  }
                </h3>
                <p className="text-xs font-mono font-bold flex items-center justify-center gap-1">
                  <span>Nomor:</span>
                  <input
                    type="text"
                    value={reportDocNumber}
                    onChange={(e) => setReportDocNumber(e.target.value)}
                    placeholder=".................................................."
                    className="font-mono font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-blue-500 focus:outline-none text-center min-w-[240px] print:border-none print:placeholder-transparent"
                  />
                </p>
              </div>

              {/* Report Metadata */}
              {printMode === 'INDIVIDUAL' && targetWbpObj ? (
                <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs font-sans print:border-black">
                  <div>
                    <span className="font-bold text-slate-600">Nama Lengkap WBP:</span>{' '}
                    <strong className="text-slate-900">{targetWbpObj.name}</strong>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Nomor Registrasi:</span>{' '}
                    <strong className="text-slate-900">{targetWbpObj.regNumber}</strong>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Blok / Kamar Hunian:</span>{' '}
                    <span>{targetWbpObj.block} ({targetWbpObj.roomNumber})</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Perkara / Kejahatan:</span>{' '}
                    <span>{targetWbpObj.crime}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Total Poin Kelakuan Baik:</span>{' '}
                    <strong className="text-emerald-700">+{totalIndividualScore} Poin</strong>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Status Hukuman Disiplin:</span>{' '}
                    <strong className="text-slate-800">{targetWbpObj.punishmentStatus}</strong>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-sans space-y-1 text-slate-700">
                  <p><strong>Satuan Kerja:</strong> Lapas Kelas IIB Batang — Kesatuan Pengamanan (KPLP)</p>
                  <p><strong>Filter Blok Hunian:</strong> {selectedBlock === 'ALL' ? 'Seluruh Blok Hunian Lapas' : selectedBlock}</p>
                  <p><strong>Periode Cetak:</strong> {startDate || 'Awal'} s/d {endDate || new Date().toISOString().split('T')[0]}</p>
                  <p><strong>Total Record Catatan:</strong> {filteredRecords.length} Kegiatan/Kejadian</p>
                </div>
              )}

              {/* Main Report Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-900 text-[11px] font-sans">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold uppercase tracking-wider border-b border-slate-900">
                      <th className="border border-slate-900 px-2 py-1.5 text-center w-8">No</th>
                      <th className="border border-slate-900 px-2 py-1.5 text-left">Tanggal/Jam</th>
                      {printMode === 'SUMMARY' && (
                        <th className="border border-slate-900 px-2 py-1.5 text-left">Nama WBP / No. Reg</th>
                      )}
                      <th className="border border-slate-900 px-2 py-1.5 text-left">Kategori & Skor</th>
                      <th className="border border-slate-900 px-2 py-1.5 text-left">Judul & Deskripsi Perilaku</th>
                      <th className="border border-slate-900 px-2 py-1.5 text-left">Pencatat / Wali</th>
                      <th className="border border-slate-900 px-2 py-1.5 text-left">Tindak Lanjut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(printMode === 'INDIVIDUAL' ? targetIndividualRecords : filteredRecords).length > 0 ? (
                      (printMode === 'INDIVIDUAL' ? targetIndividualRecords : filteredRecords).map((rec, index) => (
                        <tr key={rec.id} className="border-b border-slate-900 align-top">
                          <td className="border border-slate-900 px-2 py-1.5 text-center font-bold">{index + 1}</td>
                          <td className="border border-slate-900 px-2 py-1.5 whitespace-nowrap">
                            <div className="font-bold">{rec.date}</div>
                            <div className="text-[10px] text-slate-600">{rec.time || 'WIB'}</div>
                          </td>
                          {printMode === 'SUMMARY' && (
                            <td className="border border-slate-900 px-2 py-1.5">
                              <div className="font-extrabold text-slate-900">{rec.wbpName}</div>
                              <div className="text-[10px] text-slate-600">{rec.wbpRegNumber}</div>
                              <div className="text-[10px] text-slate-500">{rec.block}</div>
                            </td>
                          )}
                          <td className="border border-slate-900 px-2 py-1.5 font-bold">
                            <div className={rec.scorePoint >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              {rec.category.replace('_', ' ')}
                            </div>
                            <div className="text-[10px] font-mono">
                              Skor: {rec.scorePoint > 0 ? `+${rec.scorePoint}` : rec.scorePoint}
                            </div>
                          </td>
                          <td className="border border-slate-900 px-2 py-1.5">
                            <div className="font-bold text-slate-900">{rec.behaviorTitle}</div>
                            <div className="text-[10px] text-slate-700 leading-normal">{rec.description}</div>
                          </td>
                          <td className="border border-slate-900 px-2 py-1.5 text-[10px]">
                            <div className="font-bold">{rec.reporterName}</div>
                            <div className="text-slate-500">{rec.reporterRole || 'Wali'}</div>
                          </td>
                          <td className="border border-slate-900 px-2 py-1.5 text-[10px]">
                            {rec.followUpAction || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={printMode === 'SUMMARY' ? 7 : 6} className="text-center py-4 text-slate-500 font-bold">
                          Tidak ada rekam catatan perilaku WBP untuk kriteria ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Individual Evaluation Summary Section */}
              {printMode === 'INDIVIDUAL' && (
                <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg text-xs space-y-1 font-sans">
                  <p className="font-bold text-slate-900 uppercase">REKOMENDASI EVALUASI PERILAKU WALI PEMASYARAKATAN:</p>
                  <p className="text-slate-700 leading-normal">
                    Berdasarkan rekam catatan perilaku di atas, Warga Binaan Pemasyarakatan an. <strong>{targetWbpObj?.name}</strong> memiliki total akumulasi skor kelakuan baik sebesar <strong>+{totalIndividualScore} Poin</strong>.
                    {totalIndividualScore >= 10 
                      ? ' WBP bersangkutan menunjukkan sikap taat hukum, aktif dalam pembinaan dan dapat dipertimbangkan untuk pengusulan Remisi / Hak Integrasi (PB/CB).'
                      : ' WBP bersangkutan memerlukan pendampingan dan pembinaan lebih intensif dari Tim Wali Pemasyarakatan.'
                    }
                  </p>
                </div>
              )}

              {/* Signatures Block */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs font-sans print:pt-6">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">KASI BINADIK & GIATJA</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase">BAMBANG HERMANTO, S.H.</p>
                  <p className="text-[10px] text-slate-600">NIP. 19820412 200312 1 002</p>
                </div>

                <div>
                  <p>&nbsp;</p>
                  <p className="font-bold">KA. KPLP LAPAS BATANG</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase">DODI, S.H.</p>
                  <p className="text-[10px] text-slate-600">NIP. 19800515 200112 1 001</p>
                </div>

                <div>
                  <p>Batang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-bold">PETUGAS / WALI PEMASYARAKATAN</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase">SUTRISNO, S.AP</p>
                  <p className="text-[10px] text-slate-600">NIP. 19880910 201012 1 004</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
