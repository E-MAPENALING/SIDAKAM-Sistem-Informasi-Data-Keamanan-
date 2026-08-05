import React, { useState } from 'react';
import { SecurityStats, IncidentReport, ViolationRecord, BlockRoomInfo, InspectionDailyData, RoomDetail, SecurityOfficer } from '../types';
import { INITIAL_OFFICERS } from '../data/mockData';
import { ImipasLogo } from './ImipasLogo';
import { getKopSuratHTML } from '../lib/kopSurat';
import { compressImage } from '../lib/imageUtils';
import { 
  Users, 
  ShieldAlert, 
  Lock, 
  FileText, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp,
  Building,
  Radio,
  Clock,
  Search,
  Edit3,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Home,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  DoorOpen,
  Layers,
  Download,
  FileSpreadsheet,
  Printer,
  Upload,
  RotateCcw,
  PenTool,
  Filter,
  Calendar,
  UserCheck,
  UserX,
  UserPlus,
  FileCheck,
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface DashboardOverviewProps {
  stats: SecurityStats;
  incidents: IncidentReport[];
  violations: ViolationRecord[];
  officers?: SecurityOfficer[];
  onUpdateOfficer?: (officer: SecurityOfficer) => void;
  onAddOfficer?: (officer: SecurityOfficer) => void;
  onDeleteOfficer?: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onQuickAddIncident: () => void;
  onQuickAddViolation: () => void;
  onUpdateIncidentStatus: (id: string, newStatus: any) => void;
  onUpdateStats?: (newStats: Partial<SecurityStats>) => void;
}

const DEFAULT_BLOCKS: BlockRoomInfo[] = [
  { id: 'blk-1', name: 'Blok Alpha (Tahanan)', roomCount: 8, maxPerRoom: 10, description: 'Kamar A-01 s/d A-08' },
  { id: 'blk-2', name: 'Blok Beta (Narapidana Dewasa)', roomCount: 14, maxPerRoom: 12, description: 'Kamar B-01 s/d B-14' },
  { 
    id: 'blk-3', 
    name: 'Blok Edelweis (Wanita / Khusus)', 
    roomCount: 6, 
    maxPerRoom: 8, 
    description: 'Kamar E-01 s/d E-06 (Kamar Tamping Blok & Lansia)',
    rooms: [
      { id: 'blk-3-rm-1', name: 'Kamar E-01', maxCapacity: 8, currentOccupants: 10, notes: 'Kamar Tamping Blok' },
      { id: 'blk-3-rm-2', name: 'Kamar E-02', maxCapacity: 8, currentOccupants: 12, notes: 'Kamar Tamping Dapur & Kebersihan' },
      { id: 'blk-3-rm-3', name: 'Kamar E-03', maxCapacity: 8, currentOccupants: 8, notes: 'Kamar Pekerja / Asimilasi' },
      { id: 'blk-3-rm-4', name: 'Kamar E-04', maxCapacity: 8, currentOccupants: 10, notes: 'Kamar Lansia & Disabilitas' },
      { id: 'blk-3-rm-5', name: 'Kamar E-05', maxCapacity: 8, currentOccupants: 9, notes: 'Kamar Umum WBP' },
      { id: 'blk-3-rm-6', name: 'Kamar E-06', maxCapacity: 8, currentOccupants: 8, notes: 'Kamar Pengasingan / Karantina' },
    ]
  },
  { id: 'blk-4', name: 'Blok Sel Isolasi / Tutupan Sunyi', roomCount: 4, maxPerRoom: 2, description: 'Kamar ISO-01 s/d ISO-04' },
];

const DEFAULT_SEARCHES: InspectionDailyData = {
  date: new Date().toISOString().split('T')[0],
  blockSearchesCount: 2,
  p2uSearchesCount: 48,
  forbiddenItemsFound: 'Nihil (Kondisi Aman)',
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  incidents,
  violations,
  officers,
  onUpdateOfficer,
  onAddOfficer,
  onDeleteOfficer,
  onNavigateTab,
  onQuickAddIncident,
  onQuickAddViolation,
  onUpdateIncidentStatus,
  onUpdateStats,
}) => {
  // Officers state fallback
  const allOfficers = officers && officers.length > 0 ? officers : INITIAL_OFFICERS;

  // Modal & Form state for Pegawai Cuti
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [editingOfficerForLeave, setEditingOfficerForLeave] = useState<SecurityOfficer | null>(null);

  const [formLeaveOfficerId, setFormLeaveOfficerId] = useState<string>('');
  const [formLeaveStatus, setFormLeaveStatus] = useState<string>('CUTI');
  const [formLeaveType, setFormLeaveType] = useState<string>('Cuti Tahunan');
  const [formLeaveRank, setFormLeaveRank] = useState<string>('Penata Muda (III/a)');
  const [formLeavePosition, setFormLeavePosition] = useState<string>('');
  const [formLeaveStartDate, setFormLeaveStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formLeaveEndDate, setFormLeaveEndDate] = useState<string>('');
  const [formLeaveReason, setFormLeaveReason] = useState<string>('');
  const [formLeaveDocNumber, setFormLeaveDocNumber] = useState<string>('');

  // Filter state for Cuti Section
  const [leaveSearchTerm, setLeaveSearchTerm] = useState<string>('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'ALL' | 'CUTI' | 'HADIR_DINAS' | 'LEPAS_DINAS'>('ALL');
  const [leaveReguFilter, setLeaveReguFilter] = useState<string>('ALL');

  // Modal states for manual updates
  const [isWbpModalOpen, setIsWbpModalOpen] = useState(false);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isBlocksModalOpen, setIsBlocksModalOpen] = useState(false);

  // Form states for manual WBP input
  const [formTahanan, setFormTahanan] = useState<number>(stats.tahananCount);
  const [formNapi, setFormNapi] = useState<number>(stats.napiCount);
  const [formCapacity, setFormCapacity] = useState<number>(stats.capacityMax);

  // Form states for manual Pelanggaran
  const [formRegF, setFormRegF] = useState<number>(stats.registerFActiveCount);
  const [formIsolasi, setFormIsolasi] = useState<number>(stats.activeIsolationsCount);

  // Form states for manual Daily Search
  const currentSearches = stats.dailySearches || DEFAULT_SEARCHES;
  const [formBlockSearches, setFormBlockSearches] = useState<number>(currentSearches.blockSearchesCount);
  const [formP2uSearches, setFormP2uSearches] = useState<number>(currentSearches.p2uSearchesCount);
  const [formForbiddenItems, setFormForbiddenItems] = useState<string>(currentSearches.forbiddenItemsFound);

  // Form states for manual Blocks & Rooms
  const currentBlocks = stats.blocksInfo && stats.blocksInfo.length > 0 ? stats.blocksInfo : DEFAULT_BLOCKS;
  const [formBlocksList, setFormBlocksList] = useState<BlockRoomInfo[]>(currentBlocks);

  // Search & Filter state for Detail Blok & Kamar Hunian
  const [blockSearchTerm, setBlockSearchTerm] = useState('');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState('ALL');
  const [blockStatusFilter, setBlockStatusFilter] = useState<'ALL' | 'OVER' | 'NORMAL'>('ALL');

  // Expanded state for room listings per block
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({
    'blk-1': true,
    'blk-2': true,
    'blk-3': true,
    'blk-4': true,
  });

  const toggleBlockExpanded = (blkId: string) => {
    setExpandedBlocks((prev) => ({ ...prev, [blkId]: !prev[blkId] }));
  };

  const getRoomPrefix = (blkName: string, desc?: string) => {
    if (desc && desc.includes('E-')) return 'E-';
    if (desc && desc.includes('A-')) return 'A-';
    if (desc && desc.includes('B-')) return 'B-';
    if (desc && desc.includes('G-')) return 'G-';
    if (desc && desc.includes('ISO-')) return 'ISO-';
    if (blkName.toLowerCase().includes('edelweis') || blkName.toLowerCase().includes('edelwish')) return 'E-';
    if (blkName.toLowerCase().includes('alpha')) return 'A-';
    if (blkName.toLowerCase().includes('beta')) return 'B-';
    if (blkName.toLowerCase().includes('gamma')) return 'G-';
    if (blkName.toLowerCase().includes('isolasi') || blkName.toLowerCase().includes('tutupan')) return 'ISO-';
    return 'Kmr-';
  };

  const getRoomsForBlock = (blk: BlockRoomInfo): RoomDetail[] => {
    if (blk.rooms && blk.rooms.length > 0) {
      return blk.rooms.map((r) => {
        const noteVal = (r.notes || r.description || '').trim();
        return {
          ...r,
          currentOccupants: r.currentOccupants !== undefined ? r.currentOccupants : Math.round((r.maxCapacity || 10) * 1.5),
          notes: noteVal,
          description: noteVal,
        };
      });
    }
    const maxPerRoom = Number(blk.maxPerRoom) || 10;
    const prefix = getRoomPrefix(blk.name, blk.description);
    const isEdelweis = blk.name.toLowerCase().includes('edelweis') || blk.name.toLowerCase().includes('edelwish');
    return Array.from({ length: blk.roomCount }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      const defaultCap = maxPerRoom;
      const defaultOcc = Math.round(defaultCap * 1.5);
      let defaultNotes = '';
      if (isEdelweis) {
        if (i === 0) defaultNotes = 'Kamar Tamping Blok';
        else if (i === 1) defaultNotes = 'Kamar Tamping Dapur & Kebersihan';
        else if (i === 2) defaultNotes = 'Kamar Pekerja / Asimilasi';
        else if (i === 3) defaultNotes = 'Kamar Lansia & Disabilitas';
        else if (i === 4) defaultNotes = 'Kamar Umum WBP';
        else if (i === 5) defaultNotes = 'Kamar Pengasingan / Karantina';
      }
      return {
        id: `${blk.id}-rm-${i + 1}`,
        name: `Kamar ${prefix}${num}`,
        maxCapacity: defaultCap,
        currentOccupants: defaultOcc,
        notes: defaultNotes,
        description: defaultNotes,
      };
    });
  };

  // State for Room Edit Modal
  const [roomModal, setRoomModal] = useState<{
    isOpen: boolean;
    blockId: string;
    blockName: string;
    roomId?: string;
    isNew: boolean;
  }>({
    isOpen: false,
    blockId: '',
    blockName: '',
    isNew: false,
  });

  const [roomFormName, setRoomFormName] = useState<string>('');
  const [roomFormCap, setRoomFormCap] = useState<number>(10);
  const [roomFormOccupants, setRoomFormOccupants] = useState<number>(15);
  const [roomFormNotes, setRoomFormNotes] = useState<string>('');

  // State for Print Block & Kamar Report Modal with Officer & Signature
  const [isPrintBlockModalOpen, setIsPrintBlockModalOpen] = useState<boolean>(false);
  const [blockPejabatName, setBlockPejabatName] = useState<string>(() => {
    return localStorage.getItem('kemenimipas_block_pejabat_name') || 'SIGIT, S.H., M.H.';
  });
  const [blockPejabatTitle, setBlockPejabatTitle] = useState<string>(() => {
    return localStorage.getItem('kemenimipas_block_pejabat_title') || 'KA. KPLP LAPAS KELAS IIB BATANG';
  });
  const [blockPejabatNip, setBlockPejabatNip] = useState<string>(() => {
    return localStorage.getItem('kemenimipas_block_pejabat_nip') || '19780512 200003 1 001';
  });
  const [blockPejabatTtd, setBlockPejabatTtd] = useState<string | null>(() => {
    return localStorage.getItem('kemenimipas_kplp_ttd') || localStorage.getItem('kemenimipas_block_pejabat_ttd') || null;
  });

  const handleOpenEditRoom = (blockId: string, blockName: string, room: RoomDetail) => {
    setRoomModal({
      isOpen: true,
      blockId,
      blockName,
      roomId: room.id,
      isNew: false,
    });
    setRoomFormName(room.name);
    setRoomFormCap(room.maxCapacity);
    setRoomFormOccupants(room.currentOccupants ?? 0);
    setRoomFormNotes(room.notes || room.description || '');
  };

  const handleOpenAddRoom = (blockId: string, blockName: string) => {
    const targetBlock = currentBlocks.find((b) => b.id === blockId);
    const rooms = targetBlock ? getRoomsForBlock(targetBlock) : [];
    const prefix = targetBlock ? getRoomPrefix(targetBlock.name, targetBlock.description) : 'A-';
    const numStr = String(rooms.length + 1).padStart(2, '0');
    const defaultCap = targetBlock?.maxPerRoom || 10;
    setRoomModal({
      isOpen: true,
      blockId,
      blockName,
      isNew: true,
    });
    setRoomFormName(`Kamar ${prefix}${numStr}`);
    setRoomFormCap(defaultCap);
    setRoomFormOccupants(defaultCap);
    setRoomFormNotes('');
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomModal.blockId) return;

    const targetBlock = currentBlocks.find((b) => b.id === roomModal.blockId);
    if (!targetBlock) return;

    const rooms = getRoomsForBlock(targetBlock);
    let updatedRooms: RoomDetail[];

    if (roomModal.isNew) {
      const newRoom: RoomDetail = {
        id: `${roomModal.blockId}-rm-${Date.now()}`,
        name: roomFormName.trim() || `Kamar Baru`,
        maxCapacity: Number(roomFormCap) || 10,
        currentOccupants: Number(roomFormOccupants) || 0,
        notes: roomFormNotes.trim(),
        description: roomFormNotes.trim(),
      };
      updatedRooms = [...rooms, newRoom];
    } else {
      updatedRooms = rooms.map((r) =>
        r.id === roomModal.roomId
          ? {
              ...r,
              name: roomFormName.trim() || r.name,
              maxCapacity: Number(roomFormCap) || 10,
              currentOccupants: Number(roomFormOccupants) || 0,
              notes: roomFormNotes.trim(),
              description: roomFormNotes.trim(),
            }
          : r
      );
    }

    const updatedBlock: BlockRoomInfo = {
      ...targetBlock,
      rooms: updatedRooms,
      roomCount: updatedRooms.length,
    };

    const updatedBlocksList = currentBlocks.map((b) =>
      b.id === roomModal.blockId ? updatedBlock : b
    );

    // Calculate sum of real occupants across all blocks to update totalWBP if needed
    const sumRealOccupants = updatedBlocksList.reduce((sum, b) => {
      const rms = getRoomsForBlock(b);
      return sum + rms.reduce((rSum, rm) => rSum + (Number(rm.currentOccupants) || 0), 0);
    }, 0);

    if (onUpdateStats) {
      onUpdateStats({ 
        blocksInfo: updatedBlocksList,
        totalWBP: sumRealOccupants > 0 ? sumRealOccupants : stats.totalWBP,
      });
    }
    setFormBlocksList(updatedBlocksList);
    setRoomModal({ isOpen: false, blockId: '', blockName: '', isNew: false });
  };

  const handleDeleteRoom = (blockId: string, roomId: string, roomName: string) => {
    if (!window.confirm(`Yakin ingin menghapus ${roomName}? Jumlah kamar pada blok ini akan berkurang.`)) {
      return;
    }

    const targetBlock = currentBlocks.find((b) => b.id === blockId);
    if (!targetBlock) return;

    const rooms = getRoomsForBlock(targetBlock);
    const updatedRooms = rooms.filter((r) => r.id !== roomId);

    const updatedBlock: BlockRoomInfo = {
      ...targetBlock,
      rooms: updatedRooms,
      roomCount: updatedRooms.length,
    };

    const updatedBlocksList = currentBlocks.map((b) =>
      b.id === blockId ? updatedBlock : b
    );

    if (onUpdateStats) {
      onUpdateStats({ blocksInfo: updatedBlocksList });
    }
    setFormBlocksList(updatedBlocksList);
  };

  const handleDownloadBlocksCSV = () => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const rows: string[][] = [
      ['LAPAS KELAS IIB BATANG - REKAPITULASI BLOK & KAMAR HUNIAN WBP'],
      ['Tanggal Unduh:', today],
      ['Total Penghuni Real WBP:', `${totalRealOccupants} Orang (Tahanan: ${stats.tahananCount}, Narapidana: ${stats.napiCount})`],
      ['Total Ruang Kamar:', `${totalRooms} Ruang Kamar`],
      ['Total Kapasitas Maksimal Blok:', `${totalMaxRoomCapacity} WBP`],
      ['Persentase Keterisian Total Lapas:', `${totalOccupancyRate}% (${totalOverPercent > 0 ? `Overcapacity +${totalOverPercent}%` : 'Normal'})`],
      [],
      ['--- RINGKASAN DATA PER BLOK HUNIAN ---'],
      ['NO', 'NAMA BLOK', 'KETERANGAN', 'JUMLAH KAMAR', 'PENGHUNI REAL (WBP)', 'KAPASITAS MAKSIMAL (WBP)', '% KETERISIAN', '% OVERCAPACITY'],
    ];

    currentBlocks.forEach((blk, idx) => {
      const rooms = getRoomsForBlock(blk);
      const blockRealOcc = rooms.reduce((s, r) => s + (Number(r.currentOccupants) || 0), 0);
      const blockMaxCap = rooms.reduce((s, r) => s + (Number(r.maxCapacity) || 10), 0);
      const rate = blockMaxCap > 0 ? Math.round((blockRealOcc / blockMaxCap) * 100) : 0;
      const over = rate - 100;
      rows.push([
        (idx + 1).toString(),
        blk.name,
        blk.description || 'Kamar Hunian WBP',
        rooms.length.toString(),
        `${blockRealOcc} WBP`,
        `${blockMaxCap} WBP`,
        `${rate}%`,
        over > 0 ? `+${over}% Over` : '0% (Normal)'
      ]);
    });

    rows.push([]);
    rows.push(['--- RINCIAN DETAIL SELURUH KAMAR HUNIAN PER BLOK ---']);
    rows.push(['NO', 'NAMA BLOK', 'NAMA KAMAR / RUANG', 'KETERANGAN / CATATAN KHUSUS', 'PENGHUNI REAL (WBP)', 'KAPASITAS MAKSIMAL (WBP)', '% KETERISIAN', 'STATUS OVERCAPACITY']);

    let itemNo = 1;
    currentBlocks.forEach((blk) => {
      const rooms = getRoomsForBlock(blk);
      rooms.forEach((rm) => {
        const occ = rm.currentOccupants || 0;
        const cap = rm.maxCapacity || 10;
        const rate = cap > 0 ? Math.round((occ / cap) * 100) : 0;
        const over = rate - 100;
        const statusText = over > 0 ? `Overcapacity (+${over}%)` : rate === 100 ? 'Penuh (100%)' : `Normal (${rate}%)`;

        rows.push([
          itemNo.toString(),
          blk.name,
          rm.name,
          rm.notes || rm.description || '-',
          `${occ} WBP`,
          `${cap} WBP`,
          `${rate}%`,
          statusText
        ]);
        itemNo++;
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows
        .map((e) => e.map((cell) => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Blok_Dan_Kamar_Lapas_Batang_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintBlocksReport = () => {
    setIsPrintBlockModalOpen(true);
  };

  const handleUploadBlockTtd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 200, 0.75);
      if (compressed) {
        setBlockPejabatTtd(compressed);
        localStorage.setItem('kemenimipas_kplp_ttd', compressed);
        localStorage.setItem('kemenimipas_block_pejabat_ttd', compressed);
      }
    } catch (err) {
      console.error('Gagal mengunggah TTD:', err);
    }
  };

  const handleResetBlockTtd = () => {
    setBlockPejabatTtd(null);
    localStorage.removeItem('kemenimipas_block_pejabat_ttd');
  };

  const handleSaveBlockPejabatInfo = () => {
    localStorage.setItem('kemenimipas_block_pejabat_name', blockPejabatName);
    localStorage.setItem('kemenimipas_block_pejabat_title', blockPejabatTitle);
    localStorage.setItem('kemenimipas_block_pejabat_nip', blockPejabatNip);
    if (blockPejabatTtd) {
      localStorage.setItem('kemenimipas_kplp_ttd', blockPejabatTtd);
      localStorage.setItem('kemenimipas_block_pejabat_ttd', blockPejabatTtd);
    }
  };

  const doPrintBlocksReport = () => {
    handleSaveBlockPejabatInfo();
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const kopHtml = getKopSuratHTML(
      'REKAPITULASI DETAIL BLOK & KAMAR HUNIAN WARGA BINAAN PEMASYARAKATAN',
      'LAPAS KELAS IIB BATANG'
    );

    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rekapitulasi Blok & Kamar Hunian - Lapas Batang</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 1.5cm;
            }
            body { font-family: Arial, Helvetica, sans-serif; padding: 10px; color: #0f172a; line-height: 1.35; font-size: 10pt; }
            h2, h3 { margin: 4px 0; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5pt; }
            th, td { border: 1.5px solid #000; padding: 6px 8px; text-align: left; vertical-align: middle; }
            th { background-color: #f1f5f9; text-align: center; font-weight: bold; color: #0f172a; text-transform: uppercase; }
            .center { text-align: center; }
            .meta-grid { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 9.5pt; background: #f8fafc; padding: 8px 12px; border: 1.5px solid #000; }
            .block-title { font-weight: bold; background-color: #e2e8f0; margin-top: 16px; padding: 6px 10px; border: 1.5px solid #000; font-size: 10pt; text-transform: uppercase; }
            .over-badge { color: #b91c1c; font-weight: bold; }
            .normal-badge { color: #047857; font-weight: bold; }
            .signature-box { margin-top: 25px; display: flex; justify-content: flex-end; page-break-inside: avoid; }
            .signature-content { text-align: center; width: 280px; font-size: 10pt; font-family: Arial, sans-serif; color: #000; }
          </style>
        </head>
        <body>
          ${kopHtml}

          <div class="meta-grid">
            <div>
              <strong>Tanggal Cetak:</strong> ${today}<br>
              <strong>Total Penghuni Real Lapas:</strong> ${totalRealOccupants} WBP (${stats.tahananCount} Tahanan, ${stats.napiCount} Narapidana)
            </div>
            <div style="text-align: right;">
              <strong>Total Kamar Hunian:</strong> ${totalRooms} Ruang Kamar<br>
              <strong>Total Kapasitas Maksimal:</strong> ${totalMaxRoomCapacity} WBP (${totalOccupancyRate}% Keterisian / ${totalOverPercent > 0 ? `+${totalOverPercent}% Over` : 'Normal'})
            </div>
          </div>

          <h3 style="text-align: left; font-size: 10.5pt; margin-top: 12px; text-transform: uppercase; font-weight: 800;">1. RINGKASAN REKAPITULASI PER BLOK HUNIAN</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 35px;">NO</th>
                <th>NAMA BLOK HUNIAN</th>
                <th>TIPE / DESKRIPSI</th>
                <th style="width: 90px;">JML KAMAR</th>
                <th style="width: 100px;">PENGHUNI REAL</th>
                <th style="width: 110px;">KAPASITAS MAKS</th>
                <th style="width: 130px;">% KETERISIAN / OVER</th>
              </tr>
            </thead>
            <tbody>
    `;

    currentBlocks.forEach((blk, idx) => {
      const rooms = getRoomsForBlock(blk);
      const blockRealOcc = rooms.reduce((s, r) => s + (Number(r.currentOccupants) || 0), 0);
      const blockMaxCap = rooms.reduce((s, r) => s + (Number(r.maxCapacity) || 10), 0);
      const rate = blockMaxCap > 0 ? Math.round((blockRealOcc / blockMaxCap) * 100) : 0;
      const over = rate - 100;
      htmlContent += `
        <tr>
          <td class="center" style="font-weight: bold;">${idx + 1}</td>
          <td><strong>${blk.name}</strong></td>
          <td>${blk.description || '-'}</td>
          <td class="center">${rooms.length} Kamar</td>
          <td class="center"><strong>${blockRealOcc} WBP</strong></td>
          <td class="center">${blockMaxCap} WBP</td>
          <td class="center ${over > 0 ? 'over-badge' : 'normal-badge'}">
            ${rate}% ${over > 0 ? `(+${over}% Over)` : '(Normal)'}
          </td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
          </table>

          <h3 style="text-align: left; font-size: 10.5pt; margin-top: 20px; text-transform: uppercase; font-weight: 800;">2. RINCIAN DETAIL KAMAR HUNIAN PER BLOK</h3>
    `;

    currentBlocks.forEach((blk) => {
      const rooms = getRoomsForBlock(blk);
      const blockRealOcc = rooms.reduce((s, r) => s + (Number(r.currentOccupants) || 0), 0);
      const blockMaxCap = rooms.reduce((s, r) => s + (Number(r.maxCapacity) || 10), 0);
      const rate = blockMaxCap > 0 ? Math.round((blockRealOcc / blockMaxCap) * 100) : 0;
      const over = rate - 100;

      htmlContent += `
        <div class="block-title">
          ${blk.name} — ${rooms.length} KAMAR | PENGHUNI REAL: ${blockRealOcc} WBP | KAPASITAS MAKS: ${blockMaxCap} WBP (${rate}% - ${over > 0 ? `OVERCAPACITY +${over}%` : 'NORMAL'})
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 35px;">NO</th>
              <th>NAMA KAMAR / RUANG HUNIAN</th>
              <th>KETERANGAN / CATATAN KHUSUS</th>
              <th style="width: 110px;">PENGHUNI REAL</th>
              <th style="width: 120px;">KAPASITAS MAKSIMAL</th>
              <th style="width: 140px;">STATUS & % OVERCAPACITY</th>
            </tr>
          </thead>
          <tbody>
      `;

      rooms.forEach((rm, rIdx) => {
        const occ = rm.currentOccupants || 0;
        const cap = rm.maxCapacity || 10;
        const rmRate = cap > 0 ? Math.round((occ / cap) * 100) : 0;
        const rmOver = rmRate - 100;

        htmlContent += `
          <tr>
            <td class="center" style="font-weight: bold;">${rIdx + 1}</td>
            <td><strong>${rm.name}</strong></td>
            <td><span style="font-weight: 600; color: #1e1b4b;">${rm.notes || rm.description || '-'}</span></td>
            <td class="center"><strong>${occ} WBP</strong></td>
            <td class="center">${cap} WBP</td>
            <td class="center ${rmOver > 0 ? 'over-badge' : 'normal-badge'}">
              ${rmRate}% ${rmOver > 0 ? `(+${rmOver}% Over)` : rmRate === 100 ? '(Penuh)' : '(Normal)'}
            </td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    });

    htmlContent += `
          <div class="signature-box">
            <div class="signature-content">
              <div>Batang, ${today}</div>
              <div style="margin-top: 3px;">Mengetahui,</div>
              <div style="font-weight: bold; margin-top: 3px; text-transform: uppercase;">${blockPejabatTitle}</div>
              <div style="height: 80px; display: flex; align-items: center; justify-content: center; margin: 6px 0;">
                ${blockPejabatTtd ? `<img src="${blockPejabatTtd}" style="max-height: 75px; max-width: 220px; object-fit: contain;" alt="TTD" />` : `<div style="height: 60px;"></div>`}
              </div>
              <div style="font-weight: bold; text-decoration: underline; font-size: 10.5pt; text-transform: uppercase;">${blockPejabatName}</div>
              <div style="margin-top: 2px;">NIP. ${blockPejabatNip}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 350);
    }
    setIsPrintBlockModalOpen(false);
  };

  // --- Leave / Cuti Management Handlers ---
  const handleOpenLeaveModal = (officer?: SecurityOfficer) => {
    if (officer) {
      setEditingOfficerForLeave(officer);
      setFormLeaveOfficerId(officer.id);
      setFormLeaveStatus(officer.status || 'CUTI');
      setFormLeaveType(officer.leaveType || 'Cuti Tahunan');
      setFormLeaveRank(officer.rank || 'Penata Muda (III/a)');
      setFormLeavePosition(officer.position || '');
      setFormLeaveStartDate(officer.leaveStartDate || new Date().toISOString().split('T')[0]);
      setFormLeaveEndDate(officer.leaveEndDate || '');
      setFormLeaveReason(officer.leaveReason || '');
      setFormLeaveDocNumber(officer.leaveDocNumber || `W13.PAS.PAS.10-KP.04.01-${Math.floor(100 + Math.random() * 900)}`);
    } else {
      const defaultActive = allOfficers.find((o) => o.status !== 'CUTI') || allOfficers[0];
      setEditingOfficerForLeave(null);
      setFormLeaveOfficerId(defaultActive ? defaultActive.id : '');
      setFormLeaveStatus('CUTI');
      setFormLeaveType('Cuti Tahunan');
      setFormLeaveRank(defaultActive?.rank || 'Penata Muda (III/a)');
      setFormLeavePosition(defaultActive?.position || '');
      setFormLeaveStartDate(new Date().toISOString().split('T')[0]);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setFormLeaveEndDate(nextWeek.toISOString().split('T')[0]);
      setFormLeaveReason('Urusan Keperluan Keluarga');
      setFormLeaveDocNumber(`W13.PAS.PAS.10-KP.04.01-${Math.floor(100 + Math.random() * 900)}`);
    }
    setIsLeaveModalOpen(true);
  };

  const handleSaveLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLeaveOfficerId) return;

    const targetOfficer = allOfficers.find((o) => o.id === formLeaveOfficerId);
    if (!targetOfficer) return;

    const updatedOfficer: SecurityOfficer = {
      ...targetOfficer,
      rank: formLeaveRank.trim() || targetOfficer.rank,
      position: formLeavePosition.trim() || targetOfficer.position,
      status: formLeaveStatus,
      leaveType: formLeaveType,
      leaveStartDate: formLeaveStartDate,
      leaveEndDate: formLeaveEndDate,
      leaveReason: formLeaveReason,
      leaveDocNumber: formLeaveDocNumber,
    };

    if (onUpdateOfficer) {
      onUpdateOfficer(updatedOfficer);
    }
    setIsLeaveModalOpen(false);
  };

  const handleEndLeave = (officer: SecurityOfficer) => {
    if (window.confirm(`Yakin ingin mengakhiri masa cuti untuk ${officer.name} dan mengembalikan status ke HADIR_DINAS?`)) {
      const updated: SecurityOfficer = {
        ...officer,
        status: 'HADIR_DINAS',
      };
      if (onUpdateOfficer) {
        onUpdateOfficer(updated);
      }
    }
  };

  const handlePrintLeaveDocument = (targetOfficer?: SecurityOfficer) => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const headerHTML = getKopSuratHTML();

    let contentHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${targetOfficer ? `Surat Izin Cuti - ${targetOfficer.name}` : 'Rekapitulasi Pegawai Cuti Lapas Batang'}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; margin: 20px 30px; line-height: 1.4; }
            .title { text-align: center; font-weight: bold; font-size: 13pt; text-transform: uppercase; margin-top: 15px; margin-bottom: 5px; text-decoration: underline; }
            .subtitle { text-align: center; font-size: 10pt; font-weight: bold; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10pt; }
            th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
            th { background-color: #f1f5f9; text-align: center; font-weight: bold; text-transform: uppercase; font-size: 9.5pt; }
            .center { text-align: center; }
            .meta-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
            .meta-table td { border: none; padding: 5px 8px; }
            .signature-box { margin-top: 40px; float: right; width: 260px; text-align: center; font-size: 10.5pt; page-break-inside: avoid; }
          </style>
        </head>
        <body>
          ${headerHTML}
    `;

    if (targetOfficer) {
      contentHTML += `
        <div class="title">SURAT IZIN CUTI PEGAWAI</div>
        <div class="subtitle">Nomor: ${targetOfficer.leaveDocNumber || 'W13.PAS.PAS.10-KP.04.01-188'}</div>
        
        <p>Diberikan izin cuti kepada Pegawai / Petugas Keamanan Lembaga Pemasyarakatan Kelas IIB Batang:</p>
        
        <table class="meta-table">
          <tr><td style="width: 170px;"><strong>Nama Lengkap</strong></td><td>: <strong>${targetOfficer.name}</strong></td></tr>
          <tr><td><strong>NIP</strong></td><td>: ${targetOfficer.nip}</td></tr>
          <tr><td><strong>Pangkat / Golongan</strong></td><td>: ${targetOfficer.rank}</td></tr>
          <tr><td><strong>Jabatan</strong></td><td>: ${targetOfficer.position}</td></tr>
          <tr><td><strong>Unit / Regu Kerja</strong></td><td>: ${targetOfficer.regu}</td></tr>
          <tr><td><strong>Jenis Cuti</strong></td><td>: <strong style="color: #047857;">${targetOfficer.leaveType || 'Cuti Tahunan'}</strong></td></tr>
          <tr><td><strong>Periode Cuti</strong></td><td>: <strong>${targetOfficer.leaveStartDate || '-'}</strong> s/d <strong>${targetOfficer.leaveEndDate || 'Selesai'}</strong></td></tr>
          <tr><td><strong>Alasan / Keterangan</strong></td><td>: ${targetOfficer.leaveReason || '-'}</td></tr>
          <tr><td><strong>No. Kontak / Telepon</strong></td><td>: ${targetOfficer.phone || '-'}</td></tr>
        </table>

        <p>Demikian Surat Izin Cuti ini diterbitkan untuk dipergunakan sebagaimana mestinya dan selama menjalankan cuti agar tetap menjaga harkat dan martabat Korps Pemasyarakatan.</p>
      `;
    } else {
      contentHTML += `
        <div class="title">REKAPITULASI DAFTAR PEGAWAI CUTI & KEHADIRAN DINAS</div>
        <div class="subtitle">LEMBAGA PEMASYARAKATAN KELAS IIB BATANG — PER ${today.toUpperCase()}</div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">NO</th>
              <th>NAMA PEGAWAI / NIP</th>
              <th>PANGKAT / JABATAN</th>
              <th>REGU / UNIT</th>
              <th style="width: 90px;">STATUS</th>
              <th>JENIS CUTI</th>
              <th style="width: 130px;">PERIODE CUTI</th>
              <th>ALASAN / NO. SURAT</th>
            </tr>
          </thead>
          <tbody>
      `;

      allOfficers.forEach((off, idx) => {
        const isCuti = off.status === 'CUTI';
        contentHTML += `
          <tr style="${isCuti ? 'background-color: #fef2f2;' : ''}">
            <td class="center">${idx + 1}</td>
            <td><strong>${off.name}</strong><br/><span style="font-size: 8.5pt; color: #475569;">NIP. ${off.nip}</span></td>
            <td>${off.rank}<br/><span style="font-size: 8.5pt; color: #475569;">${off.position}</span></td>
            <td>${off.regu}</td>
            <td class="center">
              <strong style="color: ${isCuti ? '#dc2626' : off.status === 'HADIR_DINAS' ? '#16a34a' : '#475569'};">
                ${isCuti ? 'CUTI' : off.status || 'HADIR_DINAS'}
              </strong>
            </td>
            <td>${off.leaveType || '-'}</td>
            <td class="center">${off.leaveStartDate ? `${off.leaveStartDate} s/d ${off.leaveEndDate || 'Selesai'}` : '-'}</td>
            <td><span style="font-size: 8.5pt;">${off.leaveReason || '-'}</span><br/><span style="font-size: 8pt; color: #64748b;">${off.leaveDocNumber || ''}</span></td>
          </tr>
        `;
      });

      contentHTML += `
          </tbody>
        </table>
      `;
    }

    contentHTML += `
          <div class="signature-box">
            <div>Batang, ${today}</div>
            <div style="margin-top: 3px;">Kepala Lapas Kelas IIB Batang</div>
            <div style="height: 70px;"></div>
            <div style="font-weight: bold; text-decoration: underline; text-transform: uppercase;">JOSEPHUS DECKY NURWENDA, A.Md.IP., S.H., M.H.</div>
            <div>NIP. 19791218 200003 1 001</div>
          </div>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(contentHTML);
      printWin.document.close();
      setTimeout(() => {
        printWin.focus();
        printWin.print();
      }, 350);
    }
  };

  // Leave calculated stats
  const leaveOfficersList = allOfficers.filter((o) => o.status === 'CUTI');
  const activeDutyOfficersCount = allOfficers.filter((o) => o.status === 'HADIR_DINAS').length;
  const offDutyOfficersCount = allOfficers.filter((o) => o.status === 'LEPAS_DINAS' || !o.status).length;
  const totalOfficersCount = allOfficers.length;

  // Calculated values
  const totalWBP = stats.totalWBP;
  const totalRooms = currentBlocks.reduce((sum, b) => {
    const rms = getRoomsForBlock(b);
    return sum + rms.length;
  }, 0);
  const totalRealOccupants = currentBlocks.reduce((sum, b) => {
    const rms = getRoomsForBlock(b);
    return sum + rms.reduce((rSum, rm) => rSum + (Number(rm.currentOccupants) || 0), 0);
  }, 0) || totalWBP;

  const totalMaxRoomCapacity = currentBlocks.reduce((sum, b) => {
    const rms = getRoomsForBlock(b);
    return sum + rms.reduce((rSum, rm) => rSum + (Number(rm.maxCapacity) || 10), 0);
  }, 0);

  const totalOccupancyRate = totalMaxRoomCapacity > 0 ? Math.round((totalRealOccupants / totalMaxRoomCapacity) * 100) : 0;
  const totalOverPercent = totalOccupancyRate - 100;
  const overCapacityPercentage = Math.round((totalWBP / (stats.capacityMax || 220)) * 100);

  // Recent 3 incidents
  const recentIncidents = incidents.slice(0, 3);
  // Active isolations
  const activeIsolations = violations.filter((v) => v.registerFStatus === 'AKTIF' && v.punishment === 'ISOLASI_TUTUPAN_SUNYI');

  // Open & prep WBP Modal
  const handleOpenWbpModal = () => {
    setFormTahanan(stats.tahananCount);
    setFormNapi(stats.napiCount);
    setFormCapacity(stats.capacityMax);
    setIsWbpModalOpen(true);
  };

  const handleSaveWbp = (e: React.FormEvent) => {
    e.preventDefault();
    const newTahanan = Number(formTahanan) || 0;
    const newNapi = Number(formNapi) || 0;
    const newTotal = newTahanan + newNapi;
    const newCap = Number(formCapacity) || 1;

    if (onUpdateStats) {
      onUpdateStats({
        tahananCount: newTahanan,
        napiCount: newNapi,
        totalWBP: newTotal,
        capacityMax: newCap,
      });
    }
    setIsWbpModalOpen(false);
  };

  // Open & prep Violation Modal
  const handleOpenViolationModal = () => {
    setFormRegF(stats.registerFActiveCount);
    setFormIsolasi(stats.activeIsolationsCount);
    setIsViolationModalOpen(true);
  };

  const handleSaveViolation = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStats) {
      onUpdateStats({
        registerFActiveCount: Number(formRegF) || 0,
        activeIsolationsCount: Number(formIsolasi) || 0,
      });
    }
    setIsViolationModalOpen(false);
  };

  // Open & prep Search Modal
  const handleOpenSearchModal = () => {
    setFormBlockSearches(currentSearches.blockSearchesCount);
    setFormP2uSearches(currentSearches.p2uSearchesCount);
    setFormForbiddenItems(currentSearches.forbiddenItemsFound);
    setIsSearchModalOpen(true);
  };

  const handleSaveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStats) {
      onUpdateStats({
        dailySearches: {
          date: new Date().toISOString().split('T')[0],
          blockSearchesCount: Number(formBlockSearches) || 0,
          p2uSearchesCount: Number(formP2uSearches) || 0,
          forbiddenItemsFound: formForbiddenItems || 'Nihil',
        },
      });
    }
    setIsSearchModalOpen(false);
  };

  // Open & prep Blocks Modal
  const handleOpenBlocksModal = () => {
    setFormBlocksList(JSON.parse(JSON.stringify(currentBlocks)));
    setIsBlocksModalOpen(true);
  };

  const handleUpdateBlockItem = (index: number, field: keyof BlockRoomInfo, value: any) => {
    const updated = [...formBlocksList];
    updated[index] = { ...updated[index], [field]: value };
    setFormBlocksList(updated);
  };

  const handleAddBlockItem = () => {
    const newBlock: BlockRoomInfo = {
      id: 'blk-' + Date.now(),
      name: `Blok Baru (${formBlocksList.length + 1})`,
      roomCount: 6,
      maxPerRoom: 10,
      description: 'Kamar Hunian WBP',
    };
    setFormBlocksList([...formBlocksList, newBlock]);
  };

  const handleDeleteBlockItem = (id: string) => {
    if (formBlocksList.length <= 1) {
      alert('Minimal harus ada 1 blok hunian.');
      return;
    }
    setFormBlocksList(formBlocksList.filter((b) => b.id !== id));
  };

  const handleSaveBlocks = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStats) {
      onUpdateStats({
        blocksInfo: formBlocksList,
      });
    }
    setIsBlocksModalOpen(false);
  };

  return (
    <div id="dashboard-overview-container" className="space-y-6">
      
      {/* Executive Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <ImipasLogo className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-lg" />
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-600/30 border border-blue-500/40 rounded-md text-xs text-blue-300 font-semibold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>KPLP Batang • Security Command</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Ringkasan Keamanan & Operasional Lapas
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Sistem pemantauan terpadu data penghuni (Tahanan & Napi), penggeledahan harian, insiden keamanan, dan blok hunian Lapas Kelas IIB Batang.
            </p>
          </div>
        </div>

        {/* Quick Primary Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-quick-report-incident"
            onClick={onQuickAddIncident}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input Jurnal Harian</span>
          </button>
          <button
            id="btn-quick-add-violation"
            onClick={onQuickAddViolation}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-md border border-slate-700 transition-all active:scale-95"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Catat BAP Pelanggaran</span>
          </button>
          <button
            id="btn-ai-lapsitkam"
            onClick={() => onNavigateTab('ai-analyst')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 font-semibold text-xs rounded-md border border-indigo-700 transition-all active:scale-95"
          >
            <TrendingUp className="w-4 h-4 text-amber-300" />
            <span>AI Draft Lapsitkam</span>
          </button>
        </div>
      </div>

      {/* Primary Dashboard Metrics Grid (5 Main Manual Editable Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Metric 1: Total Penghuni WBP (Manual Editable) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between relative group hover:border-blue-300 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Penghuni Lapas
              </span>
              <button
                type="button"
                onClick={handleOpenWbpModal}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-0.5 rounded font-bold border border-blue-200 flex items-center gap-1 transition-colors"
                title="Edit Jumlah Tahanan & Narapidana"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Data</span>
              </button>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">{totalWBP}</span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">Orang</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                overCapacityPercentage > 100 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Kapasitas {overCapacityPercentage}%
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between items-center">
              <span>Tahanan:</span>
              <strong className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">{stats.tahananCount} Orang</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>Narapidana:</span>
              <strong className="text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{stats.napiCount} Orang</strong>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 text-right">
              Kapasitas Maks: {stats.capacityMax} WBP
            </div>
          </div>
        </div>

        {/* Metric 2: Narapidana Pelanggaran (Register F & Isolasi) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between relative group hover:border-red-300 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-600" />
                Napi Pelanggaran
              </span>
              <button
                type="button"
                onClick={handleOpenViolationModal}
                className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2 py-0.5 rounded font-bold border border-red-200 flex items-center gap-1 transition-colors"
                title="Edit Manual Data Pelanggaran"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Manual</span>
              </button>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-red-600 tracking-tight">{stats.registerFActiveCount}</span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">Kasus Reg F</span>
              </div>
              <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                Register F
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between items-center">
              <span>Sanksi Sel Isolasi:</span>
              <strong className="text-red-700 font-bold bg-red-50 px-1.5 py-0.5 rounded">{stats.activeIsolationsCount} Orang</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>BAP Aktif:</span>
              <strong className="text-slate-800 font-bold">{violations.length} Catatan</strong>
            </div>
            <button
              onClick={() => onNavigateTab('violations')}
              className="text-[10px] text-blue-600 hover:underline font-bold flex items-center justify-end w-full pt-1"
            >
              Buka Data Pelanggaran <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Metric 3: Data Penggeledahan per Hari */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between relative group hover:border-amber-300 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-600" />
                Penggeledahan Hari Ini
              </span>
              <button
                type="button"
                onClick={handleOpenSearchModal}
                className="text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 px-2 py-0.5 rounded font-bold border border-amber-200 flex items-center gap-1 transition-colors"
                title="Edit Data Penggeledahan"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Data</span>
              </button>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-amber-600 tracking-tight">
                  {currentSearches.blockSearchesCount}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">Giat Blok</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Satopspatnal
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between items-center">
              <span>Penggeledahan P2U:</span>
              <strong className="text-slate-800 font-bold">{currentSearches.p2uSearchesCount} Orang/Barang</strong>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Hasil Temuan:</span>
              <strong className="text-emerald-700 font-bold truncate max-w-[120px]" title={currentSearches.forbiddenItemsFound}>
                {currentSearches.forbiddenItemsFound}
              </strong>
            </div>
          </div>
        </div>

        {/* Metric 4: Jumlah Blok Hunian & Kamar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between relative group hover:border-indigo-300 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                Blok & Kamar Hunian
              </span>
              <button
                type="button"
                onClick={handleOpenBlocksModal}
                className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-0.5 rounded font-bold border border-indigo-200 flex items-center gap-1 transition-colors"
                title="Kelola Jumlah Blok & Kamar"
              >
                <Edit3 className="w-3 h-3" />
                <span>Kelola Blok</span>
              </button>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-indigo-700 tracking-tight">{currentBlocks.length}</span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">Blok Hunian</span>
              </div>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                Total {totalRooms} Kamar
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between items-center">
              <span>Total Kapasitas Kamar:</span>
              <strong className="text-indigo-900 font-bold">{totalRooms} Ruang Kamar</strong>
            </div>
            <div className="text-[10px] text-slate-500">
              Rata-rata: {Math.round(totalWBP / (totalRooms || 1))} WBP / Kamar
            </div>
          </div>
        </div>

        {/* Metric 5: Kontrol & Status Pegawai Cuti */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between relative group hover:border-emerald-300 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Pegawai Cuti / Dinas
              </span>
              <button
                type="button"
                onClick={() => handleOpenLeaveModal()}
                className="text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-2 py-0.5 rounded font-bold border border-emerald-200 flex items-center gap-1 transition-colors"
                title="Input Izin Cuti / Ubah Status Pegawai"
              >
                <Plus className="w-3 h-3" />
                <span>Input Cuti</span>
              </button>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-emerald-700 tracking-tight">
                  {leaveOfficersList.length}
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5">Sedang Cuti</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                {totalOfficersCount} Pegawai
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between items-center">
              <span>Hadir Dinas:</span>
              <strong className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">{activeDutyOfficersCount} Orang</strong>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Lepas Dinas:</span>
              <strong className="text-slate-700 font-bold">{offDutyOfficersCount} Orang</strong>
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('section-kontrol-pegawai-cuti');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[10px] text-emerald-700 hover:underline font-bold flex items-center justify-end w-full pt-1"
            >
              Buka Kontrol Cuti <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Detailed Section: Interactive Housing Blocks Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Detail Blok & Kamar Hunian Lapas Batang</h3>
              <p className="text-xs text-slate-500">Rincian pembagian kamar, edit & hapus rincian kamar, serta unduh data rekapitulasi keseluruhan blok</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleDownloadBlocksCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
              title="Unduh Data Rekapitulasi Blok & Kamar ke Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Data Blok (CSV)</span>
            </button>

            <button
              onClick={handlePrintBlocksReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
              title="Cetak Laporan Rekapitulasi Blok & Kamar"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan</span>
            </button>

            <button
              onClick={handleOpenBlocksModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Kelola Susunan Blok</span>
            </button>
          </div>
        </div>

        {/* Rekapitulasi Keseluruhan Penghuni Lapas (Sinkron Data WBP Utama) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-4 shadow-sm border border-indigo-900 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Rekapitulasi Keseluruhan Penghuni Lapas (Sinkron Data Utama WBP)
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Check className="w-3 h-3" />
              DATA SINKRON
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-lg p-2.5 border border-white/10">
              <span className="text-[10px] text-slate-300 uppercase font-semibold block">Tahanan</span>
              <strong className="text-lg font-black text-blue-300">{stats.tahananCount} <span className="text-xs font-normal text-slate-300">Orang</span></strong>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 border border-white/10">
              <span className="text-[10px] text-slate-300 uppercase font-semibold block">Narapidana</span>
              <strong className="text-lg font-black text-slate-100">{stats.napiCount} <span className="text-xs font-normal text-slate-300">Orang</span></strong>
            </div>
            <div className="bg-emerald-950/40 rounded-lg p-2.5 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Total Penghuni Real Lapas</span>
              <strong className="text-xl font-black text-emerald-400">{totalRealOccupants} <span className="text-xs font-normal text-emerald-200">WBP</span></strong>
            </div>
            <div className="bg-indigo-950/40 rounded-lg p-2.5 border border-indigo-500/30">
              <span className="text-[10px] text-indigo-300 uppercase font-bold block">Kapasitas Maks & % Over</span>
              <strong className="text-lg font-black text-indigo-200">{totalMaxRoomCapacity} <span className="text-xs font-normal text-indigo-300">WBP ({totalRooms} Kamar)</span></strong>
              <div className="text-[11px] font-bold text-amber-300 mt-0.5">
                Keterisian: {totalOccupancyRate}% ({totalOverPercent > 0 ? `+${totalOverPercent}% Over` : 'Normal'})
              </div>
            </div>
          </div>
        </div>

        {/* Grid per Blok & Rincian Kamar */}
        {(() => {
          const isFilterActive = Boolean(blockSearchTerm.trim() || selectedBlockFilter !== 'ALL' || blockStatusFilter !== 'ALL');
          const term = blockSearchTerm.trim().toLowerCase();

          const totalFilteredRoomsCount = currentBlocks.reduce((acc, blk) => {
            if (selectedBlockFilter !== 'ALL' && blk.id !== selectedBlockFilter) return acc;
            const allRooms = getRoomsForBlock(blk);
            const blockMatches = !term || blk.name.toLowerCase().includes(term) || (blk.description || '').toLowerCase().includes(term);

            const matchingRooms = allRooms.filter((room) => {
              const roomNameMatch = !term || room.name.toLowerCase().includes(term);
              const noteMatch = !term || (room.notes || '').toLowerCase().includes(term) || (room.description || '').toLowerCase().includes(term);
              const matchesSearch = blockMatches || roomNameMatch || noteMatch;

              const occ = room.currentOccupants || 0;
              const cap = room.maxCapacity || 10;
              const isOver = occ > cap;

              let matchesStatus = true;
              if (blockStatusFilter === 'OVER') matchesStatus = isOver;
              if (blockStatusFilter === 'NORMAL') matchesStatus = !isOver;

              return matchesSearch && matchesStatus;
            });

            return acc + matchingRooms.length;
          }, 0);

          const filteredBlocks = currentBlocks.filter((blk) => {
            if (selectedBlockFilter !== 'ALL' && blk.id !== selectedBlockFilter) {
              return false;
            }
            const allRooms = getRoomsForBlock(blk);
            const blockMatches = !term || blk.name.toLowerCase().includes(term) || (blk.description || '').toLowerCase().includes(term);

            const matchingRooms = allRooms.filter((room) => {
              const roomNameMatch = !term || room.name.toLowerCase().includes(term);
              const noteMatch = !term || (room.notes || '').toLowerCase().includes(term) || (room.description || '').toLowerCase().includes(term);
              const matchesSearch = blockMatches || roomNameMatch || noteMatch;

              const occ = room.currentOccupants || 0;
              const cap = room.maxCapacity || 10;
              const isOver = occ > cap;

              let matchesStatus = true;
              if (blockStatusFilter === 'OVER') matchesStatus = isOver;
              if (blockStatusFilter === 'NORMAL') matchesStatus = !isOver;

              return matchesSearch && matchesStatus;
            });

            return matchingRooms.length > 0 || blockMatches;
          });

          return (
            <div className="space-y-4">
              {/* Toolbar Filter & Pencarian Detail Blok & Kamar */}
              <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={blockSearchTerm}
                      onChange={(e) => setBlockSearchTerm(e.target.value)}
                      placeholder="Cari kamar, blok, atau catatan khusus (misal: E-01, Lansia, Tamping, Alpha)..."
                      className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                    />
                    {blockSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setBlockSearchTerm('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                        title="Hapus pencarian"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Filter by Block */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-slate-500 hidden lg:inline">Blok:</span>
                      <select
                        value={selectedBlockFilter}
                        onChange={(e) => setSelectedBlockFilter(e.target.value)}
                        className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-600 shadow-2xs cursor-pointer"
                      >
                        <option value="ALL">Semua Blok</option>
                        {currentBlocks.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter by Overcapacity Status */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-slate-500 hidden lg:inline">Status:</span>
                      <select
                        value={blockStatusFilter}
                        onChange={(e) => setBlockStatusFilter(e.target.value as 'ALL' | 'OVER' | 'NORMAL')}
                        className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-600 shadow-2xs cursor-pointer"
                      >
                        <option value="ALL">Semua Status Keterisian</option>
                        <option value="OVER">⚠️ Overcapacity (&gt;100%)</option>
                        <option value="NORMAL">✅ Normal (≤100%)</option>
                      </select>
                    </div>

                    {/* Reset Filters button if any filter active */}
                    {isFilterActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setBlockSearchTerm('');
                          setSelectedBlockFilter('ALL');
                          setBlockStatusFilter('ALL');
                        }}
                        className="flex items-center gap-1 px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors shrink-0"
                        title="Reset Semua Filter"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Filter Result Banner */}
                {isFilterActive && (
                  <div className="flex items-center justify-between bg-indigo-50/90 border border-indigo-200/80 rounded-lg px-3 py-1.5 text-xs text-indigo-950 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>
                        Hasil Pencarian/Filter: Menampilkan <strong>{totalFilteredRoomsCount} kamar</strong> dari total {totalRooms} kamar.
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setBlockSearchTerm('');
                        setSelectedBlockFilter('ALL');
                        setBlockStatusFilter('ALL');
                      }}
                      className="text-indigo-700 hover:text-indigo-900 underline text-[11px] font-bold shrink-0 ml-2"
                    >
                      Bersihkan Filter
                    </button>
                  </div>
                )}
              </div>

              {/* Grid or Empty State */}
              {filteredBlocks.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
                  <Search className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Tidak Ada Kamar / Blok yang Sesuai</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Pencarian kata kunci <span className="font-bold text-slate-700">"{blockSearchTerm}"</span> atau kriteria filter yang Anda pilih tidak menemukan hasil kamar.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBlockSearchTerm('');
                      setSelectedBlockFilter('ALL');
                      setBlockStatusFilter('ALL');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors mt-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filter Pencarian</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredBlocks.map((blk) => {
                    const allRoomsInBlock = getRoomsForBlock(blk);
                    const blockMatches = !term || blk.name.toLowerCase().includes(term) || (blk.description || '').toLowerCase().includes(term);

                    const roomList = allRoomsInBlock.filter((room) => {
                      const roomNameMatch = !term || room.name.toLowerCase().includes(term);
                      const noteMatch = !term || (room.notes || '').toLowerCase().includes(term) || (room.description || '').toLowerCase().includes(term);
                      const matchesSearch = blockMatches || roomNameMatch || noteMatch;

                      const occ = room.currentOccupants || 0;
                      const cap = room.maxCapacity || 10;
                      const isOver = occ > cap;

                      let matchesStatus = true;
                      if (blockStatusFilter === 'OVER') matchesStatus = isOver;
                      if (blockStatusFilter === 'NORMAL') matchesStatus = !isOver;

                      return matchesSearch && matchesStatus;
                    });

                    const isExpanded = isFilterActive ? true : (expandedBlocks[blk.id] ?? true);
                    const blockRealOcc = roomList.reduce((s, r) => s + (Number(r.currentOccupants) || 0), 0);
                    const blockMaxCap = roomList.reduce((s, r) => s + (Number(r.maxCapacity) || 10), 0);
                    const blockRate = blockMaxCap > 0 ? Math.round((blockRealOcc / blockMaxCap) * 100) : 0;
                    const blockOverPercent = blockRate - 100;

                    return (
                      <div
                        key={blk.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3.5 shadow-2xs"
                      >
                        {/* Block Header Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                          <div>
                            <div className="flex items-center gap-2">
                              <DoorOpen className="w-4 h-4 text-indigo-600" />
                              <h4 className="font-extrabold text-sm text-slate-900">{blk.name}</h4>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{blk.description || 'Kamar Hunian WBP'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                            <span className="px-2.5 py-1 bg-indigo-600 text-white font-mono font-bold text-xs rounded-md shadow-2xs">
                              {roomList.length} Kamar
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenAddRoom(blk.id, blk.name)}
                              className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-md border border-emerald-200 transition-colors"
                              title="Tambah Kamar Baru ke Blok Ini"
                            >
                              <Plus className="w-3 h-3 text-emerald-600" />
                              <span>Tambah Kamar</span>
                            </button>
                          </div>
                        </div>

                        {/* Block Summary Bar with Real Occupants, Max Capacity & % Over */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-slate-500">Penghuni Real:</span>
                            <strong className="text-indigo-950 font-black">{blockRealOcc} WBP</strong>
                          </div>
                          <div className="flex items-center justify-between px-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-1 sm:pt-0">
                            <span className="text-slate-500">Kapasitas Maks:</span>
                            <strong className="text-slate-800 font-bold">{blockMaxCap} WBP</strong>
                          </div>
                          <div className="flex items-center justify-between px-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-1 sm:pt-0">
                            <span className="text-slate-500">% Over Capacity:</span>
                            {blockOverPercent > 0 ? (
                              <span className="font-black text-[11px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                {blockRate}% (+{blockOverPercent}% Over)
                              </span>
                            ) : (
                              <span className="font-bold text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {blockRate}% (Normal)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Toggle Button for Room Breakdown */}
                        <button
                          type="button"
                          onClick={() => toggleBlockExpanded(blk.id)}
                          className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-md transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Rincian Kamar Hunian ({roomList.length} Ruang Kamar)</span>
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-semibold">
                            <span>{isExpanded ? 'Sembunyikan' : 'Tampilkan Detail'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </div>
                        </button>

                        {/* Expanded Grid of Rooms with Real Occupants, Max Cap & % Over */}
                        {isExpanded && (
                          <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                              {roomList.map((room) => {
                                const occ = room.currentOccupants || 0;
                                const cap = room.maxCapacity || 10;
                                const rate = cap > 0 ? Math.round((occ / cap) * 100) : 0;
                                const over = rate - 100;

                                return (
                                  <div
                                    key={room.id}
                                    className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between space-y-2 hover:border-indigo-300 hover:shadow-2xs transition-all group"
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="min-w-0 flex-1">
                                        <span className="font-extrabold text-xs text-slate-900 truncate block" title={room.name}>
                                          {room.name}
                                        </span>
                                        {(room.notes || room.description) && (
                                          <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 mt-0.5 inline-block truncate max-w-full" title={room.notes || room.description}>
                                            {room.notes || room.description}
                                          </span>
                                        )}
                                      </div>
                                      {/* Actions Menu: Edit & Hapus */}
                                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditRoom(blk.id, blk.name, room)}
                                          className="p-1 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded transition-colors"
                                          title={`Edit ${room.name}`}
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteRoom(blk.id, room.id, room.name)}
                                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                                          title={`Hapus ${room.name}`}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Data Real Penghuni, Kapasitas Maksimal, and % Over */}
                                    <div className="space-y-1 text-[11px] border-t border-slate-100 pt-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Penghuni Real:</span>
                                        <span className="font-black text-indigo-950 bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-100">
                                          {occ} WBP
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Kapasitas Maks:</span>
                                        <span className="font-semibold text-slate-700">
                                          {cap} WBP
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between border-t border-slate-100 pt-1 mt-1">
                                        <span className="text-[10px] text-slate-400 font-medium">% Keterisian:</span>
                                        {over > 0 ? (
                                          <span className="inline-flex items-center gap-0.5 font-black text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200" title={`Overcapacity +${over}%`}>
                                            <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                                            {rate}% (+{over}% Over)
                                          </span>
                                        ) : occ === cap ? (
                                          <span className="font-bold text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                            100% (Penuh)
                                          </span>
                                        ) : (
                                          <span className="font-bold text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                            {rate}% (Normal)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Button to Add New Room */}
                              <button
                                type="button"
                                onClick={() => handleOpenAddRoom(blk.id, blk.name)}
                                className="border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 rounded-lg p-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-700 transition-all min-h-[72px]"
                              >
                                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                                <span>+ Tambah Kamar</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Primary Dashboard Section: Kontrol & Rekapitulasi Status Pegawai Cuti */}
      <div id="section-kontrol-pegawai-cuti" className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Kontrol & Rekapitulasi Status Pegawai Cuti
                </h3>
                <p className="text-xs text-slate-500">
                  Pemantauan kehadiran dinas, pengajuan izin cuti pegawai (Tahunan, Sakit, Alasan Penting), dan penerbitan Surat Izin Cuti.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenLeaveModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input Status Cuti Baru</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrintLeaveDocument()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 transition-colors"
              title="Cetak Rekapitulasi Daftar Pegawai Cuti Resmi"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Rekap Cuti</span>
            </button>
          </div>
        </div>

        {/* Cuti Status Cards Overview (4 Quick Stats Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold">Sedang Cuti</span>
              <strong className="text-emerald-900 text-lg font-black">{leaveOfficersList.length} Orang</strong>
            </div>
            <div className="p-2 bg-emerald-200/70 text-emerald-800 rounded-md">
              <UserX className="w-4 h-4 text-emerald-800" />
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold">Hadir Dinas</span>
              <strong className="text-blue-900 text-lg font-black">{activeDutyOfficersCount} Orang</strong>
            </div>
            <div className="p-2 bg-blue-200/70 text-blue-800 rounded-md">
              <UserCheck className="w-4 h-4 text-blue-800" />
            </div>
          </div>

          <div className="bg-slate-100/80 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold">Lepas Dinas</span>
              <strong className="text-slate-800 text-lg font-black">{offDutyOfficersCount} Orang</strong>
            </div>
            <div className="p-2 bg-slate-200 text-slate-700 rounded-md">
              <Briefcase className="w-4 h-4 text-slate-600" />
            </div>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold">Persentase Kehadiran</span>
              <strong className="text-indigo-900 text-lg font-black">
                {Math.round((activeDutyOfficersCount / (totalOfficersCount || 1)) * 100)}%
              </strong>
            </div>
            <div className="p-2 bg-indigo-200/70 text-indigo-800 rounded-md">
              <FileCheck className="w-4 h-4 text-indigo-800" />
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={leaveSearchTerm}
              onChange={(e) => setLeaveSearchTerm(e.target.value)}
              placeholder="Cari nama pegawai, NIP, jenis cuti, atau nomor surat..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
            />
            {leaveSearchTerm && (
              <button
                type="button"
                onClick={() => setLeaveSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={leaveStatusFilter}
              onChange={(e) => setLeaveStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
            >
              <option value="ALL">Semua Status Dinas</option>
              <option value="CUTI">🔴 Sedang Cuti ({leaveOfficersList.length})</option>
              <option value="HADIR_DINAS">🔵 Hadir Dinas ({activeDutyOfficersCount})</option>
              <option value="LEPAS_DINAS">⚪ Lepas Dinas ({offDutyOfficersCount})</option>
            </select>

            <select
              value={leaveReguFilter}
              onChange={(e) => setLeaveReguFilter(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
            >
              <option value="ALL">Semua Regu / Staf</option>
              <option value="Staf KPLP/Kamtib">Staf KPLP/Kamtib</option>
              <option value="Regu I (Alpha)">Regu I (Alpha)</option>
              <option value="Regu II (Beta)">Regu II (Beta)</option>
              <option value="Regu IV (Delta)">Regu IV (Delta)</option>
            </select>

            {(leaveSearchTerm || leaveStatusFilter !== 'ALL' || leaveReguFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setLeaveSearchTerm('');
                  setLeaveStatusFilter('ALL');
                  setLeaveReguFilter('ALL');
                }}
                className="flex items-center gap-1 px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Leave Officers List / Grid */}
        {(() => {
          const filtered = allOfficers.filter((off) => {
            const term = leaveSearchTerm.trim().toLowerCase();
            const matchesSearch =
              !term ||
              off.name.toLowerCase().includes(term) ||
              off.nip.toLowerCase().includes(term) ||
              (off.position || '').toLowerCase().includes(term) ||
              (off.leaveType || '').toLowerCase().includes(term) ||
              (off.leaveReason || '').toLowerCase().includes(term) ||
              (off.leaveDocNumber || '').toLowerCase().includes(term);

            let matchesStatus = true;
            if (leaveStatusFilter === 'CUTI') matchesStatus = off.status === 'CUTI';
            if (leaveStatusFilter === 'HADIR_DINAS') matchesStatus = off.status === 'HADIR_DINAS';
            if (leaveStatusFilter === 'LEPAS_DINAS') matchesStatus = off.status === 'LEPAS_DINAS' || !off.status;

            let matchesRegu = true;
            if (leaveReguFilter !== 'ALL') matchesRegu = off.regu === leaveReguFilter;

            return matchesSearch && matchesStatus && matchesRegu;
          });

          if (filtered.length === 0) {
            return (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Tidak Ada Data Pegawai Cuti / Kehadiran Sesuai Filter</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Silakan ubah kata kunci pencarian atau filter status untuk melihat data pegawai.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenLeaveModal()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Input Status Cuti</span>
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((off) => {
                const isCuti = off.status === 'CUTI';

                return (
                  <div
                    key={off.id}
                    className={`rounded-xl border p-4 transition-all flex flex-col justify-between space-y-3 ${
                      isCuti
                        ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    {/* Card Top Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0 overflow-hidden border-2 border-slate-700">
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
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate" title={off.name}>
                            {off.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">NIP. {off.nip}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded border border-slate-200">
                            {off.regu}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {isCuti ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-black uppercase rounded-md shadow-2xs">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>CUTI</span>
                          </span>
                        ) : off.status === 'HADIR_DINAS' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>HADIR DINAS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">
                            <span>LEPAS DINAS</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rank & Position */}
                    <div className="text-[11px] bg-white/80 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Pangkat/Gol:</span>
                        <strong className="text-slate-800">{off.rank}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Jabatan:</span>
                        <strong className="text-slate-800 truncate max-w-[170px]" title={off.position}>
                          {off.position}
                        </strong>
                      </div>
                    </div>

                    {/* Leave Detail Info if Cuti */}
                    {isCuti && (
                      <div className="bg-white border border-rose-200 rounded-lg p-2.5 text-[11px] space-y-1.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-rose-600" />
                            {off.leaveType || 'Cuti Tahunan'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            {off.leaveDocNumber || 'No. Surat -'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Periode Cuti:</span>
                          <strong className="text-slate-900 font-extrabold">
                            {off.leaveStartDate || '-'} s/d {off.leaveEndDate || 'Selesai'}
                          </strong>
                        </div>

                        {off.leaveReason && (
                          <div className="text-[10px] text-slate-600 italic bg-amber-50/70 p-1.5 rounded border border-amber-200/80">
                            " {off.leaveReason} "
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                      {isCuti ? (
                        <button
                          type="button"
                          onClick={() => handleEndLeave(off)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-md transition-colors shadow-2xs"
                          title="Akhiri Cuti & Kembalikan ke Hadir Dinas"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Akhiri Cuti (Kembali Dinas)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenLeaveModal(off)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-md border border-rose-200 transition-colors"
                          title="Set Status Cuti untuk Pegawai Ini"
                        >
                          <Calendar className="w-3 h-3 text-rose-600" />
                          <span>Set Status Cuti</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenLeaveModal(off)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors"
                        title="Edit Details Status Cuti"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isCuti && (
                        <button
                          type="button"
                          onClick={() => handlePrintLeaveDocument(off)}
                          className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition-colors"
                          title="Cetak Surat Izin Cuti Resmi"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-700" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

      </div>

      {/* MODAL 1: Edit Data WBP (Tahanan & Narapidana) */}
      {isWbpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Edit Data Penghuni Lapas (Manual)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWbpModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWbp} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah Tahanan (Orang):
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formTahanan}
                  onChange={(e) => setFormTahanan(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah Narapidana (Orang):
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formNapi}
                  onChange={(e) => setFormNapi(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kapasitas Maksimal Lapas (Orang):
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 flex justify-between items-center font-bold">
                <span>Total Penghuni Lapas:</span>
                <span className="text-base text-blue-700 font-black">{formTahanan + formNapi} Orang</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWbpModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Data Pelanggaran Manual */}
      {isViolationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-sm">Edit Manual Data Narapidana Pelanggaran</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsViolationModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveViolation} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah Narapidana Register F Aktif:
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formRegF}
                  onChange={(e) => setFormRegF(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah WBP Sanksi Sel Isolasi / Tutupan Sunyi:
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formIsolasi}
                  onChange={(e) => setFormIsolasi(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsViolationModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Data Penggeledahan per Hari */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Edit Data Penggeledahan Hari Ini</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSearch} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Giat Penggeledahan Blok / Kamar Hunian:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={formBlockSearches}
                    onChange={(e) => setFormBlockSearches(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 text-xs">Kegiatan</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Penggeledahan Badan & Barang di P2U / Pengunjung:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={formP2uSearches}
                    onChange={(e) => setFormP2uSearches(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 text-xs">Orang / Barang</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hasil Temuan Barang Terlarang / Catatan Tambahan:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nihil (Kondisi Aman)"
                  value={formForbiddenItems}
                  onChange={(e) => setFormForbiddenItems(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Kelola Jumlah Blok Hunian & Kamar */}
      {isBlocksModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Kelola Data Blok Hunian & Jumlah Kamar</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBlocksModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlocks} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-800">Daftar Blok Hunian Lapas:</span>
                <button
                  type="button"
                  onClick={handleAddBlockItem}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Blok</span>
                </button>
              </div>

              <div className="space-y-3">
                {formBlocksList.map((blk, idx) => (
                  <div key={blk.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 relative">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Nama Blok:</label>
                        <input
                          type="text"
                          required
                          value={blk.name}
                          onChange={(e) => handleUpdateBlockItem(idx, 'name', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded p-2 font-bold text-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Jumlah Kamar:</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={blk.roomCount}
                          onChange={(e) => handleUpdateBlockItem(idx, 'roomCount', parseInt(e.target.value) || 1)}
                          className="w-full bg-white border border-slate-300 rounded p-2 font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold uppercase text-indigo-700 mb-0.5">Maksimal per Kamar:</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={blk.maxPerRoom || 10}
                          onChange={(e) => handleUpdateBlockItem(idx, 'maxPerRoom', parseInt(e.target.value) || 1)}
                          className="w-full bg-white border border-indigo-300 rounded p-2 font-mono font-bold text-indigo-900"
                        />
                      </div>
                      <div className="sm:col-span-1 flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteBlockItem(blk.id)}
                          className="w-full p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 flex items-center justify-center gap-1 font-semibold"
                          title="Hapus Blok"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sm:hidden">Hapus</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                      <div className="sm:col-span-8">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">Keterangan / Nomor Kamar:</label>
                        <input
                          type="text"
                          placeholder="Contoh: Kamar A-01 s/d A-08"
                          value={blk.description || ''}
                          onChange={(e) => handleUpdateBlockItem(idx, 'description', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded p-1.5 text-slate-700"
                        />
                      </div>
                      <div className="sm:col-span-4 flex items-end justify-end">
                        <div className="w-full text-right p-1.5 bg-indigo-50/80 rounded border border-indigo-100 text-[11px] font-bold text-indigo-900">
                          Kapasitas Blok: <span className="text-indigo-700 font-extrabold">{blk.roomCount * (blk.maxPerRoom || 10)} WBP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-bold">
                <div>
                  <span className="block text-slate-700 text-xs">Total Kamar Hunian:</span>
                  <span className="text-base text-indigo-800 font-black">
                    {formBlocksList.reduce((sum, b) => sum + (Number(b.roomCount) || 0), 0)} Ruang Kamar
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="block text-slate-700 text-xs">Total Kapasitas Maksimal:</span>
                  <span className="text-base text-indigo-700 font-black">
                    {formBlocksList.reduce((sum, b) => sum + ((Number(b.roomCount) || 0) * (Number(b.maxPerRoom) || 10)), 0)} WBP
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBlocksModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Susunan Blok</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit / Tambah Detail Kamar Hunian */}
      {roomModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-indigo-900 text-white">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-indigo-300" />
                <div>
                  <h3 className="font-bold text-sm">
                    {roomModal.isNew ? 'Tambah Kamar Baru' : 'Edit Detail Kamar Hunian'}
                  </h3>
                  <p className="text-[11px] text-indigo-200">{roomModal.blockName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoomModal({ isOpen: false, blockId: '', blockName: '', isNew: false })}
                className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Ruang / Nomor Kamar:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kamar A-01, Sel Khusus 01"
                  value={roomFormName}
                  onChange={(e) => setRoomFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jumlah Penghuni Real Saat Ini (WBP):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={roomFormOccupants}
                    onChange={(e) => setRoomFormOccupants(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-black text-indigo-950 focus:bg-white focus:border-indigo-600 focus:outline-none pr-24"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">
                    Orang WBP
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kapasitas Maksimal Standar Kamar (WBP):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={roomFormCap}
                    onChange={(e) => setRoomFormCap(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none pr-24"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">
                    Kapasitas Maks
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Keterangan / Catatan Khusus Kamar (Input Manual):
                </label>
                <input
                  type="text"
                  value={roomFormNotes}
                  onChange={(e) => setRoomFormNotes(e.target.value)}
                  placeholder="Contoh: Kamar Tamping Blok, Kamar Pekerja Dapur, Kamar Lansia, dll"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 font-bold">Pilihan Cepat:</span>
                  <button
                    type="button"
                    onClick={() => setRoomFormNotes('Kamar Tamping Blok')}
                    className="text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded transition-colors"
                  >
                    + Tamping Blok
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomFormNotes('Kamar Tamping Dapur')}
                    className="text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded transition-colors"
                  >
                    + Tamping Dapur
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomFormNotes('Kamar Lansia & Disabilitas')}
                    className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded transition-colors"
                  >
                    + Lansia
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomFormNotes('Kamar Pekerja / Asimilasi')}
                    className="text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded transition-colors"
                  >
                    + Pekerja
                  </button>
                  {roomFormNotes && (
                    <button
                      type="button"
                      onClick={() => setRoomFormNotes('')}
                      className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              {/* Live Overcapacity Preview Box inside Modal */}
              {(() => {
                const cap = Number(roomFormCap) || 1;
                const occ = Number(roomFormOccupants) || 0;
                const rate = Math.round((occ / cap) * 100);
                const over = rate - 100;
                return (
                  <div className={`p-3 rounded-lg border text-xs flex items-center justify-between font-bold ${
                    over > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {over > 0 ? <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" /> : <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      <span>Keterisian & Overcapacity:</span>
                    </div>
                    <span className="text-sm font-black">
                      {rate}% {over > 0 ? `(+${over}% Over)` : '(Normal)'}
                    </span>
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoomModal({ isOpen: false, blockId: '', blockName: '', isNew: false })}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{roomModal.isNew ? 'Tambah Kamar' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pengaturan Cetak Laporan Detail Blok & Kamar Hunian */}
      {isPrintBlockModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 text-slate-800 rounded-lg">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Cetak Laporan Detail Blok & Kamar Hunian</h3>
                  <p className="text-xs text-slate-500">Lengkapi data pejabat penandatangan dan unggah TTD digital sebelum mencetak</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintBlockModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nama Pejabat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Pejabat Penandatangan:
                </label>
                <input
                  type="text"
                  value={blockPejabatName}
                  onChange={(e) => setBlockPejabatName(e.target.value)}
                  placeholder="Contoh: SIGIT, S.H., M.H."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Jabatan Pejabat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jabatan / Posisi Pejabat:
                </label>
                <input
                  type="text"
                  value={blockPejabatTitle}
                  onChange={(e) => setBlockPejabatTitle(e.target.value)}
                  placeholder="Contoh: KA. KPLP LAPAS KELAS IIB BATANG"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* NIP Pejabat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NIP / NRP Pejabat:
                </label>
                <input
                  type="text"
                  value={blockPejabatNip}
                  onChange={(e) => setBlockPejabatNip(e.target.value)}
                  placeholder="Contoh: 19780512 200003 1 001"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* TTD Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  TTD Digital Pejabat (Unggah Gambar):
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-36 h-20 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-xs relative">
                    {blockPejabatTtd ? (
                      <img src={blockPejabatTtd} alt="TTD Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-center text-[11px] text-slate-400 font-medium">
                        Belum ada TTD
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors text-center">
                        <Upload className="w-4 h-4 shrink-0" />
                        <span>{blockPejabatTtd ? 'Ganti TTD' : 'Unggah TTD Digital'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadBlockTtd}
                          className="hidden"
                        />
                      </label>

                      {blockPejabatTtd && (
                        <button
                          type="button"
                          onClick={handleResetBlockTtd}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 transition-colors flex items-center gap-1 shrink-0"
                          title="Hapus TTD"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Format PNG/JPG transparan direkomendasikan. TTD akan otomatis tersimpan untuk laporan berikutnya.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Summary info box */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span>Total Penghuni Real:</span>
                  <strong className="text-slate-900">{totalRealOccupants} WBP</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Kamar Hunian:</span>
                  <strong className="text-slate-900">{totalRooms} Ruang Kamar</strong>
                </div>
                <div className="flex justify-between">
                  <span>Kapasitas Total & Status:</span>
                  <strong className={totalOverPercent > 0 ? "text-rose-700" : "text-emerald-700"}>
                    {totalMaxRoomCapacity} WBP ({totalOccupancyRate}% Keterisian)
                  </strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPrintBlockModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={doPrintBlocksReport}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Input / Edit Status Cuti Pegawai */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-white">
                  {editingOfficerForLeave ? `Edit Status Cuti: ${editingOfficerForLeave.name}` : 'Input Status Cuti Pegawai'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveLeave} className="p-5 space-y-4">
              {/* Select Officer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Pegawai / Petugas:</label>
                <select
                  value={formLeaveOfficerId}
                  onChange={(e) => {
                    setFormLeaveOfficerId(e.target.value);
                    const selected = allOfficers.find((o) => o.id === e.target.value);
                    if (selected) {
                      setFormLeaveStatus(selected.status || 'CUTI');
                      setFormLeaveType(selected.leaveType || 'Cuti Tahunan');
                      setFormLeaveRank(selected.rank || 'Penata Muda (III/a)');
                      setFormLeavePosition(selected.position || '');
                      setFormLeaveStartDate(selected.leaveStartDate || new Date().toISOString().split('T')[0]);
                      setFormLeaveEndDate(selected.leaveEndDate || '');
                      setFormLeaveReason(selected.leaveReason || '');
                      setFormLeaveDocNumber(selected.leaveDocNumber || `W13.PAS.PAS.10-KP.04.01-${Math.floor(100 + Math.random() * 900)}`);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  required
                >
                  {allOfficers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name} — NIP. {off.nip} ({off.rank || 'Penata Muda (III/a)'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Edit Pangkat / Golongan & Jabatan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pangkat / Golongan (Edit):</label>
                  <input
                    type="text"
                    list="leave-rank-options"
                    value={formLeaveRank}
                    onChange={(e) => setFormLeaveRank(e.target.value)}
                    placeholder="Contoh: Penata Muda (III/a)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                  <datalist id="leave-rank-options">
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Pos Penjagaan:</label>
                  <input
                    type="text"
                    value={formLeavePosition}
                    onChange={(e) => setFormLeavePosition(e.target.value)}
                    placeholder="Contoh: Staf KPLP / Karupam I"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Status Dinas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Kehadiran:</label>
                  <select
                    value={formLeaveStatus}
                    onChange={(e) => setFormLeaveStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="CUTI">🔴 CUTI (Sedang Meninggalkan Dinas)</option>
                    <option value="HADIR_DINAS">🔵 HADIR DINAS</option>
                    <option value="LEPAS_DINAS">⚪ LEPAS DINAS</option>
                    <option value="SAKIT">💛 SAKIT</option>
                    <option value="IZIN">💜 IZIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Cuti / Izin:</label>
                  <select
                    value={formLeaveType}
                    onChange={(e) => setFormLeaveType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Cuti Tahunan">Cuti Tahunan</option>
                    <option value="Cuti Alasan Penting">Cuti Alasan Penting</option>
                    <option value="Cuti Sakit">Cuti Sakit</option>
                    <option value="Cuti Melahirkan">Cuti Melahirkan</option>
                    <option value="Cuti Besar">Cuti Besar</option>
                    <option value="Izin Dinas Luar">Izin Dinas Luar</option>
                  </select>
                </div>
              </div>

              {/* Tanggal Mulai & Selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai Cuti:</label>
                  <input
                    type="date"
                    value={formLeaveStartDate}
                    onChange={(e) => setFormLeaveStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai Cuti:</label>
                  <input
                    type="date"
                    value={formLeaveEndDate}
                    onChange={(e) => setFormLeaveEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Nomor Surat Izin Cuti */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Surat Izin / Perintah Cuti:</label>
                <input
                  type="text"
                  value={formLeaveDocNumber}
                  onChange={(e) => setFormLeaveDocNumber(e.target.value)}
                  placeholder="misal: W13.PAS.PAS.10-KP.04.01-188"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Alasan / Keterangan Cuti */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alasan / Keterangan Tambahan:</label>
                <textarea
                  rows={2}
                  value={formLeaveReason}
                  onChange={(e) => setFormLeaveReason(e.target.value)}
                  placeholder="misal: Urusan Keperluan Keluarga / Perawatan Kesehatan..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Status Cuti</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
