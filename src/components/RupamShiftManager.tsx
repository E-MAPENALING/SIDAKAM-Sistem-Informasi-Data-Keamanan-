import React, { useState } from 'react';
import { RupamShift } from '../types';
import { Building, Users, Key, ShieldCheck, CheckCircle2, AlertCircle, Plus, Clock } from 'lucide-react';

interface RupamShiftManagerProps {
  shifts: RupamShift[];
  onAddShift: (newShift: RupamShift) => void;
}

export const RupamShiftManager: React.FC<RupamShiftManagerProps> = ({
  shifts,
  onAddShift,
}) => {
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [reguName, setReguName] = useState('Regu IV (Delta)');
  const [shiftType, setShiftType] = useState<'PAGI (07.00 - 13.00)' | 'SIANG (13.00 - 19.00)' | 'MALAM (19.00 - 07.00)'>('SIANG (13.00 - 19.00)');
  const [danrupamName, setDanrupamName] = useState('');
  const [officerCount, setOfficerCount] = useState(8);
  const [presentOfficers, setPresentOfficers] = useState(8);
  const [wbpCountTahanan, setWbpCountTahanan] = useState(84);
  const [wbpCountNapi, setWbpCountNapi] = useState(268);
  const [htRadiosCount, setHtRadiosCount] = useState(6);
  const [handcuffsCount, setHandcuffsCount] = useState(10);
  const [weaponsLockers, setWeaponsLockers] = useState(true);
  const [keysCheck, setKeysCheck] = useState(true);
  const [cctvStatus, setCctvStatus] = useState<'Normal (24 Kamera Active)' | '2 Kamera Off (Perbaikan)' | 'Kritikal Gangguan'>('Normal (24 Kamera Active)');
  const [handoverNotes, setHandoverNotes] = useState('');

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
    setShowForm(false);
  };

  return (
    <div id="rupam-shift-manager-container" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Serah Terima Regu Pengamanan (RUPAM)</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Berita Acara Serah Terima Shift Regu Jaga, Penghitungan Jumlah WBP, dan Pengecekan Sarana Keamanan.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Form Serah Terima Baru</span>
        </button>
      </div>

      {/* Form Serah Terima RUPAM */}
      {showForm && (
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
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Regu I (Alpha)">Regu I (Alpha)</option>
                  <option value="Regu II (Beta)">Regu II (Beta)</option>
                  <option value="Regu III (Gamma)">Regu III (Gamma)</option>
                  <option value="Regu IV (Delta)">Regu IV (Delta)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Shift Tugas</label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Officers & WBP Count */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Jumlah Personil Terploting</label>
                <input
                  type="number"
                  value={officerCount}
                  onChange={(e) => setOfficerCount(parseInt(e.target.value) || 8)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Personil Hadir Lengkap</label>
                <input
                  type="number"
                  value={presentOfficers}
                  onChange={(e) => setPresentOfficers(parseInt(e.target.value) || 8)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Total WBP Tahanan</label>
                <input
                  type="number"
                  value={wbpCountTahanan}
                  onChange={(e) => setWbpCountTahanan(parseInt(e.target.value) || 84)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Total WBP Narapidana</label>
                <input
                  type="number"
                  value={wbpCountNapi}
                  onChange={(e) => setWbpCountNapi(parseInt(e.target.value) || 268)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-slate-800 text-xs"
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
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
  );
};
