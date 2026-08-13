import React, { useState } from 'react';
import { WBPRecord, ViolationRecord, ViolationSeverity, PunishmentType } from '../types';
import { getStoredAppLogo } from './ImipasLogo';
import { getKopSuratHTML } from '../lib/kopSurat';
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
  ShieldAlert,
  Upload,
  Paperclip,
  Eye,
  FileUp,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  UserCheck
} from 'lucide-react';

interface ViolationRegisterFProps {
  wbpList: WBPRecord[];
  violations: ViolationRecord[];
  onAddViolation: (newViol: Omit<ViolationRecord, 'id' | 'bapNumber'>) => void;
  onPrintBap: (violation: ViolationRecord) => void;
  onUpdateViolation?: (violation: ViolationRecord) => void;
}

export const ViolationRegisterF: React.FC<ViolationRegisterFProps> = ({
  wbpList,
  violations,
  onAddViolation,
  onPrintBap,
  onUpdateViolation,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'REGISTER_F' | 'WBP_DATABASE'>('REGISTER_F');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBapModal, setShowBapModal] = useState(false);

  // Document preview modal state
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<{
    name: string;
    url: string;
    wbpName: string;
    bapNumber: string;
  } | null>(null);

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

  // File Upload State for Surat Kronologi Kejadian
  const [chronologyDocName, setChronologyDocName] = useState<string>('');
  const [chronologyDocUrl, setChronologyDocUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleSelectWbpChange = (wbpId: string) => {
    setSelectedWbpId(wbpId);
    const found = wbpList.find((w) => w.id === wbpId);
    if (found) {
      setCustomWbpName(found.name);
      setCustomWbpRegNumber(found.regNumber);
    }
  };

  // Upload file in Form Modal
  const handleFormFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setChronologyDocName(file.name);
      setChronologyDocUrl(dataUrl);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Gagal membaca file. Silakan coba file lain.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Generate Sample Standard Kronologi PDF for fast testing
  const handleGenerateSampleDoc = () => {
    const dummyName = customWbpName || 'WBP Pelanggar';
    const sampleText = `SURAT KRONOLOGI KEJADIAN PELANGGARAN TATA TERTIB
LAPAS KELAS IIB BATANG - KEMENIMIPAS

NAMA WBP MELANGGAR : ${dummyName.toUpperCase()}
NO REGISTRASI      : ${customWbpRegNumber || 'BI.000/2026'}
TANGGAL KEJADIAN   : ${new Date().toLocaleDateString('id-ID')}
LOKASI             : Blok Hunian Lapas Kelas IIB Batang

URAIAN KRONOLOGI:
1. Pukul 08.30 WIB, Petugas Pengamanan melakukan razia rutin.
2. Ditemukan barang terlarang tersembunyi di area hunian.
3. WBP mengakui kepemilikan dan kooperatif saat pemeriksaan awal.
4. BAP dibuat oleh Tim Kesatuan Pengamanan Lapas (KPLP).

Ditetapkan oleh: Pejabat Pemeriksa KPLP Lapas Kelas IIB Batang.`;

    const blob = new Blob([sampleText], { type: 'text/plain;charset=utf-8' });
    const reader = new FileReader();
    reader.onload = () => {
      setChronologyDocName(`Surat_Kronologi_${dummyName.replace(/\s+/g, '_')}.txt`);
      setChronologyDocUrl(reader.result as string);
    };
    reader.readAsDataURL(blob);
  };

  // Direct Upload to existing violation card
  const handleDirectUploadToViolation = (viol: ViolationRecord, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated: ViolationRecord = {
        ...viol,
        chronologyDocName: file.name,
        chronologyDocUrl: dataUrl,
      };
      if (onUpdateViolation) {
        onUpdateViolation(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitBap = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWbpName = customWbpName.trim();
    let finalWbpRegNumber = customWbpRegNumber.trim();

    if (!finalWbpName) {
      alert('Mohon pilih atau masukkan nama tahanan / WBP yang melanggar.');
      return;
    }

    if (!finalWbpRegNumber) {
      const foundInList = wbpList.find(
        (w) => w.name.toLowerCase() === finalWbpName.toLowerCase() || w.id === selectedWbpId
      );
      if (foundInList) {
        finalWbpRegNumber = foundInList.regNumber;
      } else {
        finalWbpRegNumber = `BI.${Math.floor(Math.random() * 800 + 100)}/2026`;
      }
    }

    const finalDetail = violationDetail.trim() || 
      `Terlampir Surat Kronologi Kejadian Pelanggaran Tata Tertib Lapas Kelas IIB Batang atas nama ${finalWbpName} (${chronologyDocName || 'Dokumen Resmi Kronologi KPLP'}).`;

    const finalSeverity = customSeverity.trim() || severityPreset || 'BERAT';
    const finalPunishment = customPunishment.trim() || punishmentPreset || 'Penempatan di Kamar Pengasingan (Straf Cell)';

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
      violationDetail: finalDetail,
      severity: finalSeverity as ViolationSeverity,
      punishment: finalPunishment as PunishmentType,
      isolationDays: isolationDays > 0 ? isolationDays : 6,
      isolationStartDate: dateStr,
      isolationEndDate: endDateStr,
      registerFStatus: 'AKTIF',
      investigatorName: investigatorName || 'KPLP Lapas Batang (Bpk. M. Syukron, S.H.)',
      kplpSignatureApproved: true,
      chronologyDocName: chronologyDocName || (customWbpName ? `Surat_Kronologi_${finalWbpName.replace(/\s+/g, '_')}.pdf` : undefined),
      chronologyDocUrl: chronologyDocUrl || undefined,
    });

    // Reset Form
    setSelectedWbpId('');
    setCustomWbpName('');
    setCustomWbpRegNumber('');
    setViolationDetail('');
    setIsolationDays(6);
    setChronologyDocName('');
    setChronologyDocUrl('');
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
        docName?: string;
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
        docName: v.chronologyDocName,
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
  ${getKopSuratHTML('DAFTAR REKAPITULASI KESELURUHAN WBP MELANGGAR TATA TERTIB & REGISTER F', `LAPAS KELAS IIB BATANG - TANGGAL CETAK: ${todayStr}`)}

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
        <th style="width: 24%;">PELANGGARAN & SURAT KRONOLOGI</th>
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
            ${item.docName ? `<br/><span style="font-size: 8pt; color: #1e40af; font-weight: bold;">📄 Surat Kronologi: ${item.docName}</span>` : ''}
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
      ['NO', 'NO BAP', 'TANGGAL', 'NAMA WBP MELANGGAR', 'NO REGISTRASI', 'TINGKAT PELANGGARAN', 'KRONOLOGI KEJADIAN', 'SURAT KRONOLOGI', 'SANKSI DISIPLIN', 'MASA SEL ISOLASI', 'PEJABAT PEMERIKSA']
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
        viol.chronologyDocName || 'Tidak Ada Lampiran',
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
1. NAMA WBP YANG MELANGGAR
--------------------------------------------------------------------------------
${viol.wbpName}

--------------------------------------------------------------------------------
2. NO REGISTRASI WBP
--------------------------------------------------------------------------------
${viol.wbpRegNumber}

--------------------------------------------------------------------------------
3. KRONOLOGI KEJADIAN & SURAT LAMPIRAN
--------------------------------------------------------------------------------
Tingkat Pelanggaran : Pelanggaran ${viol.severity}
Surat Kronologi     : ${viol.chronologyDocName || 'Tidak ada berkas terlampir'}

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
            <h2 className="text-lg font-bold text-white">Data Pelanggaran WBP & Surat Kronologi Kejadian</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Pencatatan resmi Nama WBP Melanggar, No Registrasi, Upload Surat Kronologi Kejadian, dan Sanksi Disiplin Warga Binaan Pemasyarakatan Lapas Kelas IIB Batang.
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
            <span>+ Input Data Pelanggaran & Surat Kronologi</span>
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
            Data Pelanggaran & Surat Kronologi ({violations.length})
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
              Belum ada catatan Data Pelanggaran WBP yang ditemukan. Klik button "+ Input Data Pelanggaran & Surat Kronologi" untuk menambahkan.
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

                {/* Primary Required Fields Grid: Nama WBP, No Registrasi, Surat Kronologi, Kronologi Kejadian, Sanksi Disiplin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Field 1: Nama WBP yang Melanggar */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 block flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-red-600" />
                      1. Nama WBP yang Melanggar:
                    </span>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      {viol.wbpName}
                    </h4>
                  </div>

                  {/* Field 2: No Registrasi */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 block">
                      2. No. Registrasi WBP:
                    </span>
                    <p className="font-mono text-base font-black text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded border border-blue-100 inline-block">
                      {viol.wbpRegNumber}
                    </p>
                  </div>

                  {/* Field 3: Surat / Dokumen Kronologi Kejadian (Lampiran PDF / Doc / Image) */}
                  <div className="md:col-span-2 bg-blue-50/50 p-3.5 rounded-lg border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-900 block flex items-center gap-1.5">
                        <Paperclip className="w-4 h-4 text-blue-600" />
                        Surat / Dokumen Kronologi Kejadian:
                      </span>
                      {viol.chronologyDocUrl ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Dokumen Terlampir
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Belum Ada Berkas Terlampir
                        </span>
                      )}
                    </div>

                    {viol.chronologyDocUrl ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-blue-200 shadow-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate text-xs">
                              {viol.chronologyDocName || 'Surat_Kronologi_Kejadian.pdf'}
                            </p>
                            <span className="text-[10px] text-slate-500 block">Dokumen Resmi Lapas Kelas IIB Batang</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDocForPreview({
                                name: viol.chronologyDocName || 'Surat_Kronologi_Kejadian.pdf',
                                url: viol.chronologyDocUrl || '',
                                wbpName: viol.wbpName,
                                bapNumber: viol.bapNumber,
                              });
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Surat Kronologi</span>
                          </button>

                          <a
                            href={viol.chronologyDocUrl}
                            download={viol.chronologyDocName || 'Surat_Kronologi.pdf'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md border border-slate-300 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-dashed border-slate-300">
                        <span className="text-slate-500 text-xs">
                          Belum melampirkan file surat kronologi kejadian. Unggah file (PDF/Gambar/Word) untuk melengkapi arsip.
                        </span>
                        <label className="cursor-pointer flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-md border border-blue-200 transition-colors shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>+ Upload Surat Kronologi</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                            className="hidden"
                            onChange={(e) => handleDirectUploadToViolation(viol, e)}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Field 4: Uraian Kronologi Kejadian (Teks) */}
                  <div className="md:col-span-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 block flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      4. Uraian Kronologi Kejadian (Ringkasan):
                    </span>
                    <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-slate-200">
                      {viol.violationDetail}
                    </p>
                  </div>

                  {/* Field 5: Sanksi Disiplin (Full Width) */}
                  <div className="md:col-span-2 bg-red-50/60 border border-red-200 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-black text-red-800 block">
                        5. Sanksi Disiplin:
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
                      <span>Unduh Ringkasan (.txt)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onPrintBap(viol)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak / PDF Laporan Kronologi</span>
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
                                  setCustomWbpName(wbp.name);
                                  setCustomWbpRegNumber(wbp.regNumber);
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

      {/* Modal Form Input Data Pelanggaran & Upload Surat Kronologi Baru */}
      {showBapModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl p-6 shadow-xl space-y-5 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-800">Form Input Data Pelanggaran WBP & Surat Kronologi</h3>
              </div>
              <button
                onClick={() => setShowBapModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBap} className="space-y-4 text-xs">
              
              {/* SECTION 1: Pilih / Masukkan Nama Tahanan atau WBP */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-900 font-extrabold text-sm flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-red-600" />
                    1. Nama Tahanan atau WBP yang Melanggar *
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    Pilih dari daftar / Ketik manual
                  </span>
                </div>

                {/* Option A: Select from Database */}
                <div>
                  <label className="block text-slate-600 text-[11px] font-semibold mb-1">Pilih dari Daftar Database Tahanan / WBP:</label>
                  <select
                    value={selectedWbpId}
                    onChange={(e) => handleSelectWbpChange(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  >
                    <option value="">-- Pilih Nama Tahanan / WBP --</option>
                    {wbpList.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (No Reg: {w.regNumber}) - {w.block} Kamar {w.roomNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Option B: Custom Name & Reg Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nama Tahanan / WBP (Ketik Bebas) *</label>
                    <input
                      type="text"
                      placeholder="Contoh: FAHRUL NANDA BIN TARMANI"
                      value={customWbpName}
                      onChange={(e) => setCustomWbpName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">No. Registrasi (Otomatis jika dipilih)</label>
                    <input
                      type="text"
                      placeholder="Contoh: BI.042/2026 atau REG-2026-001"
                      value={customWbpRegNumber}
                      onChange={(e) => setCustomWbpRegNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-xs text-blue-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Upload Surat / Dokumen Kronologi Kejadian */}
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-blue-950 font-extrabold text-sm flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    2. Unggah Surat Kronologi Kejadian *
                  </label>
                  <span className="text-[10px] text-blue-800 font-semibold bg-white px-2 py-0.5 rounded border border-blue-200">
                    PDF, Scanned Doc, Foto, DOCX, TXT
                  </span>
                </div>

                {chronologyDocUrl ? (
                  <div className="bg-white p-3.5 rounded-xl border border-blue-300 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-900 block truncate text-xs">
                          {chronologyDocName}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" /> Berkas Surat Kronologi Berhasil Diunggah
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setChronologyDocName('');
                        setChronologyDocUrl('');
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 flex items-center gap-1 font-bold text-[11px]"
                      title="Ganti berkas"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-white text-center hover:bg-blue-50/50 transition-colors">
                      <FileUp className="w-9 h-9 text-blue-500 mx-auto mb-2" />
                      <h4 className="text-slate-800 font-black text-xs mb-1">
                        Pilih File Surat Kronologi Kejadian
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-3 max-w-md mx-auto">
                        Unggah berkas resmi surat kronologi kejadian (Surat KPLP, Laporan Penemuan, Berita Acara, Foto Barang Bukti, dll)
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-2.5">
                        <label className="cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all active:scale-95 inline-flex items-center gap-1.5">
                          <Upload className="w-4 h-4" />
                          <span>Pilih / Unggah Berkas</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                            onChange={handleFormFileUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleGenerateSampleDoc}
                          className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs border border-slate-300 transition-colors"
                          title="Buat dokumen standar untuk tes langsung"
                        >
                          Gunakan Template Dokumen Standard
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Uraian Singkat / Catatan Opsional */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-slate-700 font-bold text-xs mb-1">Catatan Uraian Ringkas (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Temuan HP saat razia blok / Keributan antar tahanan"
                  value={violationDetail}
                  onChange={(e) => setViolationDetail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBapModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-bold rounded-lg shadow-sm text-xs flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan Data Pelanggaran & Kronologi</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal View Surat Kronologi Preview */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{selectedDocForPreview.name}</h3>
                  <p className="text-[10px] text-slate-300">
                    WBP: {selectedDocForPreview.wbpName} | No. BAP: {selectedDocForPreview.bapNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedDocForPreview.url}
                  download={selectedDocForPreview.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File</span>
                </a>
                <button
                  onClick={() => setSelectedDocForPreview(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center">
              {selectedDocForPreview.url.startsWith('data:image') ? (
                <img
                  src={selectedDocForPreview.url}
                  alt={selectedDocForPreview.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md border border-slate-300"
                />
              ) : selectedDocForPreview.url.startsWith('data:text') ? (
                <iframe
                  src={selectedDocForPreview.url}
                  title="Document Preview"
                  className="w-full h-[55vh] bg-white p-4 rounded-lg border border-slate-300 font-mono text-xs text-slate-800"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-xl border border-slate-200 max-w-lg space-y-3 shadow-xs">
                  <FileText className="w-12 h-12 text-blue-600 mx-auto" />
                  <h4 className="font-bold text-slate-900 text-sm">{selectedDocForPreview.name}</h4>
                  <p className="text-xs text-slate-600">
                    Dokumen telah dilampirkan secara resmi pada catatan pelanggaran WBP {selectedDocForPreview.wbpName}.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <a
                      href={selectedDocForPreview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Buka File di Jendela Baru</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
