import React, { useState } from 'react';
import { WBPRecord, ViolationRecord, ViolationSeverity, PunishmentType } from '../types';
import { getStoredAppLogo } from './ImipasLogo';
import { 
  Lock, 
  Search, 
  Plus, 
  FileCheck, 
  AlertTriangle, 
  Printer, 
  X, 
  UserX, 
  ShieldX,
  FileText,
  Calendar,
  Check,
  Download,
  FileSpreadsheet,
  Users,
  ShieldAlert
} from 'lucide-react';

interface ViolationRegisterFProps {
  wbpList: WBPRecord[];
  violations: ViolationRecord[];
  onAddViolation: (newViol: Omit<ViolationRecord, 'id' | 'bapNumber'>) => void;
  onPrintBap: (violation: ViolationRecord) => void;
}

export const ViolationRegisterF: React.FC<ViolationRegisterFProps> = ({
  wbpList,
  violations,
  onAddViolation,
  onPrintBap,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'REGISTER_F' | 'WBP_DATABASE'>('REGISTER_F');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBapModal, setShowBapModal] = useState(false);

  // BAP Form State
  const [selectedWbpId, setSelectedWbpId] = useState<string>('');
  const [customWbpName, setCustomWbpName] = useState<string>('');
  const [customWbpRegNumber, setCustomWbpRegNumber] = useState<string>('');
  
  const [violationDetail, setViolationDetail] = useState('');
  
  const [severityPreset, setSeverityPreset] = useState<string>('BERAT');
  const [customSeverity, setCustomSeverity] = useState<string>('BERAT (Pasal 46 Permenkumham No. 8/2024)');
  
  const [punishmentPreset, setPunishmentPreset] = useState<string>('ISOLASI_TUTUPAN_SUNYI');
  const [customPunishment, setCustomPunishment] = useState<string>('Penempatan di Kamar Pengasingan (Straf Cell)');
  
  const [isolationDays, setIsolationDays] = useState<number>(6);
  const [investigatorName, setInvestigatorName] = useState('Sigit Riyanto');

  const handleSelectWbpChange = (wbpId: string) => {
    setSelectedWbpId(wbpId);
    const found = wbpList.find((w) => w.id === wbpId);
    if (found) {
      setCustomWbpName(found.name);
      setCustomWbpRegNumber(found.regNumber);
    }
  };

  const handleSubmitBap = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWbpName = customWbpName.trim();
    const finalWbpRegNumber = customWbpRegNumber.trim();

    if (!finalWbpName) {
      alert('Mohon isi nama WBP pelanggar.');
      return;
    }
    if (!finalWbpRegNumber) {
      alert('Mohon isi nomor registrasi WBP.');
      return;
    }
    if (!violationDetail) {
      alert('Mohon isi uraian kronologi kejadian.');
      return;
    }

    const finalSeverity = customSeverity.trim() || severityPreset;
    const finalPunishment = customPunishment.trim() || punishmentPreset;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    let endDateStr = dateStr;
    if (isolationDays > 0) {
      const end = new Date(now);
      end.setDate(end.getDate() + isolationDays);
      endDateStr = end.toISOString().split('T')[0];
    }

    onAddViolation({
      wbpId: selectedWbpId || `manual-wbp-${Date.now()}`,
      wbpName: finalWbpName,
      wbpRegNumber: finalWbpRegNumber,
      date: dateStr,
      violationDetail,
      severity: finalSeverity as ViolationSeverity,
      punishment: finalPunishment as PunishmentType,
      isolationDays: isolationDays > 0 ? isolationDays : 0,
      isolationStartDate: dateStr,
      isolationEndDate: endDateStr,
      registerFStatus: 'AKTIF',
      investigatorName: investigatorName || 'Sigit Riyanto',
      kplpSignatureApproved: true,
    });

    // Reset Form
    setSelectedWbpId('');
    setCustomWbpName('');
    setCustomWbpRegNumber('');
    setViolationDetail('');
    setIsolationDays(6);
    setShowBapModal(false);
  };

  // Filtered Register F records
  const filteredViolations = violations.filter(
    (v) =>
      v.wbpName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.wbpRegNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.bapNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.violationDetail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // List of all violating WBP for counts & display
  const violatingWbpList = wbpList.filter(
    (w) =>
      w.punishmentStatus !== 'BEBAS_PELANGGARAN' ||
      w.violationCount > 0 ||
      violations.some(
        (v) =>
          v.wbpRegNumber.toLowerCase() === w.regNumber.toLowerCase() ||
          v.wbpName.toLowerCase() === w.name.toLowerCase()
      )
  );

  // Filtered WBP Database strictly for violating WBP based on Search Query
  const filteredWbp = violatingWbpList.filter((w) => {
    const query = searchQuery.toLowerCase();
    return (
      w.name.toLowerCase().includes(query) ||
      w.regNumber.toLowerCase().includes(query) ||
      w.block.toLowerCase().includes(query) ||
      w.crime.toLowerCase().includes(query)
    );
  });

  // Print All Violating WBP Report
  const handlePrintAllViolatingWbp = () => {
    const appLogoUrl = getStoredAppLogo();
    const kplpTtdUrl = localStorage.getItem('kemenimipas_kplp_ttd') || null;
    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Consolidate unique map of violating WBP
    const mapViolators = new Map<
      string,
      {
        wbpName: string;
        regNumber: string;
        nik?: string;
        block: string;
        severity: string;
        violationDetail: string;
        punishment: string;
        isolationDays?: number;
        isolationStart?: string;
        isolationEnd?: string;
        bapNumber?: string;
      }
    >();

    // 1. Add records from violations
    violations.forEach((v) => {
      const key = (v.wbpRegNumber || v.wbpName).toLowerCase();
      const foundWbp = wbpList.find(
        (w) => w.regNumber.toLowerCase() === v.wbpRegNumber.toLowerCase() || w.name.toLowerCase() === v.wbpName.toLowerCase()
      );
      mapViolators.set(key, {
        wbpName: v.wbpName,
        regNumber: v.wbpRegNumber,
        nik: foundWbp?.nik || '-',
        block: foundWbp ? `${foundWbp.block} (Kmr ${foundWbp.roomNumber})` : 'Blok Hunian',
        severity: v.severity || 'BERAT',
        violationDetail: v.violationDetail,
        punishment: v.punishment,
        isolationDays: v.isolationDays,
        isolationStart: v.isolationStartDate,
        isolationEnd: v.isolationEndDate,
        bapNumber: v.bapNumber,
      });
    });

    // 2. Add records from wbpList with non-clean status
    wbpList.forEach((w) => {
      if (w.punishmentStatus !== 'BEBAS_PELANGGARAN' || w.violationCount > 0) {
        const key = (w.regNumber || w.name).toLowerCase();
        if (!mapViolators.has(key)) {
          mapViolators.set(key, {
            wbpName: w.name,
            regNumber: w.regNumber,
            nik: w.nik,
            block: `${w.block} (Kmr ${w.roomNumber})`,
            severity: w.punishmentStatus === 'ISOLASI_AKTIF' ? 'BERAT' : 'SEDANG',
            violationDetail: `Pelanggaran Tata Tertib Lapas (${w.crime})`,
            punishment: w.punishmentStatus.replace(/_/g, ' '),
          });
        }
      }
    });

    const listToPrint = Array.from(mapViolators.values());

    const printHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Rekapitulasi Keseluruhan WBP Melanggar - Lapas Kelas IIB Batang</title>
  <style>
    @page {
      size: 215mm 330mm;
      margin-top: 3cm;
      margin-right: 2cm;
      margin-bottom: 2cm;
      margin-left: 2cm;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #000;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .logo {
      width: 68px;
      height: 68px;
      object-fit: contain;
      margin-right: 12px;
    }
    .header-text {
      text-align: center;
      flex: 1;
    }
    .header-text h4 {
      margin: 0;
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .header-text h3 {
      margin: 2px 0 0 0;
      font-size: 11pt;
      font-weight: 800;
      text-transform: uppercase;
    }
    .header-text h2 {
      margin: 2px 0 0 0;
      font-size: 12.5pt;
      font-weight: 900;
      text-transform: uppercase;
    }
    .header-text p {
      margin: 2px 0 0 0;
      font-size: 8.5pt;
      color: #333;
    }
    .doc-title {
      text-align: center;
      margin: 16px 0 12px 0;
    }
    .doc-title h3 {
      margin: 0;
      font-size: 11pt;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
    }
    .doc-title p {
      margin: 4px 0 0 0;
      font-size: 9pt;
      color: #333;
    }
    .summary-box {
      margin-bottom: 12px;
      font-size: 9pt;
      border: 1px solid #666;
      padding: 8px 12px;
      background-color: #f8fafc;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 9pt;
    }
    table, th, td {
      border: 1px solid #444;
    }
    th {
      background-color: #e2e8f0;
      padding: 6px;
      text-align: center;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 8.5pt;
    }
    td {
      padding: 6px;
      vertical-align: top;
    }
    .center {
      text-align: center;
    }
    .font-mono {
      font-family: monospace;
      font-weight: bold;
      color: #1d4ed8;
    }
    .badge-red {
      color: #991b1b;
      font-weight: bold;
    }
    .signatures {
      margin-top: 36px;
      display: flex;
      justify-content: flex-end;
      font-size: 9.5pt;
      text-align: center;
      page-break-inside: avoid;
    }
    .sig-col {
      width: 42%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 140px;
    }
    .sig-image-slot {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sig-image-slot img {
      max-height: 60px;
      max-width: 180px;
      object-fit: contain;
    }
    .font-underline {
      text-decoration: underline;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    ${appLogoUrl ? `<img src="${appLogoUrl}" class="logo" alt="Logo" />` : `<svg class="logo" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="#1e3a8a"/><path d="M50 15 L80 80 L20 80 Z" fill="#fbbf24"/></svg>`}
    <div class="header-text">
      <h4>KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN</h4>
      <h3>KANTOR WILAYAH JAWA TENGAH</h3>
      <h2>LEMBAGA PEMASYARAKATAN KELAS IIB BATANG</h2>
      <p>Jalan Raya Batang KM 4.1 Rowobelang, Kabupaten Batang | Telp: (0285) 391042</p>
    </div>
  </div>

  <div class="doc-title">
    <h3>DAFTAR REKAPITULASI KESELURUHAN WBP MELANGGAR TATA TERTIB & REGISTER F</h3>
    <p>LAPAS KELAS IIB BATANG - TANGGAL CETAK: ${todayStr}</p>
  </div>

  <div class="summary-box">
    <div><strong>Total WBP Melanggar:</strong> ${listToPrint.length} Orang</div>
    <div><strong>Unit Pengamanan:</strong> Kesatuan Pengamanan Lapas (KPLP)</div>
    <div><strong>Status Register F:</strong> Aktif Dalam Pengawasan</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 4%;">NO</th>
        <th style="width: 22%;">NAMA WBP / NIK</th>
        <th style="width: 14%;">NO. REGISTRASI</th>
        <th style="width: 16%;">BLOK & KAMAR</th>
        <th style="width: 24%;">PELANGGARAN & KRONOLOGI</th>
        <th style="width: 20%;">SANKSI DISIPLIN</th>
      </tr>
    </thead>
    <tbody>
      ${listToPrint.map((item, idx) => `
        <tr>
          <td class="center font-bold">${idx + 1}</td>
          <td>
            <strong>${item.wbpName}</strong>
            ${item.nik ? `<br/><span style="font-size: 8pt; color: #555;">NIK: ${item.nik}</span>` : ''}
          </td>
          <td class="font-mono center">${item.regNumber}</td>
          <td>${item.block}</td>
          <td>
            <strong class="badge-red">[PELANGGARAN ${item.severity}]</strong><br/>
            ${item.violationDetail}
            ${item.bapNumber ? `<br/><span style="font-size: 8pt; color: #444;">No. BAP: ${item.bapNumber}</span>` : ''}
          </td>
          <td>
            <strong>${item.punishment.replace(/_/g, ' ')}</strong>
            ${item.isolationDays ? `<br/><span style="font-size: 8.5pt; color: #991b1b;">Sel Isolasi: ${item.isolationDays} Hari (${item.isolationStart || ''} s/d ${item.isolationEnd || ''})</span>` : ''}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-col">
      <div>
        <p style="margin: 0;">Batang, ${todayStr}</p>
        <p style="font-weight: bold; margin: 4px 0;">Kepala Kesatuan Pengamanan Lapas (KPLP),</p>
      </div>
      <div class="sig-image-slot">
        ${kplpTtdUrl ? `<img src="${kplpTtdUrl}" alt="TTD Ka. KPLP" />` : ''}
      </div>
      <div>
        <p class="font-underline" style="margin: 0;">M. SYUKRON, S.H., M.H.</p>
        <p style="font-size: 8.5pt; color: #555; margin: 2px 0 0 0;">NIP. 19840312 200801 1 002</p>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

    try {
      const printWin = window.open('', '_blank', 'width=900,height=950');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(printHtml);
        printWin.document.close();
      } else {
        window.focus();
        window.print();
      }
    } catch (err) {
      console.error('Error opening print window:', err);
      window.focus();
      window.print();
    }
  };

  // Download All Kronologi CSV
  const handleExportKronologiCsv = () => {
    const today = new Date().toISOString().split('T')[0];
    const rows: string[][] = [
      ['LAPAS KELAS IIB BATANG - REKAPITULASI LAPORAN KRONOLOGI KEJADIAN PELANGGARAN WBP'],
      ['Tanggal Unduh:', today],
      ['Total Records Pelanggaran:', `${filteredViolations.length} Catatan`],
      [],
      ['NO', 'NO BAP', 'TANGGAL', 'NAMA WBP', 'NO REGISTRASI', 'TINGKAT PELANGGARAN', 'KRONOLOGI KEJADIAN', 'SANKSI DISIPLIN', 'MASA SEL ISOLASI', 'PEJABAT PEMERIKSA']
    ];

    filteredViolations.forEach((viol, idx) => {
      rows.push([
        (idx + 1).toString(),
        viol.bapNumber,
        viol.date,
        viol.wbpName,
        viol.wbpRegNumber,
        viol.severity,
        viol.violationDetail.replace(/\n/g, ' '),
        viol.punishment.replace(/_/g, ' '),
        viol.isolationDays ? `${viol.isolationDays} Hari (${viol.isolationStartDate} s/d ${viol.isolationEndDate})` : '-',
        viol.investigatorName
      ]);
    });

    const csvContent = rows
      .map((e) => e.map((cell) => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Kronologi_Kejadian_Pelanggaran_WBP_Lapas_Batang_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download Single Kronologi TXT Report
  const handleDownloadSingleKronologiTxt = (viol: ViolationRecord) => {
    const content = `================================================================================
LAPORAN KRONOLOGI KEJADIAN PELANGGARAN WBP
LAPAS KELAS IIB BATANG - KEMENIMIPAS
================================================================================
Nomor BAP           : ${viol.bapNumber}
Tanggal Kejadian    : ${viol.date}
Pemeriksa / KPLP    : ${viol.investigatorName}

--------------------------------------------------------------------------------
1. NAMA WBP
--------------------------------------------------------------------------------
${viol.wbpName}

--------------------------------------------------------------------------------
2. NO REGISTRASI
--------------------------------------------------------------------------------
${viol.wbpRegNumber}

--------------------------------------------------------------------------------
3. KRONOLOGI KEJADIAN
--------------------------------------------------------------------------------
Tingkat Pelanggaran : Pelanggaran ${viol.severity} (Permenkumham No. 6 Tahun 2013)

Uraian Kronologi Kejadian Lengkap:
${viol.violationDetail}

--------------------------------------------------------------------------------
4. SANKSI DISIPLIN
--------------------------------------------------------------------------------
Bentuk Sanksi Disiplin  : ${viol.punishment.replace(/_/g, ' ')}
${viol.isolationDays ? `Masa Sel Isolasi        : ${viol.isolationDays} Hari (${viol.isolationStartDate} s/d ${viol.isolationEndDate})` : 'Masa Sel Isolasi        : -'}

--------------------------------------------------------------------------------
Ditetapkan di Batang, ${viol.date}
Kepala Kesatuan Pengamanan Lapas (KPLP)

M. SYUKRON, S.H., M.H.
NIP. 19840312 200801 1 002
================================================================================
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Kronologi_${viol.wbpRegNumber}_${viol.bapNumber.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="violation-register-f-container" className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold text-white">Data Pelanggaran WBP</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Pencatatan resmi Nama WBP, No Registrasi, Kronologi Kejadian, dan Sanksi Disiplin Warga Binaan Pemasyarakatan Lapas Kelas IIB Batang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handlePrintAllViolatingWbp}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95"
            title="Cetak seluruh daftar WBP yang melanggar tata tertib / Register F (PDF / F4)"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Keseluruhan WBP Melanggar</span>
          </button>

          <button
            type="button"
            onClick={handleExportKronologiCsv}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95"
            title="Download seluruh rekap kronologi kejadian ke file CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Rekap Kronologi (CSV)</span>
          </button>

          <button
            id="btn-open-bap-modal"
            onClick={() => setShowBapModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Data Pelanggaran</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Toggle Subtabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveSubTab('REGISTER_F')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'REGISTER_F'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Data Pelanggaran & Kronologi ({violations.length})
          </button>
          <button
            onClick={() => setActiveSubTab('WBP_DATABASE')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'WBP_DATABASE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar WBP Melanggar ({violatingWbpList.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activeSubTab === 'REGISTER_F'
                ? 'Cari nama WBP, No Reg, kronologi...'
                : 'Cari WBP, No. Reg, Blok, Perkara...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

      </div>

      {/* SUBTAB 1: Data Pelanggaran List */}
      {activeSubTab === 'REGISTER_F' && (
        <div className="space-y-4">
          {filteredViolations.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs shadow-sm">
              Belum ada catatan Data Pelanggaran WBP yang ditemukan.
            </div>
          ) : (
            filteredViolations.map((viol) => (
              <div
                key={viol.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm hover:border-slate-300 transition-colors"
              >
                {/* Header Card */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
                      {viol.bapNumber}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Tanggal Kejadian: {viol.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase ${
                        viol.severity === 'BERAT'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : viol.severity === 'SEDANG'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Pelanggaran {viol.severity}
                    </span>

                    <span className="text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded">
                      REGISTER F AKTIF
                    </span>
                  </div>
                </div>

                {/* 4 Primary Required Fields Grid: Nama WBP, No Registrasi, Kronologi Kejadian, Sanksi Disiplin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Field 1: Nama WBP */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 block">
                      1. Nama WBP:
                    </span>
                    <h4 className="text-base font-black text-slate-900">{viol.wbpName}</h4>
                  </div>

                  {/* Field 2: No Registrasi */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 block">
                      2. No Registrasi:
                    </span>
                    <p className="font-mono text-base font-black text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100 inline-block">
                      {viol.wbpRegNumber}
                    </p>
                  </div>

                  {/* Field 3: Kronologi Kejadian (Full Width) */}
                  <div className="md:col-span-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 block flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      3. Kronologi Kejadian:
                    </span>
                    <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-slate-200">
                      {viol.violationDetail}
                    </p>
                  </div>

                  {/* Field 4: Sanksi Disiplin (Full Width) */}
                  <div className="md:col-span-2 bg-red-50/60 border border-red-200 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-black text-red-800 block">
                        4. Sanksi Disiplin:
                      </span>
                      <span className="text-slate-900 font-extrabold text-sm">
                        {viol.punishment.replace(/_/g, ' ')}
                        {viol.isolationDays ? ` (${viol.isolationDays} Hari Sel Isolasi)` : ''}
                      </span>
                    </div>

                    {viol.isolationStartDate && (
                      <div className="text-slate-600 font-medium bg-white px-3 py-1.5 rounded border border-red-100 text-xs">
                        Masa Isolasi: <strong className="text-red-700">{viol.isolationStartDate}</strong> s/d <strong className="text-red-700">{viol.isolationEndDate}</strong>
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer Action Buttons for Download Laporan Kronologi */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div>
                    Pemeriksa / KPLP: <strong className="text-slate-700">{viol.investigatorName}</strong>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleKronologiTxt(viol)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition-colors"
                      title="Download laporan kronologi WBP ini sebagai file teks"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unduh Kronologi (.txt)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onPrintBap(viol)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak / Download PDF Laporan Kronologi</span>
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* SUBTAB 2: WBP Database (Khusus Melanggar) */}
      {activeSubTab === 'WBP_DATABASE' && (
        <div className="space-y-3">
          {/* Subtab Database Action Bar */}
          <div className="bg-red-50/80 border border-red-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <h3 className="font-bold text-xs">Daftar Khusus WBP Melanggar Tata Tertib & Register F</h3>
                <p className="text-[11px] text-red-700">
                  Menampilkan {filteredWbp.length} WBP yang tercatat melakukan pelanggaran disiplin.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrintAllViolatingWbp}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Keseluruhan WBP Melanggar (PDF / Print)</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] uppercase tracking-wider font-bold">
                    <th className="p-3">No. Registrasi</th>
                    <th className="p-3">Nama WBP / NIK</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Blok & Kamar</th>
                    <th className="p-3">Perkara / Kejahatan</th>
                    <th className="p-3">Sisa Pidana</th>
                    <th className="p-3">Status Disiplin / Catatan</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredWbp.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500">
                        Tidak ada data WBP yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredWbp.map((wbp) => {
                      const matchingViol = violations.find(
                        (v) =>
                          v.wbpRegNumber.toLowerCase() === wbp.regNumber.toLowerCase() ||
                          v.wbpName.toLowerCase() === wbp.name.toLowerCase()
                      );
                      const isViolator =
                        wbp.punishmentStatus !== 'BEBAS_PELANGGARAN' ||
                        wbp.violationCount > 0 ||
                        !!matchingViol;

                      return (
                        <tr
                          key={wbp.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isViolator ? 'bg-red-50/20' : ''
                          }`}
                        >
                          <td className="p-3 font-mono font-bold text-blue-600">{wbp.regNumber}</td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900">{wbp.name}</span>
                                {isViolator && (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                    WBP MELANGGAR
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                NIK: {wbp.nik}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                wbp.status === 'TAHANAN'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {wbp.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold block text-slate-800">{wbp.block}</span>
                            <span className="text-slate-500 text-[10px]">
                              Kamar {wbp.roomNumber}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 max-w-xs truncate">{wbp.crime}</td>
                          <td className="p-3 text-slate-500">{wbp.sentence}</td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  wbp.punishmentStatus === 'ISOLASI_AKTIF'
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : wbp.punishmentStatus === 'REGISTER_F_AKTIF'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : isViolator
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {wbp.punishmentStatus !== 'BEBAS_PELANGGARAN'
                                  ? wbp.punishmentStatus.replace(/_/g, ' ')
                                  : isViolator
                                  ? 'REGISTER F AKTIF'
                                  : 'BEBAS PELANGGARAN'}
                              </span>

                              {matchingViol && (
                                <div className="text-[10px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200 space-y-0.5 max-w-xs">
                                  <div className="font-bold text-red-700 flex items-center gap-1">
                                    <span>Pelanggaran {matchingViol.severity}</span>
                                    {matchingViol.isolationDays ? (
                                      <span className="text-slate-500 font-normal">
                                        ({matchingViol.isolationDays} hari isolasi)
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="line-clamp-2 text-slate-600">
                                    {matchingViol.violationDetail}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {matchingViol && (
                                <button
                                  type="button"
                                  onClick={() => onPrintBap(matchingViol)}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded border border-blue-200 transition-colors flex items-center gap-1"
                                  title="Cetak Laporan Kronologi WBP ini"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>Cetak Kronologi</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedWbpId(wbp.id);
                                  setShowBapModal(true);
                                }}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold rounded border border-red-200 transition-colors"
                              >
                                + Catat Pelanggaran
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Input Data Pelanggaran Baru */}
      {showBapModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl p-6 shadow-xl space-y-5 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-800">Form Input Data Pelanggaran WBP</h3>
              </div>
              <button
                onClick={() => setShowBapModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBap} className="space-y-4 text-xs">
              
              {/* Option to Select from DB or Manual Input */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold">1. Pilih WBP atau Input Manual</label>
                  <span className="text-[10px] text-blue-600 font-semibold">Dapat diketik/diedit manual</span>
                </div>

                <div>
                  <select
                    value={selectedWbpId}
                    onChange={(e) => handleSelectWbpChange(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                  >
                    <option value="">-- Pilih dari Database WBP (Otomatis Isi) --</option>
                    {wbpList.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (No Reg: {w.regNumber}) - {w.block}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nama WBP (Input / Edit Manual) *</label>
                    <input
                      type="text"
                      placeholder="Contoh: FAHRUL NANDA BIN TARMANI"
                      value={customWbpName}
                      onChange={(e) => setCustomWbpName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">No. Registrasi WBP (Input / Edit Manual) *</label>
                    <input
                      type="text"
                      placeholder="Contoh: BI.042/2025 atau REG-2026-099"
                      value={customWbpRegNumber}
                      onChange={(e) => setCustomWbpRegNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-blue-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Tingkat Pelanggaran Manual & Preset */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <label className="block text-slate-800 font-bold">2. Tingkat Pelanggaran (Input Manual / Preset)</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <select
                    value={severityPreset}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSeverityPreset(val);
                      if (val === 'BERAT') setCustomSeverity('BERAT (Pasal 46 Permenkumham No. 8/2024)');
                      else if (val === 'SEDANG') setCustomSeverity('SEDANG (Perjudian / Perkelahian Ringan)');
                      else if (val === 'RINGAN') setCustomSeverity('RINGAN (Kerapian / Keluar Kamar)');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="BERAT">Preset BERAT (HP / Narkoba / Sajam)</option>
                    <option value="SEDANG">Preset SEDANG (Keributan / Perjudian)</option>
                    <option value="RINGAN">Preset RINGAN (Kerapian / Keluar Kamar)</option>
                    <option value="CUSTOM">Input Manual Bebas...</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Ketik manual tingkat/pasal pelanggaran..."
                    value={customSeverity}
                    onChange={(e) => setCustomSeverity(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Sanksi Disiplin Manual & Preset */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <label className="block text-slate-800 font-bold">3. Sanksi Disiplin (Input Manual / Preset)</label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <select
                    value={punishmentPreset}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPunishmentPreset(val);
                      if (val === 'ISOLASI_TUTUPAN_SUNYI') setCustomPunishment('Penempatan di Kamar Pengasingan (Straf Cell)');
                      else if (val === 'PENCABUTAN_HAK_REMISI_PB') setCustomPunishment('Pencabutan Hak Remisi / PB / CB');
                      else if (val === 'TEGURAN_TERTULIS') setCustomPunishment('Teguran Tertulis (Pencatatan Register F)');
                      else if (val === 'TEGURAN_LISAN') setCustomPunishment('Teguran Lisan');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ISOLASI_TUTUPAN_SUNYI">Preset Sel Isolasi Tutupan Sunyi (Straf Cell)</option>
                    <option value="PENCABUTAN_HAK_REMISI_PB">Preset Pencabutan Hak Remisi / PB / CB</option>
                    <option value="TEGURAN_TERTULIS">Preset Teguran Tertulis (Register F)</option>
                    <option value="TEGURAN_LISAN">Preset Teguran Lisan</option>
                    <option value="CUSTOM">Input Manual Sanksi...</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Ketik manual uraian sanksi disiplin..."
                    value={customPunishment}
                    onChange={(e) => setCustomPunishment(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-red-950 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <label className="text-slate-700 font-semibold whitespace-nowrap">Lama Sel Isolasi (Hari):</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={isolationDays}
                    onChange={(e) => setIsolationDays(parseInt(e.target.value) || 0)}
                    className="w-24 bg-white border border-slate-300 rounded p-1.5 text-center font-bold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500">(0 jika tidak ada hukuman sel isolasi)</span>
                </div>
              </div>

              {/* Kronologi Kejadian */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Kronologi Kejadian</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan uraian kronologi kejadian secara rinci (waktu, lokasi kejadian, kronologi penemuan barang bukti, saksi-saksi, dan penanganan awal)..."
                  value={violationDetail}
                  onChange={(e) => setViolationDetail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Investigator */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Pemeriksa / Pejabat KPLP</label>
                <input
                  type="text"
                  value={investigatorName}
                  onChange={(e) => setInvestigatorName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBapModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Simpan Data Pelanggaran
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
