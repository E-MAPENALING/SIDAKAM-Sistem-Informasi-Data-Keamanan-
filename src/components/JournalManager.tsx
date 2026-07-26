import React, { useState, useRef } from 'react';
import { DailyJournalEntry } from '../types';
import { ImipasLogo, ImipasLogoSVGString } from './ImipasLogo';
import { 
  BookOpen, 
  Plus, 
  Printer, 
  Calendar, 
  Clock, 
  Camera, 
  Upload,
  RotateCcw,
  Trash2, 
  Edit3, 
  X, 
  FileText,
  Building2,
  CheckCircle2,
  Image as ImageIcon,
  Check
} from 'lucide-react';

interface JournalManagerProps {
  journalEntries: DailyJournalEntry[];
  onAddJournalEntry: (entry: Omit<DailyJournalEntry, 'id'>) => void;
  onUpdateJournalEntry: (entry: DailyJournalEntry) => void;
  onDeleteJournalEntry: (id: string) => void;
}

export const JournalManager: React.FC<JournalManagerProps> = ({
  journalEntries,
  onAddJournalEntry,
  onUpdateJournalEntry,
  onDeleteJournalEntry,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyJournalEntry | null>(null);

  // Filter States for Screen
  const [filterMode, setFilterMode] = useState<'single' | 'range'>('single');
  const [selectedDay, setSelectedDay] = useState('Sabtu');
  const [selectedDate, setSelectedDate] = useState('2026-07-25');
  const [filterStartDate, setFilterStartDate] = useState('2026-07-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-07-25');

  // Print Form States
  const [printRangeType, setPrintRangeType] = useState<'single' | 'range'>('range');
  const [printSingleDate, setPrintSingleDate] = useState('2026-07-25');
  const [printSingleDay, setPrintSingleDay] = useState('Sabtu');
  const [printStartDate, setPrintStartDate] = useState('2026-07-01');
  const [printEndDate, setPrintEndDate] = useState('2026-07-25');
  const [printOfficerName, setPrintOfficerName] = useState('DANRUPAM SHIFT OPERASIONAL');
  const [printKaKplpName, setPrintKaKplpName] = useState('M. SYUKRON, S.H.');
  const [printKaKplpNip, setPrintKaKplpNip] = useState('19820412 200212 1 002');

  // Form States
  const [formDay, setFormDay] = useState('Sabtu');
  const [formDate, setFormDate] = useState('2026-07-25');
  const [formTimeRange, setFormTimeRange] = useState('07.30 s/d selesai');
  const [formDescription, setFormDescription] = useState('');
  const [formDocUrl, setFormDocUrl] = useState('');
  const [formOfficer, setFormOfficer] = useState('');
  const [formLocation, setFormLocation] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);

  // Custom Logo Kop Surat State (persisted in localStorage)
  const [customKopLogo, setCustomKopLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem('kemenimipas_custom_kop_logo') || null;
    } catch {
      return null;
    }
  });

  // Custom Signature TTD State (persisted in localStorage)
  const [customSignature, setCustomSignature] = useState<string | null>(() => {
    try {
      return localStorage.getItem('kemenimipas_custom_signature') || null;
    } catch {
      return null;
    }
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCustomKopLogo(result);
          try {
            localStorage.setItem('kemenimipas_custom_kop_logo', result);
          } catch (err) {
            console.error('Failed to save custom logo:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setCustomKopLogo(null);
    try {
      localStorage.removeItem('kemenimipas_custom_kop_logo');
    } catch (err) {
      console.error('Failed to remove custom logo:', err);
    }
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCustomSignature(result);
          try {
            localStorage.setItem('kemenimipas_custom_signature', result);
          } catch (err) {
            console.error('Failed to save signature image:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetSignature = () => {
    setCustomSignature(null);
    try {
      localStorage.removeItem('kemenimipas_custom_signature');
    } catch (err) {
      console.error('Failed to remove signature image:', err);
    }
    if (signatureFileInputRef.current) {
      signatureFileInputRef.current.value = '';
    }
  };

  // Sample preset photo options for fast documentation assignment
  const presetPhotos = [
    {
      url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80',
      label: 'Kontrol Keliling Blok Hunian'
    },
    {
      url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80',
      label: 'Pengarahan Pekerja Bimker'
    },
    {
      url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      label: 'Apel Astekpam & Kontrol Malam'
    },
    {
      url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
      label: 'Pemeriksaan Pos P2U & Gerbang'
    }
  ];

  const handleOpenAddModal = () => {
    setEditingEntry(null);
    setFormDay(selectedDay);
    setFormDate(selectedDate);
    setFormTimeRange('07.30 s/d selesai');
    setFormDescription('');
    setFormDocUrl('');
    setFormOfficer('');
    setFormLocation('');
    setShowModal(true);
  };

  const handleOpenEditModal = (entry: DailyJournalEntry) => {
    setEditingEntry(entry);
    setFormDay(entry.dayName || 'Sabtu');
    setFormDate(entry.date || '2026-07-25');
    setFormTimeRange(entry.timeRange || '');
    setFormDescription(entry.activityDescription || '');
    setFormDocUrl(entry.documentationUrl || '');
    setFormOfficer(entry.officerName || '');
    setFormLocation(entry.location || '');
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormDocUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription || !formTimeRange) {
      alert('Mohon isi Jam dan Uraian Kegiatan Jurnal Harian.');
      return;
    }

    if (editingEntry) {
      onUpdateJournalEntry({
        ...editingEntry,
        dayName: formDay,
        date: formDate,
        timeRange: formTimeRange,
        activityDescription: formDescription,
        documentationUrl: formDocUrl || presetPhotos[0].url,
        officerName: formOfficer,
        location: formLocation,
      });
    } else {
      onAddJournalEntry({
        dayName: formDay,
        date: formDate,
        timeRange: formTimeRange,
        activityDescription: formDescription,
        documentationUrl: formDocUrl || presetPhotos[0].url,
        documentationCaption: 'DOKUMENTASI KEGIATAN KPLP LAPAS KELAS II B BATANG',
        officerName: formOfficer || 'Petugas KPLP Lapas Batang',
        location: formLocation || 'Lingkungan Dalam Lapas',
      });
    }

    // Reset Form
    setShowModal(false);
    setEditingEntry(null);
  };

  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const day = parts[2];
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return `${day} ${monthNames[monthNum - 1]} ${year}`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const KEMENIMIPAS_LOGO_SVG = ImipasLogoSVGString;

  const handleOpenPrintModal = () => {
    setShowPrintModal(true);
  };

  const handleExecutePrint = () => {
    // Filter entries based on print mode selection
    let printEntries: DailyJournalEntry[] = [];
    let metaHtml = '';
    let printDateTitle = '';

    let activeLogoHtml = '';
    if (customKopLogo) {
      if (customKopLogo.trim().startsWith('<svg')) {
        activeLogoHtml = customKopLogo;
      } else {
        activeLogoHtml = `<img src="${customKopLogo}" style="max-width: 80px; max-height: 80px; width: auto; height: auto; object-fit: contain; display: block; margin: 0 auto;" />`;
      }
    } else {
      activeLogoHtml = KEMENIMIPAS_LOGO_SVG;
    }

    if (printRangeType === 'single') {
      printEntries = journalEntries.filter(e => e.date === printSingleDate);
      const formattedDate = formatIndonesianDate(printSingleDate);
      printDateTitle = `${printSingleDay}, ${formattedDate}`;
      metaHtml = `
        <tr><td style="border:none; padding:2px 10px 2px 0; width:130px;">Hari</td><td style="border:none; padding:2px 0;">: <strong>${printSingleDay}</strong></td></tr>
        <tr><td style="border:none; padding:2px 10px 2px 0;">Tanggal</td><td style="border:none; padding:2px 0;">: <strong>${formattedDate}</strong></td></tr>
      `;
    } else {
      printEntries = journalEntries.filter(e => {
        if (!e.date) return true;
        if (printStartDate && e.date < printStartDate) return false;
        if (printEndDate && e.date > printEndDate) return false;
        return true;
      });
      const startFmt = formatIndonesianDate(printStartDate);
      const endFmt = formatIndonesianDate(printEndDate);
      printDateTitle = `Periode ${startFmt} - ${endFmt}`;
      metaHtml = `
        <tr><td style="border:none; padding:2px 10px 2px 0; width:140px;">Periode Tanggal</td><td style="border:none; padding:2px 0;">: <strong>${startFmt}</strong> s/d <strong>${endFmt}</strong></td></tr>
        <tr><td style="border:none; padding:2px 10px 2px 0;">Total Kegiatan</td><td style="border:none; padding:2px 0;">: <strong>${printEntries.length} Kegiatan Terekam</strong></td></tr>
      `;
    }

    const rowsHtml = printEntries.length === 0 ? `
      <tr>
        <td colSpan="4" style="padding: 24px; text-align: center; font-style: italic; border-bottom: 2px solid #000; font-family: Arial, sans-serif;">
          Tidak ada data kegiatan jurnal harian pada rentang tanggal yang dipilih.
        </td>
      </tr>
    ` : printEntries.map((entry, idx) => `
      <tr style="border-bottom: 1.5pt solid #000; vertical-align: top; page-break-inside: avoid; break-inside: avoid;">
        <td style="border-right: 1.5pt solid #000; padding: 8px 4px; text-align: center; font-weight: bold; font-family: Arial, sans-serif;">${idx + 1}.</td>
        <td style="border-right: 1.5pt solid #000; padding: 8px; text-align: center; font-weight: bold; font-family: Arial, sans-serif;">
          ${entry.timeRange}
          ${printRangeType === 'range' && entry.date ? `<div style="font-size: 8.5pt; font-weight: normal; color: #475569; margin-top: 4px;">${formatIndonesianDate(entry.date)}</div>` : ''}
        </td>
        <td style="border-right: 1.5pt solid #000; padding: 8px 10px; font-family: Arial, sans-serif; font-size: 9.5pt; line-height: 1.5; white-space: pre-line;">
          ${entry.activityDescription}
          ${entry.officerName ? `<div style="margin-top: 6px; font-size: 8.5pt; color: #475569; font-style: italic; font-weight: 600;">Pelaksana: ${entry.officerName} ${entry.location ? `• ${entry.location}` : ''}</div>` : ''}
        </td>
        <td style="padding: 6px; text-align: center; vertical-align: top;">
          <div style="background: #0f172a; border: 1px solid #334155; padding: 5px; border-radius: 4px; color: white; width: 100%; box-sizing: border-box;">
            <div style="background: linear-gradient(to right, #b91c1c, #991b1b, #7f1d1d); padding: 3px 5px; border-radius: 3px; font-size: 8pt; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>DOKUMENTASI KPLP</span>
                <span style="background: #450a0a; padding: 0 4px; border-radius: 2px; font-size: 7pt;">BATANG</span>
              </div>
              <div style="color: #fde047; font-weight: 800; font-size: 7.5pt; margin-top: 1px;">LAPAS KELAS II B BATANG</div>
            </div>
            ${entry.documentationUrl ? `<img src="${entry.documentationUrl}" style="width: 100%; max-height: 130px; object-fit: cover; border-radius: 3px; display: block; margin: 0 auto;" />` : '<div style="padding: 16px 8px; font-size: 8pt; color: #94a3b8;">Foto Dokumentasi</div>'}
          </div>
        </td>
      </tr>
    `).join('');

    const sigDateFormatted = printRangeType === 'range' ? formatIndonesianDate(printEndDate) : formatIndonesianDate(printSingleDate);

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Jurnal Harian KPLP Lapas Kelas IIB Batang - ${printDateTitle}</title>
          <style>
            @page { 
              size: A4 portrait; 
              margin: 2cm !important; 
            }
            *, *:before, *:after {
              box-sizing: border-box !important;
            }
            html, body { 
              font-family: Arial, Helvetica, sans-serif; 
              background: #fff; 
              color: #000; 
              margin: 0; 
              padding: 0; 
              width: 100%;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-kop {
              text-align: center;
              margin-bottom: 18px;
              border-bottom: 3px double #000;
              padding-bottom: 10px;
            }
            .header-kop .instansi {
              font-size: 13pt;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .header-kop .satker {
              font-size: 12pt;
              font-weight: 800;
              text-transform: uppercase;
              margin-top: 2px;
            }
            .header-kop .unit {
              font-size: 11pt;
              font-weight: 700;
              text-transform: uppercase;
              color: #1e293b;
              margin-top: 2px;
            }
            .header-kop .judul {
              font-size: 13pt;
              font-weight: 900;
              font-family: 'Times New Roman', Times, serif;
              text-transform: uppercase;
              margin-top: 10px;
              text-decoration: underline;
              letter-spacing: 1px;
            }
            .meta-table {
              width: auto;
              border-collapse: collapse;
              border: none;
              font-size: 10pt;
              font-family: Arial, sans-serif;
              margin-bottom: 14px;
            }
            .meta-table td {
              border: none !important;
              padding: 2px 8px 2px 0;
            }
            table.data-table { 
              width: 100%; 
              table-layout: fixed;
              border-collapse: collapse; 
              border: 2px solid #000; 
              font-size: 10pt; 
            }
            table.data-table th { 
              border: 1.5pt solid #000; 
              padding: 8px 6px; 
              background-color: #f1f5f9; 
              text-align: center; 
              font-weight: bold; 
            }
            table.data-table td { 
              border: 1.5pt solid #000; 
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .footer { 
              margin-top: 35px; 
              display: flex; 
              justify-content: flex-end; 
              text-align: center; 
              font-family: Arial, sans-serif; 
              font-size: 10pt; 
              font-weight: bold; 
              page-break-inside: avoid; 
              break-inside: avoid;
            }
            .footer div { 
              width: 280px; 
            }
            .sig-space { 
              height: 60px; 
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          {/* Official Kop Surat matching user screenshot */}
          <div style="display: flex; align-items: center; justify-content: center; position: relative; border-bottom: 3.5px double #000; padding-bottom: 8px; margin-bottom: 16px;">
            <div style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 85px; display: flex; align-items: center; justify-content: center;">
              ${activeLogoHtml}
            </div>
            <div style="text-align: center; width: 100%; padding-left: 85px; font-family: Arial, Helvetica, sans-serif; color: #000;">
              <div style="font-size: 10.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2px; line-height: 1.25;">KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA</div>
              <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; margin-top: 1px; line-height: 1.25;">DIREKTORAT JENDERAL PEMASYARAKATAN</div>
              <div style="font-size: 9.5pt; font-weight: 800; text-transform: uppercase; margin-top: 1px; line-height: 1.25;">KANTOR WILAYAH JAWA TENGAH</div>
              <div style="font-size: 11.5pt; font-weight: 900; text-transform: uppercase; margin-top: 2px; line-height: 1.25;">LEMBAGA PEMASYARAKATAN KELAS IIB BATANG</div>
              <div style="font-size: 8pt; font-weight: 500; margin-top: 3px; line-height: 1.2;">Jl. Raya Batang KM. 4.1 Rowobelang, Kab. Batang</div>
              <div style="font-size: 8pt; font-weight: 500; margin-top: 1px; line-height: 1.2;">Telp. (0285) 4494300 Fax ; (0285) 4494299 Email : lapasbatang@gmail.com</div>
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 16px;">
            <div style="font-size: 12pt; font-weight: 900; font-family: 'Times New Roman', Times, serif; text-transform: uppercase; text-decoration: underline; letter-spacing: 0.5px;">JURNAL HARIAN KEGIATAN PENGAMANAN</div>
            <div style="font-size: 10pt; font-weight: 800; font-family: Arial, sans-serif; text-transform: uppercase; margin-top: 2px; color: #0f172a;">KESATUAN PENGAMANAN LAPAS (KPLP)</div>
          </div>
          
          <table class="meta-table">
            <tbody>
              ${metaHtml}
            </tbody>
          </table>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 6%;">No</th>
                <th style="width: 16%;">Jam / Waktu</th>
                <th style="width: 50%;">Uraian Kegiatan</th>
                <th style="width: 28%;">Dokumentasi</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div>
              <p style="margin: 0;">Batang, ${sigDateFormatted}<br>Mengetahui,<br>Kepala Kesatuan Pengamanan Lapas</p>
              ${customSignature 
                ? `<div style="height: 60px; display: flex; align-items: center; justify-content: center; margin: 2px 0;"><img src="${customSignature}" style="max-height: 58px; max-width: 180px; width: auto; height: auto; object-fit: contain;" /></div>` 
                : `<div class="sig-space"></div>`
              }
              <p style="margin: 0; text-decoration: underline; font-weight: 800; font-size: 10.5pt;">${printKaKplpName}</p>
              <p style="margin: 2px 0 0 0; font-size: 8.5pt; font-weight: normal;">NIP. ${printKaKplpNip}</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    setShowPrintModal(false);

    try {
      const printWin = window.open('', '_blank', 'width=950,height=800');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(printHtml);
        printWin.document.close();
      } else {
        window.print();
      }
    } catch {
      window.print();
    }
  };

  // Screen filtered entries
  const displayJournalEntries = journalEntries.filter((entry) => {
    if (filterMode === 'single') {
      return !selectedDate || entry.date === selectedDate;
    } else {
      if (!entry.date) return true;
      if (filterStartDate && entry.date < filterStartDate) return false;
      if (filterEndDate && entry.date > filterEndDate) return false;
      return true;
    }
  });

  return (
    <div id="journal-manager-container" className="space-y-6">
      
      {/* Top Header Controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm text-white print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Jurnal Harian KPLP Lapas Kelas IIB Batang</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Buku Catatan Kegiatan Operasional Harian, Kontrol Keliling, dan Dokumentasi Lapangan Pengamanan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kegiatan Jurnal</span>
          </button>

          <button
            onClick={handleOpenPrintModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg border border-blue-600 shadow-sm transition-all shrink-0"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak Jurnal (Pilihan Tanggal & 2cm Margin)</span>
          </button>
        </div>
      </div>

      {/* Date & Day Filter Bar (Hidden in Print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 print:hidden text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Filter Tampilan Jurnal Layar:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setFilterMode('single')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                filterMode === 'single'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Hari (Satu Tanggal)
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('range')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                filterMode === 'range'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rentang Tanggal (Dari - Sampai)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {filterMode === 'single' ? (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Hari:</span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                  <option value="Minggu">Minggu</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-md px-3 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Dari Tanggal:</span>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-md px-3 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Sampai Tanggal:</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-md px-3 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="text-slate-500 font-medium ml-auto">
            Menampilkan: <strong className="text-blue-700">{displayJournalEntries.length} dari {journalEntries.length} Item</strong>
          </div>
        </div>
      </div>

      {/* Official Printed / Screen Journal Document Layout */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-900 font-serif">
        
        {/* Hidden File Input for Logo Kop Surat */}
        <input
          type="file"
          ref={logoFileInputRef}
          onChange={handleLogoUpload}
          accept="image/*,.svg"
          className="hidden"
        />

        {/* Official Header matching the user screenshot */}
        <div className="pb-4 border-b-4 border-double border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          <div className="relative group shrink-0">
            {customKopLogo ? (
              customKopLogo.trim().startsWith('<svg') ? (
                <div className="w-20 h-20 shrink-0 flex items-center justify-center overflow-hidden" dangerouslySetInnerHTML={{ __html: customKopLogo }} />
              ) : (
                <img
                  src={customKopLogo}
                  alt="Logo Kop Surat Custom"
                  className="w-20 h-20 object-contain shrink-0"
                />
              )
            ) : (
              <div className="w-20 h-20 shrink-0 flex items-center justify-center overflow-hidden" dangerouslySetInnerHTML={{ __html: KEMENIMIPAS_LOGO_SVG }} />
            )}
            
            <button
              type="button"
              onClick={() => logoFileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-md text-xs flex items-center justify-center transition-transform hover:scale-110 print:hidden"
              title="Upload Logo Kop Surat Baru"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center flex-1 font-sans text-slate-900 space-y-0.5">
            <div className="text-xs sm:text-sm font-extrabold uppercase tracking-tight">KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA</div>
            <div className="text-xs sm:text-xs font-extrabold uppercase">DIREKTORAT JENDERAL PEMASYARAKATAN</div>
            <div className="text-[11px] sm:text-xs font-bold uppercase">KANTOR WILAYAH JAWA TENGAH</div>
            <div className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">LEMBAGA PEMASYARAKATAN KELAS IIB BATANG</div>
            <div className="text-[11px] font-medium text-slate-700">Jl. Raya Batang KM. 4.1 Rowobelang, Kab. Batang</div>
            <div className="text-[10px] font-medium text-slate-700">Telp. (0285) 4494300 Fax ; (0285) 4494299 Email : lapasbatang@gmail.com</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 print:hidden shrink-0 self-end sm:self-center font-sans">
            <button
              type="button"
              onClick={() => logoFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 shadow-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Ubah Logo Kop</span>
            </button>
            {customKopLogo && (
              <button
                type="button"
                onClick={handleResetLogo}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
                title="Kembalikan ke Logo Default Kemenimipas"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Logo</span>
              </button>
            )}
          </div>
        </div>

        <div className="text-center pt-2 pb-1 space-y-0.5">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 underline font-serif">
            JURNAL HARIAN KEGIATAN PENGAMANAN
          </h2>
          <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-800 font-sans">
            KESATUAN PENGAMANAN LAPAS (KPLP)
          </h3>
        </div>

        {/* Metadata info: Hari & Tanggal */}
        <div className="space-y-1 text-xs sm:text-sm font-bold text-slate-900 max-w-md pl-1">
          {filterMode === 'single' ? (
            <>
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-3">Hari</span>
                <span className="col-span-9">: {selectedDay}</span>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-3">Tanggal</span>
                <span className="col-span-9">: {formatIndonesianDate(selectedDate)}</span>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4">Periode Tanggal</span>
              <span className="col-span-8">: {formatIndonesianDate(filterStartDate)} s/d {formatIndonesianDate(filterEndDate)}</span>
            </div>
          )}
        </div>

        {/* Official Document Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-slate-900 text-xs sm:text-sm text-slate-900 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-900 text-center font-bold">
                <th className="border-r-2 border-slate-900 p-2 sm:p-3 w-10 sm:w-12">
                  No
                </th>
                <th className="border-r-2 border-slate-900 p-2 sm:p-3 w-32 sm:w-44">
                  Jam
                </th>
                <th className="border-r-2 border-slate-900 p-2 sm:p-3 text-center">
                  Uraian Kegiatan
                </th>
                <th className="p-2 sm:p-3 w-48 sm:w-72 text-center">
                  Dokumentasi
                </th>
                <th className="p-2 border-l-2 border-slate-900 w-20 print:hidden text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {displayJournalEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                    Belum ada kegiatan jurnal harian yang diinput untuk kriteria/tanggal ini.
                  </td>
                </tr>
              ) : (
                displayJournalEntries.map((entry, idx) => (
                  <tr key={entry.id} className="border-b-2 border-slate-900 align-top">
                    {/* No */}
                    <td className="border-r-2 border-slate-900 p-2 sm:p-3 text-center font-bold">
                      {idx + 1}.
                    </td>

                    {/* Jam */}
                    <td className="border-r-2 border-slate-900 p-2 sm:p-3 font-bold text-center whitespace-nowrap">
                      {entry.timeRange}
                    </td>

                    {/* Uraian Kegiatan */}
                    <td className="border-r-2 border-slate-900 p-2 sm:p-4 leading-relaxed font-sans text-xs sm:text-sm whitespace-pre-line font-medium text-slate-800">
                      {entry.activityDescription}
                      {entry.officerName && (
                        <div className="mt-2 text-[11px] text-slate-500 font-semibold italic print:text-slate-700">
                          Pelaksana: {entry.officerName} {entry.location ? `• ${entry.location}` : ''}
                        </div>
                      )}
                    </td>

                    {/* Dokumentasi (Photo with KPLP header box matching exact screenshot) */}
                    <td className="p-2 sm:p-3">
                      <div className="bg-slate-900 border border-slate-800 rounded p-2 text-white space-y-2 shadow-sm">
                        {/* Custom Official Red Header Bar as in screenshot */}
                        <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white p-1.5 rounded text-center text-[10px] font-bold tracking-tight uppercase border border-red-600/50">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[9px]">DOKUMENTASI KEGIATAN KPLP</span>
                            <span className="text-[9px] bg-red-950 px-1 rounded border border-red-500/50">
                              BATANG
                            </span>
                          </div>
                          <div className="text-[9px] font-extrabold text-amber-300">
                            LAPAS KELAS II B BATANG
                          </div>
                        </div>

                        {/* Photo Image */}
                        {entry.documentationUrl ? (
                          <div className="relative rounded overflow-hidden bg-slate-950 aspect-video border border-slate-700">
                            <img
                              src={entry.documentationUrl}
                              alt="Dokumentasi Kegiatan KPLP"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="p-6 text-center text-[10px] text-slate-400 italic bg-slate-950 rounded">
                            Foto Dokumentasi Lapangan
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action Column (Edit & Delete item) */}
                    <td className="border-l-2 border-slate-900 p-2 text-center align-middle print:hidden">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(entry)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Baris Jurnal"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteJournalEntry(entry.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Baris Jurnal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Official Approval Box for Print */}
        <div className="pt-8 flex justify-end text-center text-xs sm:text-sm font-sans text-slate-900 font-bold hidden print:flex">
          <div className="w-64 text-center">
            <p className="mb-2">Batang, {formatIndonesianDate(selectedDate)}<br />Mengetahui,<br />Kepala Kesatuan Pengamanan Lapas</p>
            {customSignature ? (
              <div className="h-14 flex items-center justify-center my-1">
                <img src={customSignature} alt="Tanda Tangan Ka. KPLP" className="max-h-14 max-w-[180px] object-contain" />
              </div>
            ) : (
              <div className="h-16"></div>
            )}
            <p className="underline font-extrabold">{printKaKplpName}</p>
            <p className="text-[10px] font-normal">NIP. {printKaKplpNip}</p>
          </div>
        </div>

      </div>

      {/* Modal Input & Edit Jurnal Harian */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl p-6 shadow-xl space-y-5 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">
                  {editingEntry ? 'Edit Jurnal Harian KPLP' : 'Form Input Jurnal Harian KPLP'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Row 1: Hari & Tanggal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Hari</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                    <option value="Minggu">Minggu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jam / Rentang Waktu</label>
                  <input
                    type="text"
                    placeholder="Contoh: 07.30 s/d selesai"
                    value={formTimeRange}
                    onChange={(e) => setFormTimeRange(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Uraian Kegiatan */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Uraian Kegiatan Jurnal</label>
                <textarea
                  rows={4}
                  placeholder="Tulis uraian lengkap kegiatan pengamanan, kontrol area, arahan pekerja, atau inspeksi..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Photo Documentation Section with Computer File Picker */}
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="block text-slate-800 font-bold">Foto Dokumentasi Kegiatan</label>
                
                {/* Local File Upload Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pilih Foto dari Komputer</span>
                  </button>
                  <span className="text-[11px] text-slate-500 font-medium">
                    (Format: JPG, PNG, WEBP — langsung tersimpan & tercetak)
                  </span>
                </div>

                {/* Selected Image Preview */}
                {formDocUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-lg">
                    <img
                      src={formDocUrl}
                      alt="Preview Dokumentasi"
                      className="w-16 h-12 object-cover rounded border border-slate-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 text-[11px]">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Foto Dokumentasi Terpasang
                      </span>
                      <p className="text-slate-500 truncate max-w-xs">{formDocUrl.substring(0, 40)}...</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormDocUrl('')}
                      className="text-red-600 hover:text-red-800 p-1 font-bold text-[11px]"
                    >
                      Hapus Foto
                    </button>
                  </div>
                )}

                {/* Secondary Option: Presets */}
                <div className="pt-2">
                  <span className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Atau Pilih Foto Sample/Preset:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {presetPhotos.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setFormDocUrl(p.url)}
                        className={`cursor-pointer border-2 rounded-lg p-1 transition-all ${
                          formDocUrl === p.url ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-14 object-cover rounded mb-1" referrerPolicy="no-referrer" />
                        <p className="text-[10px] text-slate-700 font-semibold truncate text-center">{p.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Petugas & Lokasi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Petugas Pelaksana (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Aiptu Triyono, S.H. (Danrupam)"
                    value={formOfficer}
                    onChange={(e) => setFormOfficer(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lokasi Kegiatan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Area Blok Hunian & Bimker"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingEntry ? 'Simpan Perubahan' : 'Simpan Jurnal Harian'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Options Cetak Jurnal Harian */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-xs my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Pilihan & Rentang Tanggal Cetak Jurnal Harian</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Option Mode Selection */}
              <div>
                <label className="block text-slate-800 font-bold mb-2">Pilih Mode Cetak Jurnal:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      printRangeType === 'range'
                        ? 'border-blue-600 bg-blue-50/60 font-bold text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="printRangeType"
                      checked={printRangeType === 'range'}
                      onChange={() => setPrintRangeType('range')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div>Rentang Tanggal (Periode)</div>
                      <div className="text-[10px] text-slate-500 font-normal">Cetak data dari tgl A s/d tgl B</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      printRangeType === 'single'
                        ? 'border-blue-600 bg-blue-50/60 font-bold text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="printRangeType"
                      checked={printRangeType === 'single'}
                      onChange={() => setPrintRangeType('single')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div>Satu Tanggal (Harian)</div>
                      <div className="text-[10px] text-slate-500 font-normal">Cetak jurnal 1 hari spesifik</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Date Inputs based on printRangeType */}
              {printRangeType === 'range' ? (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <span className="block font-bold text-slate-800">Pilih Periode Rentang Tanggal:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Dari Tanggal:</label>
                      <input
                        type="date"
                        value={printStartDate}
                        onChange={(e) => setPrintStartDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Sampai Tanggal:</label>
                      <input
                        type="date"
                        value={printEndDate}
                        onChange={(e) => setPrintEndDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <span className="block font-bold text-slate-800">Pilih Hari & Tanggal Harian:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Hari:</label>
                      <select
                        value={printSingleDay}
                        onChange={(e) => setPrintSingleDay(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Senin">Senin</option>
                        <option value="Selasa">Selasa</option>
                        <option value="Rabu">Rabu</option>
                        <option value="Kamis">Kamis</option>
                        <option value="Jumat">Jumat</option>
                        <option value="Sabtu">Sabtu</option>
                        <option value="Minggu">Minggu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Tanggal:</label>
                      <input
                        type="date"
                        value={printSingleDate}
                        onChange={(e) => setPrintSingleDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Logo Kop Surat Configuration in Print Modal */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="block font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-600">Logo Kop Surat Laporan:</span>
                <div className="flex items-center gap-4 bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center border border-slate-200 rounded overflow-hidden p-1 bg-slate-50">
                    {customKopLogo ? (
                      customKopLogo.trim().startsWith('<svg') ? (
                        <div dangerouslySetInnerHTML={{ __html: customKopLogo }} className="w-full h-full" />
                      ) : (
                        <img src={customKopLogo} alt="Logo Kop" className="w-full h-full object-contain" />
                      )
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: KEMENIMIPAS_LOGO_SVG }} className="w-full h-full" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-semibold text-slate-800">
                      {customKopLogo ? 'Menggunakan Logo Kustom Upload' : 'Menggunakan Logo Resmi Kementerian Imigrasi & Pemasyarakatan'}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Logo Baru</span>
                      </button>
                      {customKopLogo && (
                        <button
                          type="button"
                          onClick={handleResetLogo}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Logo Default</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures & Officer info */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="block font-bold text-slate-800">Pengaturan Tanda Tangan Pejabat Mengetahui:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nama Kepala Kesatuan Pengamanan (Ka. KPLP):</label>
                    <input
                      type="text"
                      value={printKaKplpName}
                      onChange={(e) => setPrintKaKplpName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">NIP Ka. KPLP:</label>
                    <input
                      type="text"
                      value={printKaKplpNip}
                      onChange={(e) => setPrintKaKplpNip(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Upload Gambar Tanda Tangan Digital */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <span className="block text-slate-800 font-bold text-xs">Upload Gambar Tanda Tangan Digital (TTD):</span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-28 h-14 bg-white border border-slate-300 rounded-md flex items-center justify-center p-1 overflow-hidden shrink-0">
                        {customSignature ? (
                          <img src={customSignature} alt="Preview TTD Ka. KPLP" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-400 italic text-center">Tanpa TTD (Kosong / Manual)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <p className="font-semibold text-slate-800">Format PNG / JPG (Disarankan PNG Transparan)</p>
                        <p className="text-slate-500">Tanda tangan digital akan dicetak di atas nama Ka. KPLP.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="file"
                        ref={signatureFileInputRef}
                        onChange={handleSignatureUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => signatureFileInputRef.current?.click()}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-2xs flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload TTD</span>
                      </button>
                      {customSignature && (
                        <button
                          type="button"
                          onClick={handleResetSignature}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs rounded flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Hapus TTD</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Info Box */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Presisi Jarak Tepi 2 cm (20mm):</strong> Halaman cetak otomatis menggunakan margin 2 cm di semua sisi (Atas, Bawah, Kiri, Kanan) sesuai standar berkas resmi A4.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecutePrint}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Proses & Cetak PDF (Margin 2cm)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

