import React, { useState } from 'react';
import { RupamShift, SecurityOfficer } from '../types';
import { getKopSuratHTML } from '../lib/kopSurat';
import { 
  Building, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Search, 
  Phone, 
  UserCheck, 
  BadgeCheck, 
  Edit3, 
  Trash2, 
  Printer, 
  X,
  FileSpreadsheet,
  UserPlus,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

interface RupamShiftManagerProps {
  shifts: RupamShift[];
  officers: SecurityOfficer[];
  onAddShift: (newShift: RupamShift) => void;
  onAddOfficer: (newOfficer: SecurityOfficer) => void;
  onUpdateOfficer: (updatedOfficer: SecurityOfficer) => void;
  onDeleteOfficer: (id: string) => void;
}

export const RupamShiftManager: React.FC<RupamShiftManagerProps> = ({
  shifts,
  officers,
  onAddShift,
  onAddOfficer,
  onUpdateOfficer,
  onDeleteOfficer,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'OFFICERS' | 'SERAH_TERIMA'>('OFFICERS');
  
  // Officer Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReguFilter, setSelectedReguFilter] = useState<string>('ALL');

  // Officer Modal State
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<SecurityOfficer | null>(null);

  // Form Officer State (Simplified to Name, Position, Photo)
  const [formNip, setFormNip] = useState('');
  const [formName, setFormName] = useState('');
  const [formRank, setFormRank] = useState('Penata Muda (III/a)');
  const [formPosition, setFormPosition] = useState('');
  const [formRegu, setFormRegu] = useState('Regu I (Alpha)');
  const [formPhone, setFormPhone] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');

  // Shift Form State
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [reguName, setReguName] = useState('Regu I (Alpha)');
  const [shiftType, setShiftType] = useState<'PAGI (07.00 - 13.00)' | 'SIANG (13.00 - 19.00)' | 'MALAM (19.00 - 07.00)'>('MALAM (19.00 - 07.00)');
  const [danrupamName, setDanrupamName] = useState('NUR FAIZIN');
  const [officerCount, setOfficerCount] = useState(9);
  const [presentOfficers, setPresentOfficers] = useState(9);
  const [wbpCountTahanan, setWbpCountTahanan] = useState(68);
  const [wbpCountNapi, setWbpCountNapi] = useState(287);
  const [weaponsLockers, setWeaponsLockers] = useState(true);
  const [keysCheck, setKeysCheck] = useState(true);
  const [htRadiosCount, setHtRadiosCount] = useState(12);
  const [handcuffsCount, setHandcuffsCount] = useState(15);
  const [cctvStatus, setCctvStatus] = useState<'Normal (24 Kamera Active)' | '2 Kamera Off (Perbaikan)' | 'Kritikal Gangguan'>('Normal (24 Kamera Active)');
  const [handoverNotes, setHandoverNotes] = useState('');

  // Handle Photo File Upload with Canvas Compression (max 400x400 JPEG)
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setFormPhotoUrl(compressedDataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Open modal for add or edit officer
  const handleOpenOfficerModal = (officer?: SecurityOfficer) => {
    if (officer) {
      setEditingOfficer(officer);
      setFormNip(officer.nip || '');
      setFormName(officer.name || '');
      setFormRank(officer.rank || 'Penata Muda (III/a)');
      setFormPosition(officer.position || '');
      setFormRegu(officer.regu || 'Regu I (Alpha)');
      setFormPhone(officer.phone || '');
      setFormPhotoUrl(officer.photoUrl || '');
    } else {
      setEditingOfficer(null);
      setFormNip('');
      setFormName('');
      setFormRank('Penata Muda (III/a)');
      setFormPosition('');
      setFormRegu('Regu I (Alpha)');
      setFormPhone('');
      setFormPhotoUrl('');
    }
    setShowOfficerModal(true);
  };

  const handleSaveOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPosition.trim()) {
      alert('Mohon isi Nama Lengkap dan Jabatan Petugas.');
      return;
    }

    // Auto derive regu based on position if possible
    let derivedRegu = formRegu;
    const posUpper = formPosition.toUpperCase();
    if (posUpper.includes('KPLP') || posUpper.includes('STAF') || posUpper.includes('KAMTIB')) {
      derivedRegu = 'Staf KPLP/Kamtib';
    } else if (posUpper.includes('RUPAM I') || posUpper.includes('ALPHA')) {
      derivedRegu = 'Regu I (Alpha)';
    } else if (posUpper.includes('RUPAM II') || posUpper.includes('BETA')) {
      derivedRegu = 'Regu II (Beta)';
    } else if (posUpper.includes('RUPAM IV') || posUpper.includes('DELTA')) {
      derivedRegu = 'Regu IV (Delta)';
    }

    const finalPhoto = formPhotoUrl.trim();

    if (editingOfficer) {
      onUpdateOfficer({
        ...editingOfficer,
        nip: formNip.trim() || editingOfficer.nip,
        name: formName.trim(),
        rank: formRank.trim() || editingOfficer.rank || 'Penata Muda (III/a)',
        position: formPosition.trim(),
        regu: formRegu || derivedRegu,
        phone: formPhone.trim() || editingOfficer.phone,
        photoUrl: finalPhoto,
      });
    } else {
      onAddOfficer({
        id: 'off-' + Date.now(),
        nip: formNip.trim() || `199${Math.floor(Math.random() * 90 + 10)}0101 ${Math.floor(Math.random() * 900000 + 100000)}`,
        name: formName.trim(),
        rank: formRank.trim() || 'Penata Muda (III/a)',
        position: formPosition.trim(),
        regu: formRegu || derivedRegu || 'Regu I (Alpha)',
        phone: formPhone.trim() || '0812-3456-7890',
        photoUrl: finalPhoto,
      });
    }
    setShowOfficerModal(false);
  };

  const handleSubmitShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!danrupamName || !handoverNotes) {
      alert('Mohon lengkapi Nama Danrupam dan Catatan Serah Terima.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    onAddShift({
      id: 'rupam-' + Date.now(),
      reguName,
      shiftType,
      danrupamName,
      officerCount,
      presentOfficers,
      wbpCountTahanan,
      wbpCountNapi,
      totalWBP: wbpCountTahanan + wbpCountNapi,
      inventoryCheck: {
        weaponsLockers,
        keysCheck,
        htRadiosCount,
        handcuffsCount,
        cctvStatus,
      },
      handoverNotes,
      verifiedByKplp: true,
      date: today,
    });

    setDanrupamName('');
    setHandoverNotes('');
    setShowShiftForm(false);
  };

  // Filter Officers
  const filteredOfficers = officers.filter((off) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      off.name.toLowerCase().includes(q) ||
      (off.nip && off.nip.toLowerCase().includes(q)) ||
      off.position.toLowerCase().includes(q) ||
      off.regu.toLowerCase().includes(q);

    const matchesRegu = selectedReguFilter === 'ALL' || off.regu === selectedReguFilter;

    return matchesSearch && matchesRegu;
  });

  // Print Officers Report
  const handlePrintOfficersReport = () => {
    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const kopHtml = getKopSuratHTML(
      'DAFTAR PERSONIL PETUGAS KEAMANAN LAPAS BATANG',
      `Tanggal Cetak: ${todayStr}`
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daftar Petugas Keamanan Lapas Batang</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 1.8cm;
            }
            body { font-family: Arial, Helvetica, sans-serif; margin: 20px; font-size: 11pt; color: #000; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1.5px solid #000; padding: 8px; text-align: left; font-size: 10pt; vertical-align: middle; }
            th { background-color: #f1f5f9; font-weight: bold; text-align: center; text-transform: uppercase; }
            .text-center { text-align: center; }
            .signature { margin-top: 40px; float: right; width: 280px; text-align: center; font-size: 10pt; }
            .officer-photo { width: 52px; height: 52px; object-fit: cover; border-radius: 50%; border: 1.5px solid #000; display: block; margin: 0 auto; }
            .officer-avatar { width: 48px; height: 48px; border-radius: 50%; background-color: #0f172a; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14pt; margin: 0 auto; }
          </style>
        </head>
        <body>
          ${kopHtml}

          <table>
            <thead>
              <tr>
                <th width="8%">NO</th>
                <th width="22%">FOTO PETUGAS</th>
                <th width="42%">NAMA PETUGAS</th>
                <th width="28%">JABATAN / POS PENJAGAAN</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOfficers.map((o, idx) => `
                <tr>
                  <td class="text-center" style="font-weight: bold;">${idx + 1}</td>
                  <td class="text-center">
                    ${o.photoUrl ? `
                      <img src="${o.photoUrl}" class="officer-photo" alt="${o.name}" />
                    ` : `
                      <div class="officer-avatar">${o.name ? o.name.charAt(0) : 'P'}</div>
                    `}
                  </td>
                  <td style="font-weight: bold; font-size: 11pt;">${o.name}</td>
                  <td style="font-size: 10.5pt; font-weight: 600; color: #1e293b;">${o.position}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="signature">
            <p>Batang, ${todayStr}</p>
            <p>Mengetahui,</p>
            <p style="margin-top: 5px;"><strong>KA. KPLP LAPAS BATANG</strong></p>
            <br><br><br>
            <p><u><strong>SIGIT, S.H., M.H.</strong></u></p>
            <p>NIP. 19780512 200003 1 001</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  return (
    <div id="rupam-shift-manager-container" className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-black text-white tracking-tight">DATA PETUGAS KEAMANAN LAPAS BATANG</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Database Personil Pengamanan, Regu Jaga (RUPAM I - IV), P2U, serta Berita Acara Serah Terima Shift Tugas.
          </p>
        </div>

        {/* Subtab Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-lg border border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('OFFICERS')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'OFFICERS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Petugas ({officers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('SERAH_TERIMA')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'SERAH_TERIMA'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Serah Terima RUPAM ({shifts.length})</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: DAFTAR PETUGAS KEAMANAN */}
      {activeSubTab === 'OFFICERS' && (
        <div className="space-y-4">
          
          {/* Action & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Petugas (Nama, NIP, Jabatan, Regu)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                />
              </div>

              {/* Regu Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedReguFilter}
                  onChange={(e) => setSelectedReguFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Regu & Staf</option>
                  <option value="Staf KPLP/Kamtib">Staf KPLP / Kamtib</option>
                  <option value="Regu I (Alpha)">Regu I (Alpha)</option>
                  <option value="Regu II (Beta)">Regu II (Beta)</option>
                  <option value="Regu IV (Delta)">Regu IV (Delta)</option>
                </select>

                {/* Print Button */}
                <button
                  type="button"
                  onClick={handlePrintOfficersReport}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak (PDF)</span>
                </button>

                {/* Add Officer Button */}
                <button
                  type="button"
                  onClick={() => handleOpenOfficerModal()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Tambah Petugas</span>
                </button>
              </div>

            </div>
          </div>

          {/* Officers List Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOfficers.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                Tidak ada data petugas keamanan yang sesuai kriteria pencarian.
              </div>
            ) : (
              filteredOfficers.map((off) => (
                <div
                  key={off.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-300 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm border-2 border-slate-700 overflow-hidden">
                      {off.photoUrl ? (
                        <img 
                          src={off.photoUrl} 
                          alt={off.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{off.name ? off.name.charAt(0) : 'P'}</span>
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="font-bold text-sm text-slate-900 leading-snug truncate">{off.name}</h4>
                      <div className="inline-block bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                        {off.position}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenOfficerModal(off)}
                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200"
                      title="Edit Data Petugas"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Yakin ingin menghapus data petugas ${off.name}?`)) {
                          onDeleteOfficer(off.id);
                        }
                      }}
                      className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-slate-200"
                      title="Hapus Petugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: SERAH TERIMA SHIFT REGU JAGA */}
      {activeSubTab === 'SERAH_TERIMA' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Berita Acara Serah Terima Regu Pengamanan (RUPAM)
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan perantian shift jaga, jumlah WBP, sarana senjata, & kontrol inventaris.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowShiftForm(!showShiftForm)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Form Serah Terima Shift Baru</span>
            </button>
          </div>

          {/* Form Serah Terima RUPAM */}
          {showShiftForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Form Berita Acara Serah Terima Regu Pengamanan
              </h3>

              <form onSubmit={handleSubmitShift} className="space-y-4 text-xs">
                
                {/* Regu & Shift */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nama Regu Pengamanan</label>
                    <select
                      value={reguName}
                      onChange={(e) => setReguName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    >
                      <option value="Regu I (Alpha)">Regu I (Alpha)</option>
                      <option value="Regu II (Beta)">Regu II (Beta)</option>
                      <option value="Regu IV (Delta)">Regu IV (Delta)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Shift Tugas</label>
                    <select
                      value={shiftType}
                      onChange={(e) => setShiftType(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    >
                      <option value="PAGI (07.00 - 13.00)">PAGI (07.00 - 13.00)</option>
                      <option value="SIANG (13.00 - 19.00)">SIANG (13.00 - 19.00)</option>
                      <option value="MALAM (19.00 - 07.00)">MALAM (19.00 - 07.00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nama Komandan Regu (Danrupam)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Aiptu Triyono, S.H."
                      value={danrupamName}
                      onChange={(e) => setDanrupamName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Officers & WBP Count */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Personil Terploting</label>
                    <input
                      type="number"
                      value={officerCount}
                      onChange={(e) => setOfficerCount(parseInt(e.target.value) || 8)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Personil Hadir Lengkap</label>
                    <input
                      type="number"
                      value={presentOfficers}
                      onChange={(e) => setPresentOfficers(parseInt(e.target.value) || 8)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Total WBP Tahanan</label>
                    <input
                      type="number"
                      value={wbpCountTahanan}
                      onChange={(e) => setWbpCountTahanan(parseInt(e.target.value) || 84)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Total WBP Narapidana</label>
                    <input
                      type="number"
                      value={wbpCountNapi}
                      onChange={(e) => setWbpCountNapi(parseInt(e.target.value) || 268)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                  </div>
                </div>

                {/* Inventaris Checks */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <span className="text-slate-800 font-bold block">Pengecekan Sarpras & Inventaris Keamanan:</span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="check-weapons"
                        checked={weaponsLockers}
                        onChange={(e) => setWeaponsLockers(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <label htmlFor="check-weapons" className="text-slate-700 font-medium">
                        Senjata Api & Amunisi Terkunci Aman
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="check-keys"
                        checked={keysCheck}
                        onChange={(e) => setKeysCheck(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <label htmlFor="check-keys" className="text-slate-700 font-medium">
                        Kunci Seluruh Blok Hunian Lengkap
                      </label>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Status Kamera CCTV</label>
                      <select
                        value={cctvStatus}
                        onChange={(e) => setCctvStatus(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-slate-800 text-xs font-semibold"
                      >
                        <option value="Normal (24 Kamera Active)">Normal (24 Kamera Active)</option>
                        <option value="2 Kamera Off (Perbaikan)">2 Kamera Off (Perbaikan)</option>
                        <option value="Kritikal Gangguan">Kritikal Gangguan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Catatan Serah Terima Tugas & Instruksi Khusus</label>
                  <textarea
                    rows={2}
                    placeholder="Catatan kondisi lingkungan, kontrol blok, atau pesan khusus untuk regu berikutnya..."
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowShiftForm(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                  >
                    Simpan Berita Acara Serah Terima
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* History of RUPAM Shifts */}
          <div className="space-y-4">
            {shifts.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded">
                      {s.reguName}
                    </span>
                    <span className="text-xs text-slate-700 font-semibold bg-slate-100 px-2.5 py-1 rounded">
                      Shift: {s.shiftType}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Tanggal: {s.date}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi KPLP
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-slate-500 font-semibold block">Danrupam & Personil:</span>
                    <h4 className="text-sm font-bold text-slate-800">{s.danrupamName}</h4>
                    <p className="text-slate-600">
                      Hadir: <strong className="text-emerald-700">{s.presentOfficers}</strong> / {s.officerCount} Anggota
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-slate-500 font-semibold block">Penghitungan Jumlah WBP:</span>
                    <p className="text-slate-800 font-bold text-sm">
                      Total {s.totalWBP} Orang Lengkap
                    </p>
                    <p className="text-slate-500">
                      Tahanan: {s.wbpCountTahanan} | Narapidana: {s.wbpCountNapi}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-slate-500 font-semibold block">Inventaris & Sarpras:</span>
                    <p className="text-slate-600">
                      Senjata Api & Kunci: <strong className="text-emerald-700">AMAN TERKUNCI</strong>
                    </p>
                    <p className="text-slate-500">
                      HT Radio: {s.inventoryCheck.htRadiosCount} Unit | CCTV: {s.inventoryCheck.cctvStatus}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100 text-xs text-slate-700">
                  <span className="text-slate-500 font-semibold block mb-1">Catatan Serah Terima:</span>
                  <p>{s.handoverNotes}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* MODAL: Tambah / Edit Data Petugas Keamanan */}
      {showOfficerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>{editingOfficer ? 'Edit Data Petugas Keamanan' : 'Tambah Petugas Keamanan Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowOfficerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOfficer} className="space-y-3 text-xs">
              
              {/* Photo Upload & Preview Section */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden border-2 border-slate-700 shadow-xs">
                  {formPhotoUrl ? (
                    <img src={formPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <span className="text-slate-800 font-bold block text-xs">Foto Resmi Petugas</span>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                      <Upload className="w-3 h-3" />
                      <span>Upload Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                    </label>
                    {formPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormPhotoUrl('')}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="Atau paste URL Foto (https://...)"
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  placeholder="Contoh: SIGIT, S.H., M.H. / RISKI, A.Md.P / DODI / ASIDIKI"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 19850101 200801 1 001"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pangkat / Golongan</label>
                  <input
                    type="text"
                    list="rank-options"
                    placeholder="Pilih atau ketik Pangkat/Gol"
                    value={formRank}
                    onChange={(e) => setFormRank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="rank-options">
                    <option value="Pembina Utama (IV/e)" />
                    <option value="Pembina Utama Muda (IV/c)" />
                    <option value="Pembina (IV/a)" />
                    <option value="Penata Tk. I (III/d)" />
                    <option value="Penata (III/c)" />
                    <option value="Penata Muda Tk. I (III/b)" />
                    <option value="Penata Muda (III/a)" />
                    <option value="Pengatur Tk. I (II/d)" />
                    <option value="Pengatur (II/c)" />
                    <option value="Pengatur Muda Tk. I (II/b)" />
                    <option value="Pengatur Muda (II/a)" />
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jabatan / Pos Penjagaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ka. KPLP, Staf KPLP, Karupam I, Wakarupam I, Danrupam, Petugas P2U"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Regu / Unit Kerja</label>
                  <select
                    value={formRegu}
                    onChange={(e) => setFormRegu(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Staf KPLP/Kamtib">Staf KPLP/Kamtib</option>
                    <option value="Regu I (Alpha)">Regu I (Alpha)</option>
                    <option value="Regu II (Beta)">Regu II (Beta)</option>
                    <option value="Regu IV (Delta)">Regu IV (Delta)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">No. HP / WhatsApp (Kontak Darurat)</label>
                <input
                  type="text"
                  placeholder="Contoh: 0812-3456-7890"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOfficerModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Simpan Data Petugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
