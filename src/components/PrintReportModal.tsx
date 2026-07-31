import React, { useState, useEffect } from 'react';
import { ViolationRecord } from '../types';
import { Printer, Download, X, FileText, Upload, PenTool, RotateCcw } from 'lucide-react';
import { ImipasLogo, setStoredAppLogo, getStoredAppLogo } from './ImipasLogo';
import { getKopSuratHTML } from '../lib/kopSurat';
import { compressImage } from '../lib/imageUtils';

interface PrintReportModalProps {
  violation: ViolationRecord | null;
  onClose: () => void;
}

const formatDateIndonesian = (dateStr?: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${months[monthIdx]} ${year}`;
    }
  }
  return dateStr;
};

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  violation,
  onClose,
}) => {
  const [infoSource, setInfoSource] = useState<string>('.......................');
  const [infoSubject, setInfoSubject] = useState<string>('.......................');
  
  // Custom Logo and Signature states
  const [appLogoUrl, setAppLogoUrl] = useState<string | null>(getStoredAppLogo);
  const [kplpTtdUrl, setKplpTtdUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('kemenimipas_kplp_ttd') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      setAppLogoUrl(getStoredAppLogo());
    };
    window.addEventListener('app_logo_changed', handleUpdate);
    return () => window.removeEventListener('app_logo_changed', handleUpdate);
  }, []);

  if (!violation) return null;

  const formattedDate = formatDateIndonesian(violation.date);

  const handlePrint = () => {
    try {
      // 1. Try to open clean popup print window
      const printWin = window.open('', '_blank', 'width=850,height=950');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(generatePrintHTML());
        printWin.document.close();
      } else {
        // 2. Fallback to direct print if popup was blocked
        window.focus();
        setTimeout(() => {
          window.print();
        }, 150);
      }
    } catch (err) {
      console.error('Error triggering print popup:', err);
      window.focus();
      window.print();
    }
  };

  const handleDirectPrint = () => {
    window.focus();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const generatePrintHTML = () => {
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Kronologi Awal Pelanggaran Disiplin WBP - ${violation.wbpName}</title>
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
      font-size: 11pt;
      line-height: 1.5;
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
    .title {
      text-align: center;
      margin: 16px 0 12px 0;
    }
    .title h3 {
      margin: 0;
      font-size: 11pt;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
    }
    .statement {
      text-indent: 32px;
      text-align: justify;
      font-size: 10.5pt;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 10pt;
    }
    table, th, td {
      border: 1px solid #666;
    }
    td {
      padding: 6px 10px;
    }
    .bg-gray {
      background-color: #f1f5f9;
      font-weight: bold;
      width: 30%;
    }
    .text-red {
      color: #b91c1c;
      font-weight: bold;
      text-transform: uppercase;
    }
    .text-blue {
      color: #1d4ed8;
      font-family: monospace;
      font-weight: bold;
    }
    .punishment-box {
      margin: 12px 0;
    }
    .punishment-title {
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      font-size: 10.5pt;
      margin-bottom: 6px;
    }
    .punishment-card {
      border: 1px solid #fca5a5;
      background-color: #fef2f2;
      padding: 10px;
      text-align: center;
      font-weight: 900;
      font-size: 10.5pt;
      text-transform: uppercase;
      color: #450a0a;
      border-radius: 4px;
    }
    .closing-text {
      text-align: justify;
      font-size: 10pt;
      margin-top: 10px;
      line-height: 1.5;
    }
    .signatures {
      margin-top: 36px;
      display: flex;
      justify-content: space-between;
      font-size: 10pt;
      text-align: center;
    }
    .sig-col {
      width: 45%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 160px;
    }
    .sig-image-slot {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sig-image-slot img {
      max-height: 64px;
      max-width: 180px;
      object-fit: contain;
    }
    .font-underline {
      text-decoration: underline;
      font-weight: bold;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  ${getKopSuratHTML('LAPORAN KRONOLOGI AWAL PELANGGARAN DISIPLIN WARGA BINAAN')}

  <p class="statement">
    Pada hari ini, tanggal <strong>${formattedDate}</strong>, berdasarkan informasi dari <strong>${infoSource || '.......................'}</strong> terkait dengan <strong>${infoSubject || '.......................'}</strong> KPLP melakukan pemeriksaan awal terhadap Warga Binaan Pemasyarakatan (WBP) berikut:
  </p>

  <table>
    <tr>
      <td class="bg-gray">Nama WBP</td>
      <td><strong>${violation.wbpName}</strong></td>
    </tr>
    <tr>
      <td class="bg-gray">No. Registrasi</td>
      <td class="text-blue">${violation.wbpRegNumber}</td>
    </tr>
    <tr>
      <td class="bg-gray">Tingkat Pelanggaran</td>
      <td class="text-red">${violation.severity}</td>
    </tr>
    <tr>
      <td class="bg-gray">Kronologi Kejadian</td>
      <td style="white-space: pre-line;">${violation.violationDetail}</td>
    </tr>
  </table>

  <div class="punishment-box">
    <div class="punishment-title">SANKSI DISIPLIN KPLP:</div>
    <p style="font-size: 10pt; margin: 4px 0 8px 0; text-align: justify;">
      Berdasarkan uraian kronologi kejadian dan pemeriksaan bukti, KPLP Lapas Kelas IIB Batang menetapkan sanksi disiplin kepada WBP bersangkutan:
    </p>
    <div class="punishment-card">
      SANKSI DISIPLIN: ${violation.punishment.replace(/_/g, ' ')}
      ${violation.isolationDays ? ` (${violation.isolationDays} HARI SEL ISOLASI: ${violation.isolationStartDate || ''} s/d ${violation.isolationEndDate || ''})` : ''}
    </div>
    <p class="closing-text">
      Demikian laporan kronologi kejadian ini disampaikan. Selanjutnya mohon kiranya Kepala Seksi Administrasi Keamanan dan Ketertiban (Kasi Adm. Kamtib) Lapas Kelas IIB Batang berkenan melakukan pemeriksaan lebih lanjut terhadap warga binaan tersebut serta mengambil langkah-langkah sesuai dengan peraturan perundang-undangan yang berlaku.
    </p>
  </div>

  <div class="signatures">
    <div class="sig-col">
      <div>
        <p style="visibility: hidden; margin: 0;">Batang, ${formattedDate}</p>
        <p style="font-weight: bold; margin: 4px 0;">WBP Pelanggar,</p>
      </div>
      <div class="sig-image-slot"></div>
      <div>
        <p class="font-underline" style="margin: 0;">${violation.wbpName}</p>
      </div>
    </div>

    <div class="sig-col">
      <div>
        <p style="margin: 0;">Batang, ${formattedDate}</p>
        <p style="font-weight: bold; margin: 4px 0;">Kepala Kesatuan Pengamanan Lapas (KPLP),</p>
      </div>
      <div class="sig-image-slot">
        ${kplpTtdUrl ? `<img src="${kplpTtdUrl}" alt="TTD Ka. KPLP" />` : ''}
      </div>
      <div>
        <p class="font-underline" style="margin: 0;">${violation.investigatorName || 'M. SYUKRON, S.H., M.H.'}</p>
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
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 300, 300, 0.75);
      if (compressed) {
        setStoredAppLogo(compressed);
        setAppLogoUrl(compressed);
      }
    } catch (err) {
      console.error('Error compressing logo:', err);
    }
  };

  const handleResetLogo = () => {
    setStoredAppLogo(null);
    setAppLogoUrl(null);
  };

  const handleTtdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 200, 0.75);
      if (compressed) {
        setKplpTtdUrl(compressed);
        try {
          localStorage.setItem('kemenimipas_kplp_ttd', compressed);
        } catch (err) {
          console.error('Error saving TTD:', err);
        }
      }
    } catch (err) {
      console.error('Error compressing TTD:', err);
    }
  };

  const handleResetTtd = () => {
    setKplpTtdUrl(null);
    try {
      localStorage.removeItem('kemenimipas_kplp_ttd');
    } catch (err) {
      console.error('Error removing TTD:', err);
    }
  };

  const handleDownloadKronologiTxt = () => {
    const content = `KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA
DIREKTORAT JENDERAL PEMASYARAKATAN
KANTOR WILAYAH JAWA TENGAH
LEMBAGA PEMASYARAKATAN KELAS IIB BATANG
Jalan Raya Batang KM 4.1 Rowobelang, Kabupaten Batang
Laman: lapasbatang.kemenkumham.go.id Email: lapasbatang@gmail.com
================================================================================

LAPORAN KRONOLOGI AWAL PELANGGARAN DISIPLIN WARGA BINAAN

Nama WBP            : ${violation.wbpName}
No. Registrasi      : ${violation.wbpRegNumber}
Tanggal Kejadian    : ${formattedDate}
Tingkat Pelanggaran : ${violation.severity}

--------------------------------------------------------------------------------
URAIAN KRONOLOGI KEJADIAN LENGKAP:
--------------------------------------------------------------------------------
${violation.violationDetail}

--------------------------------------------------------------------------------
SANKSI DISIPLIN:
${violation.punishment.replace(/_/g, ' ')} ${violation.isolationDays ? `(${violation.isolationDays} HARI SEL ISOLASI)` : ''}

Demikian laporan kronologi kejadian ini disampaikan. Selanjutnya mohon kiranya Kepala Seksi Administrasi Keamanan dan Ketertiban (Kasi Adm. Kamtib) Lapas Kelas IIB Batang berkenan melakukan pemeriksaan lebih lanjut terhadap warga binaan tersebut serta mengambil langkah-langkah sesuai dengan peraturan perundang-undangan yang berlaku.
--------------------------------------------------------------------------------

Batang, ${formattedDate}
Kepala Kesatuan Pengamanan Lapas (KPLP),

${violation.investigatorName || 'M. SYUKRON, S.H., M.H.'}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Kronologi_Awal_${violation.wbpRegNumber}_${violation.date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static printable-modal-overlay">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl p-8 shadow-2xl space-y-6 my-8 border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 printable-sheet">
        
        {/* Header Action Controls (Hidden when printing) */}
        <div className="flex flex-col gap-4 pb-4 border-b border-slate-200 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-800">Laporan Kronologi Awal Pelanggaran Disiplin WBP</h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadKronologiTxt}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Download File Teks Kronologi Kejadian"
              >
                <Download className="w-4 h-4" /> Unduh Teks (.txt)
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Buka dokumen di jendela baru & panggil dialog cetak F4 / simpan PDF"
              >
                <Printer className="w-4 h-4" /> Cetak / PDF
              </button>
              <button
                type="button"
                onClick={handleDirectPrint}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Cetak langsung di halaman ini (Ctrl+P)"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Langsung
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Control Panel: Informasi + Upload Logo & TTD */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Informasi Dari (Isi / Titik-titik):</label>
                <input
                  type="text"
                  placeholder="misal: Petugas Regu Pengamanan III"
                  value={infoSource}
                  onChange={(e) => setInfoSource(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 font-sans text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Terkait Dengan (Isi / Titik-titik):</label>
                <input
                  type="text"
                  placeholder="misal: temuan barang terlarang HP"
                  value={infoSubject}
                  onChange={(e) => setInfoSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 font-sans text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Upload Logo & TTD Section */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Upload Logo Kop Surat */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-blue-600" /> Upload Logo Kop Surat
                  </span>
                  {appLogoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="text-[10px] text-red-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Logo
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Format: PNG, JPG, SVG. Logo otomatis tampil di Kop Surat.
                </p>
              </div>

              {/* Upload TTD Ka KPLP */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-blue-600" /> Upload TTD Ka. KPLP
                  </span>
                  {kplpTtdUrl && (
                    <button
                      type="button"
                      onClick={handleResetTtd}
                      className="text-[10px] text-red-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Hapus TTD
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTtdUpload}
                  className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Format PNG transparan disarankan. Tampil di atas nama Ka. KPLP.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="space-y-6 text-xs text-slate-900 leading-relaxed font-serif p-4 md:p-8 bg-white border border-slate-200 shadow-xs rounded-lg print:border-none print:shadow-none print:p-0">
          
          {/* Kop Surat Resmi */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 gap-3">
            {appLogoUrl ? (
              <img src={appLogoUrl} alt="Logo Kop" className="w-16 h-16 object-contain shrink-0" />
            ) : (
              <ImipasLogo className="w-16 h-16 shrink-0" />
            )}
            <div className="text-center flex-1 space-y-0.5">
              <h4 className="font-bold text-xs uppercase tracking-wider">KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN</h4>
              <h3 className="font-extrabold text-xs uppercase">KANTOR WILAYAH JAWA TENGAH</h3>
              <h2 className="font-black text-sm uppercase">LEMBAGA PEMASYARAKATAN KELAS IIB BATANG</h2>
              <p className="text-[10px] font-sans text-slate-600">
                Jalan Raya Batang KM 4.1 Rowobelang, Kabupaten Batang | Telp: (0285) 391042
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1 pt-2">
            <h3 className="font-bold text-sm underline uppercase tracking-wide">
              LAPORAN KRONOLOGI AWAL PELANGGARAN DISIPLIN WARGA BINAAN
            </h3>
          </div>

          {/* Statement */}
          <p className="indent-8 text-justify font-sans">
            Pada hari ini, tanggal <strong>{formattedDate}</strong>, berdasarkan informasi dari <strong>{infoSource || '.......................'}</strong> terkait dengan <strong>{infoSubject || '.......................'}</strong> KPLP melakukan pemeriksaan awal terhadap Warga Binaan Pemasyarakatan (WBP) berikut:
          </p>

          {/* WBP & Kronologi Table */}
          <table className="w-full border border-slate-400 my-2 text-xs font-sans">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold w-1/3 bg-slate-100">Nama WBP</td>
                <td className="p-2 font-bold text-slate-900">{violation.wbpName}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-100">No. Registrasi</td>
                <td className="p-2 font-mono font-bold text-blue-700">{violation.wbpRegNumber}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-100">Tingkat Pelanggaran</td>
                <td className="p-2 font-bold uppercase text-red-700">{violation.severity}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold bg-slate-100 align-top">Kronologi Kejadian</td>
                <td className="p-2 text-slate-800 leading-normal whitespace-pre-line">{violation.violationDetail}</td>
              </tr>
            </tbody>
          </table>

          {/* Punishment Decision */}
          <div className="space-y-3 pt-2 font-sans">
            <h4 className="font-bold underline uppercase text-slate-900">SANKSI DISIPLIN KPLP:</h4>
            <p className="text-justify">
              Berdasarkan uraian kronologi kejadian dan pemeriksaan bukti, KPLP Lapas Kelas IIB Batang menetapkan sanksi disiplin kepada WBP bersangkutan:
            </p>
            <div className="p-3 bg-red-50 border border-red-300 font-black text-center text-sm uppercase text-red-950 rounded">
              SANKSI DISIPLIN: {violation.punishment.replace(/_/g, ' ')}
              {violation.isolationDays ? ` (${violation.isolationDays} HARI SEL ISOLASI: ${violation.isolationStartDate} s/d ${violation.isolationEndDate})` : ''}
            </div>
            <p className="text-justify pt-2 leading-relaxed text-slate-900">
              Demikian laporan kronologi kejadian ini disampaikan. Selanjutnya mohon kiranya Kepala Seksi Administrasi Keamanan dan Ketertiban (Kasi Adm. Kamtib) Lapas Kelas IIB Batang berkenan melakukan pemeriksaan lebih lanjut terhadap warga binaan tersebut serta mengambil langkah-langkah sesuai dengan peraturan perundang-undangan yang berlaku.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-sans">
            <div className="flex flex-col justify-between min-h-[160px]">
              <div>
                <p className="invisible">Batang, {formattedDate}</p>
                <p className="font-bold">WBP Pelanggar,</p>
              </div>
              <div className="h-16 flex items-center justify-center my-1">
                <div className="h-14"></div>
              </div>
              <div>
                <p className="font-bold underline">{violation.wbpName}</p>
                <p className="text-[10px] text-slate-600 invisible">NIP. -</p>
              </div>
            </div>

            <div className="flex flex-col justify-between min-h-[160px]">
              <div>
                <p>Batang, {formattedDate}</p>
                <p className="font-bold">Kepala Kesatuan Pengamanan Lapas (KPLP),</p>
              </div>
              
              {/* Digital Signature Slot */}
              <div className="h-16 flex items-center justify-center my-1">
                {kplpTtdUrl ? (
                  <img
                    src={kplpTtdUrl}
                    alt="TTD Ka. KPLP"
                    className="max-h-16 max-w-[180px] object-contain"
                  />
                ) : (
                  <div className="h-14"></div>
                )}
              </div>

              <div>
                <p className="font-bold underline">{violation.investigatorName || 'M. SYUKRON, S.H., M.H.'}</p>
                <p className="text-[10px] text-slate-600">NIP. 19840312 200801 1 002</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};



