import React, { useState } from 'react';
import { IncidentReport, BlockLocation, IncidentCategory, UrgencyLevel, IncidentStatus } from '../types';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  AlertOctagon, 
  CheckCircle2, 
  FileText, 
  ChevronRight,
  Siren,
  X
} from 'lucide-react';

interface IncidentManagerProps {
  incidents: IncidentReport[];
  onAddIncident: (newInc: Omit<IncidentReport, 'id' | 'code'>) => void;
  onUpdateStatus: (id: string, newStatus: IncidentStatus) => void;
  onCreateBapFromIncident?: (incident: IncidentReport) => void;
}

export const IncidentManager: React.FC<IncidentManagerProps> = ({
  incidents,
  onAddIncident,
  onUpdateStatus,
  onCreateBapFromIncident,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
  const [formLocation, setFormLocation] = useState<BlockLocation>('Blok Beta (Narapidana Dewasa)');
  const [formCategory, setFormCategory] = useState<IncidentCategory>('PENYELUNDUPAN_HP_NARKOBA');
  const [formUrgency, setFormUrgency] = useState<UrgencyLevel>('SEDANG');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReporterName, setFormReporterName] = useState('');
  const [formReporterRole, setFormReporterRole] = useState('Anggota RUPAM');
  const [formInvolvedInmates, setFormInvolvedInmates] = useState('');
  const [formActionTaken, setFormActionTaken] = useState('');
  const [formIsEmergency, setFormIsEmergency] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDescription || !formReporterName) {
      alert('Mohon lengkapi Judul, Deskripsi Kronologi, dan Nama Petugas Pelapor.');
      return;
    }

    const now = new Date();
    const timestamp =
      now.toISOString().split('T')[0] +
      ' ' +
      now.toTimeString().split(' ')[0].substring(0, 5);

    onAddIncident({
      timestamp,
      location: formLocation,
      category: formCategory,
      urgency: formUrgency,
      status: 'MENUNGGU_TINDAKAN',
      title: formTitle,
      description: formDescription,
      reporterName: formReporterName,
      reporterRole: formReporterRole,
      involvedInmates: formInvolvedInmates
        ? formInvolvedInmates.split(',').map((s) => s.trim())
        : [],
      actionTaken: formActionTaken || 'Insiden telah dicatat. Menunggu instruksi KPLP.',
      isEmergency: formIsEmergency,
    });

    // Reset Form
    setFormTitle('');
    setFormDescription('');
    setFormReporterName('');
    setFormInvolvedInmates('');
    setFormActionTaken('');
    setFormIsEmergency(false);
    setShowAddModal(false);
  };

  // Filtered List
  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.reporterName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = filterLocation === 'ALL' || inc.location === filterLocation;
    const matchesCategory = filterCategory === 'ALL' || inc.category === filterCategory;
    const matchesUrgency = filterUrgency === 'ALL' || inc.urgency === filterUrgency;
    const matchesStatus = filterStatus === 'ALL' || inc.status === filterStatus;

    return matchesSearch && matchesLocation && matchesCategory && matchesUrgency && matchesStatus;
  });

  return (
    <div id="incident-manager-container" className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm text-white">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Laporan Insiden Harian (Lapsitkam)</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Pencatatan real-time seluruh kejadian & gangguan keamanan dan ketertiban di lingkungan Lapas Batang.
          </p>
        </div>

        <button
          id="btn-open-add-incident-modal"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Lapor Insiden Baru</span>
        </button>
      </div>

      {/* Search & Multi-Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-search-incident"
              type="text"
              placeholder="Cari kode insiden, judul, pelapor, atau kronologi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Location */}
            <select
              id="filter-incident-location"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg text-xs text-slate-700 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Lokasi</option>
              <option value="Blok Alpha (Tahanan)">Blok Alpha (Tahanan)</option>
              <option value="Blok Beta (Narapidana Dewasa)">Blok Beta (Napi)</option>
              <option value="Blok Gamma (Wanita/Khusus)">Blok Gamma (Wanita)</option>
              <option value="Blok Sel Isolasi / Tutupan Sunyi">Sel Isolasi</option>
              <option value="P2U (Pintu Utama)">P2U (Pintu Utama)</option>
              <option value="Pos Menara Atas">Pos Menara Atas</option>
              <option value="Poliklinik & Dapur">Poliklinik & Dapur</option>
              <option value="Bengkel Kerja / Area Asimilasi">Bengkel Kerja</option>
            </select>

            {/* Urgency */}
            <select
              id="filter-incident-urgency"
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg text-xs text-slate-700 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Urgensi</option>
              <option value="RENDAH">Urgensi: Rendah</option>
              <option value="SEDANG">Urgensi: Sedang</option>
              <option value="TINGGI">Urgensi: Tinggi</option>
              <option value="KRITIS">Urgensi: Kritis</option>
            </select>

            {/* Status */}
            <select
              id="filter-incident-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg text-xs text-slate-700 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU_TINDAKAN">Menunggu Tindakan</option>
              <option value="DALAM_INVESTIGASI">Dalam Investigasi</option>
              <option value="DISANKSI_REGISTER_F">Disanksi Register F</option>
              <option value="SELESAI">Selesai</option>
            </select>

          </div>
        </div>
      </div>

      {/* List of Incidents */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs shadow-sm">
            Tidak ada laporan insiden yang cocok dengan pencarian / filter Anda.
          </div>
        ) : (
          filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className={`bg-white border ${
                inc.isEmergency
                  ? 'border-red-300 bg-red-50/20 shadow-sm'
                  : 'border-slate-200'
              } rounded-xl p-5 space-y-4 hover:border-slate-300 transition-all shadow-sm`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                    {inc.code}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {inc.timestamp}
                  </span>
                  {inc.isEmergency && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded">
                      <Siren className="w-3 h-3" /> ALARM DARURAT
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Category Pill */}
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded uppercase">
                    {inc.category.replace(/_/g, ' ')}
                  </span>

                  {/* Urgency Badge */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase ${
                      inc.urgency === 'KRITIS'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : inc.urgency === 'TINGGI'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : inc.urgency === 'SEDANG'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {inc.urgency}
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">{inc.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {inc.description}
                </p>
              </div>

              {/* Action Taken & WBP Involved */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-semibold block mb-1">Tindakan Awal & Instruksi KPLP:</span>
                  <p className="text-slate-800 font-medium">{inc.actionTaken}</p>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-semibold block mb-1">WBP Terlibat:</span>
                  <p className="text-slate-800 font-medium">
                    {inc.involvedInmates.length > 0
                      ? inc.involvedInmates.join(', ')
                      : 'Tidak ada WBP spesifik / OTK'}
                  </p>
                </div>
              </div>

              {/* Footer Controls & Pipeline Change */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lokasi: <strong className="text-slate-700">{inc.location}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Pelapor: <strong className="text-slate-700">{inc.reporterName} ({inc.reporterRole})</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Change Selector */}
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    <span className="text-slate-500 text-[11px] font-medium">Status:</span>
                    <select
                      value={inc.status}
                      onChange={(e) => onUpdateStatus(inc.id, e.target.value as IncidentStatus)}
                      className="bg-transparent text-xs font-bold text-blue-700 focus:outline-none cursor-pointer"
                    >
                      <option value="MENUNGGU_TINDAKAN">MENUNGGU TINDAKAN</option>
                      <option value="DALAM_INVESTIGASI">DALAM INVESTIGASI</option>
                      <option value="DISANKSI_REGISTER_F">DISANKSI REGISTER F</option>
                      <option value="SELESAI">SELESAI</option>
                    </select>
                  </div>

                  {/* Create BAP shortcut if not completed */}
                  {onCreateBapFromIncident && (
                    <button
                      onClick={() => onCreateBapFromIncident(inc)}
                      className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-md border border-slate-300 shadow-sm transition-colors"
                      title="Proses Pembuatan Berita Acara Pemeriksaan (BAP)"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Buat BAP WBP</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Modal Input Insiden Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl p-6 shadow-xl space-y-5 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">Form Lapor Insiden Harian KPLP</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Row 1: Lokasi & Kategori */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lokasi Insiden / Pos</label>
                  <select
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value as BlockLocation)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Blok Alpha (Tahanan)">Blok Alpha (Tahanan)</option>
                    <option value="Blok Beta (Narapidana Dewasa)">Blok Beta (Narapidana Dewasa)</option>
                    <option value="Blok Gamma (Wanita/Khusus)">Blok Gamma (Wanita/Khusus)</option>
                    <option value="Blok Sel Isolasi / Tutupan Sunyi">Blok Sel Isolasi / Tutupan Sunyi</option>
                    <option value="P2U (Pintu Utama)">P2U (Pintu Utama)</option>
                    <option value="Pos Menara Atas">Pos Menara Atas</option>
                    <option value="Poliklinik & Dapur">Poliklinik & Dapur</option>
                    <option value="Bengkel Kerja / Area Asimilasi">Bengkel Kerja / Area Asimilasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kategori Insiden</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as IncidentCategory)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="PENYELUNDUPAN_HP_NARKOBA">Penyelundupan HP / Narkoba</option>
                    <option value="PERKELAHIAN">Perkelahian / Keributan WBP</option>
                    <option value="SENJATA_TAJAM">Kepemilikan Senjata Tajam</option>
                    <option value="PERCOBAAN_PELARIAN">Percobaan Pelarian (Escape)</option>
                    <option value="PELANGGARAN_TATIB">Pelanggaran Tata Tertib</option>
                    <option value="KERUSAKAN_SARPRAS">Kerusakan Sarana Prasarana</option>
                    <option value="KESEHATAN_MEDIS">Kesehatan Darurat / Medis</option>
                    <option value="UNJUK_RASA">Unjuk Rasa / Protes</option>
                    <option value="LAINNYA">Lain-Lain</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Urgensi & Status Emergency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tingkat Urgensi</label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as UrgencyLevel)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="RENDAH">RENDAH - Ringan / Terkendali</option>
                    <option value="SEDANG">SEDANG - Butuh Perhatian Khusus</option>
                    <option value="TINGGI">TINGGI - Berpotensi Eskalasi</option>
                    <option value="KRITIS">KRITIS - Butuh Penanganan Instan</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="checkbox-emergency"
                    checked={formIsEmergency}
                    onChange={(e) => setFormIsEmergency(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="checkbox-emergency" className="text-slate-800 font-bold cursor-pointer">
                    Tandai Kategori Darurat (Alarm Broadcast)
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Judul Ringkas Kejadian</label>
                <input
                  type="text"
                  placeholder="Contoh: Temuan HP Android saat geledah kamar B-04"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Uraian Kronologi Kejadian</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan urutan peristiwa, waktu tepatnya, dan kondisi barang bukti/lokasi..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Row 3: Reporter Name & Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Petugas Pelapor</label>
                  <input
                    type="text"
                    placeholder="Contoh: Aiptu Triyono, S.H."
                    value={formReporterName}
                    onChange={(e) => setFormReporterName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jabatan / Regu</label>
                  <input
                    type="text"
                    placeholder="Contoh: Danrupam III / Petugas P2U"
                    value={formReporterRole}
                    onChange={(e) => setFormReporterRole(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Involved WBP & Initial Action */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">WBP Terlibat (Nama & Bin, pisahkan koma)</label>
                <input
                  type="text"
                  placeholder="Contoh: Agus Supriyanto bin Sukirman, Slamet Raharjo"
                  value={formInvolvedInmates}
                  onChange={(e) => setFormInvolvedInmates(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tindakan Awal yang Telah Diambil</label>
                <input
                  type="text"
                  placeholder="Contoh: Barang bukti disita, WBP diamankan di Ruang KPLP"
                  value={formActionTaken}
                  onChange={(e) => setFormActionTaken(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Simpan Laporan Insiden
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
