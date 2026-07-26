import React, { useState, useEffect } from 'react';
import { Siren, ShieldAlert, PhoneCall, Radio, CheckCircle2, X } from 'lucide-react';

interface EmergencyPanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerEmergencyIncident: (title: string, location: string) => void;
}

export const EmergencyPanicModal: React.FC<EmergencyPanicModalProps> = ({
  isOpen,
  onClose,
  onTriggerEmergencyIncident,
}) => {
  const [location, setLocation] = useState('P2U (Pintu Utama)');
  const [emergencyType, setEmergencyType] = useState('Percobaan Pelarian / Escape');
  const [audioPlaying, setAudioPlaying] = useState(true);

  if (!isOpen) return null;

  const handleBroadcast = () => {
    onTriggerEmergencyIncident(
      `DARURAT KPLP: ${emergencyType} di ${location}`,
      location
    );
    alert(`ALARM SIRENE KPLP TERTEMBAK! Broadcast darurat ke seluruh HT Pos Penjagaan Lapas Batang telah dikirim.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-red-300 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Top Warning Stripe */}
        <div className="bg-red-600 text-white font-bold text-center py-2 px-4 rounded-lg flex items-center justify-center gap-2 tracking-wider text-xs uppercase shadow-sm">
          <Siren className="w-4 h-4" />
          <span>PANIC BUTTON - INSIDEN DARURAT KPLP</span>
          <Siren className="w-4 h-4" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-extrabold text-red-700 uppercase tracking-tight">
            PERINGATAN BAHAYA REAL-TIME
          </h3>
          <p className="text-xs text-slate-600">
            Aktifkan pengetatan P2U, Kunci Seluruh Pintu Blok Hunian, dan Duduki Pos Menara Atas 1-4.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Form Location */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">Titik Lokasi Insiden Darurat</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="P2U (Pintu Utama)">P2U (Pintu Utama)</option>
              <option value="Blok Alpha (Tahanan)">Blok Alpha (Tahanan)</option>
              <option value="Blok Beta (Narapidana Dewasa)">Blok Beta (Narapidana Dewasa)</option>
              <option value="Pos Menara Atas">Pos Menara Atas 1-4</option>
              <option value="Dapur & Halaman Dalam">Dapur / Halaman Dalam</option>
            </select>
          </div>

          {/* Emergency Type */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">Kategori Keadaan Darurat</label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="Percobaan Pelarian / Escape">Percobaan Pelarian (Escape WBP)</option>
              <option value="Perkelahian Massal / Kerusuhan">Perkelahian Massal / Kerusuhan Blok</option>
              <option value="Ancaman Penyerangan P2U">Ancaman Penyerangan P2U / Orang Luar</option>
              <option value="Kebakaran Sarana Lapas">Kebakaran Sarana / Kamar Hunian</option>
            </select>
          </div>

          {/* SOP Protocol Checklist */}
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 space-y-2 text-slate-700">
            <span className="text-red-700 font-bold block flex items-center gap-1 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600" /> SOP Penanganan Darurat KPLP:
            </span>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
              <li>P2U: Tutup dan gembok Pintu Utama 1 dan 2 secara instant.</li>
              <li>RUPAM: Lakukan sterilisasi selasar dan masukkan WBP ke kamar hunian.</li>
              <li>Menara Atas: Ambil posisi siaga senjata api laras panjang.</li>
              <li>Panggilan Darurat: Hubungi Polres Batang & Kodim 0736 Batang jika dibutuhkan.</li>
            </ul>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
          >
            Batal
          </button>
          <button
            onClick={handleBroadcast}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all"
          >
            KIRIM BROADCAST SIRENE DARURAT
          </button>
        </div>

      </div>
    </div>
  );
};
