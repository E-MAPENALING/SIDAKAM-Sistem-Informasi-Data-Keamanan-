import React, { useState } from 'react';
import { SecurityStats, IncidentReport, ViolationRecord, BlockRoomInfo, InspectionDailyData, RoomDetail } from '../types';
import { ImipasLogo } from './ImipasLogo';
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
  Printer
} from 'lucide-react';

interface DashboardOverviewProps {
  stats: SecurityStats;
  incidents: IncidentReport[];
  violations: ViolationRecord[];
  onNavigateTab: (tab: string) => void;
  onQuickAddIncident: () => void;
  onQuickAddViolation: () => void;
  onUpdateIncidentStatus: (id: string, newStatus: any) => void;
  onUpdateStats?: (newStats: Partial<SecurityStats>) => void;
}

const DEFAULT_BLOCKS: BlockRoomInfo[] = [
  { id: 'blk-1', name: 'Blok Alpha (Tahanan)', roomCount: 8, maxPerRoom: 10, description: 'Kamar A-01 s/d A-08' },
  { id: 'blk-2', name: 'Blok Beta (Narapidana Dewasa)', roomCount: 14, maxPerRoom: 12, description: 'Kamar B-01 s/d B-14' },
  { id: 'blk-3', name: 'Blok Gamma (Wanita/Khusus)', roomCount: 6, maxPerRoom: 8, description: 'Kamar G-01 s/d G-06' },
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
  onNavigateTab,
  onQuickAddIncident,
  onQuickAddViolation,
  onUpdateIncidentStatus,
  onUpdateStats,
}) => {
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
    if (desc && desc.includes('A-')) return 'A-';
    if (desc && desc.includes('B-')) return 'B-';
    if (desc && desc.includes('G-')) return 'G-';
    if (desc && desc.includes('ISO-')) return 'ISO-';
    if (blkName.toLowerCase().includes('alpha')) return 'A-';
    if (blkName.toLowerCase().includes('beta')) return 'B-';
    if (blkName.toLowerCase().includes('gamma')) return 'G-';
    if (blkName.toLowerCase().includes('isolasi') || blkName.toLowerCase().includes('tutupan')) return 'ISO-';
    return 'Kmr-';
  };

  const getRoomsForBlock = (blk: BlockRoomInfo): RoomDetail[] => {
    if (blk.rooms && blk.rooms.length > 0) {
      return blk.rooms.map((r) => ({
        ...r,
        currentOccupants: r.currentOccupants !== undefined ? r.currentOccupants : Math.round((r.maxCapacity || 10) * 1.5),
      }));
    }
    const maxPerRoom = Number(blk.maxPerRoom) || 10;
    const prefix = getRoomPrefix(blk.name, blk.description);
    return Array.from({ length: blk.roomCount }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      const defaultCap = maxPerRoom;
      const defaultOcc = Math.round(defaultCap * 1.5);
      return {
        id: `${blk.id}-rm-${i + 1}`,
        name: `Kamar ${prefix}${num}`,
        maxCapacity: defaultCap,
        currentOccupants: defaultOcc,
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
    rows.push(['NO', 'NAMA BLOK', 'NAMA KAMAR / RUANG', 'PENGHUNI REAL (WBP)', 'KAPASITAS MAKSIMAL (WBP)', '% KETERISIAN', 'STATUS OVERCAPACITY']);

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
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rekapitulasi Blok & Kamar Hunian - Lapas Batang</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; line-height: 1.4; }
            h2, h3 { margin: 4px 0; text-align: center; }
            .header-box { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9.5pt; }
            th, td { border: 1px solid #334155; padding: 6px 8px; text-align: left; }
            th { background-color: #f1f5f9; text-align: center; font-weight: bold; color: #0f172a; }
            .center { text-align: center; }
            .meta-grid { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 9.5pt; background: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; }
            .block-title { font-weight: bold; background-color: #e2e8f0; margin-top: 18px; padding: 8px 10px; border: 1px solid #334155; font-size: 10.5pt; }
            .over-badge { color: #b91c1c; font-weight: bold; }
            .normal-badge { color: #047857; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header-box">
            <h2 style="font-size: 13pt; letter-spacing: 0.5px;">KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN</h2>
            <h3 style="font-size: 14pt; font-weight: 800;">LAPAS KELAS IIB BATANG</h3>
            <p style="margin: 4px 0 0 0; font-size: 10pt; font-weight: bold; color: #334155;">REKAPITULASI DETAIL BLOK & KAMAR HUNIAN WARGA BINAAN PEMASYARAKATAN</p>
          </div>

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

          <h3 style="text-align: left; font-size: 11pt; margin-top: 15px;">1. RINGKASAN REKAPITULASI PER BLOK HUNIAN</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 35px;">NO</th>
                <th>NAMA BLOK HUNIAN</th>
                <th>TIPE / DESKRIPSI</th>
                <th style="width: 80px;">JML KAMAR</th>
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
          <td class="center">${idx + 1}</td>
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

          <h3 style="text-align: left; font-size: 11pt; margin-top: 25px;">2. RINCIAN DETAIL KAMAR HUNIAN PER BLOK</h3>
    `;

    currentBlocks.forEach((blk) => {
      const rooms = getRoomsForBlock(blk);
      const blockRealOcc = rooms.reduce((s, r) => s + (Number(r.currentOccupants) || 0), 0);
      const blockMaxCap = rooms.reduce((s, r) => s + (Number(r.maxCapacity) || 10), 0);
      const rate = blockMaxCap > 0 ? Math.round((blockRealOcc / blockMaxCap) * 100) : 0;
      const over = rate - 100;

      htmlContent += `
        <div class="block-title">
          ${blk.name} — ${rooms.length} Kamar | Penghuni Real: ${blockRealOcc} WBP | Kapasitas Maks: ${blockMaxCap} WBP (${rate}% - ${over > 0 ? `Overcapacity +${over}%` : 'Normal'})
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 35px;">NO</th>
              <th>NAMA KAMAR / RUANG HUNIAN</th>
              <th style="width: 130px;">PENGHUNI REAL</th>
              <th style="width: 140px;">KAPASITAS MAKSIMAL</th>
              <th style="width: 150px;">STATUS & % OVERCAPACITY</th>
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
            <td class="center">${rIdx + 1}</td>
            <td><strong>${rm.name}</strong></td>
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
          <br><br>
          <table style="border: none; margin-top: 20px;">
            <tr style="border: none;">
              <td style="border: none; width: 60%;"></td>
              <td style="border: none; text-align: center;">
                Batang, ${today}<br>
                Mengetahui,<br>
                <strong>Kepala Kesatuan Pengamanan Lapas</strong>
                <br><br><br><br>
                <u><strong>NURIAKMAN, S.H.</strong></u><br>
                NIP. 19780512 200003 1 001
              </td>
            </tr>
          </table>
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

      {/* Primary Dashboard Metrics Grid (4 Main Manual Editable Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {currentBlocks.map((blk) => {
            const roomList = getRoomsForBlock(blk);
            const isExpanded = expandedBlocks[blk.id] ?? true;
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
                              <span className="font-extrabold text-xs text-slate-900 truncate" title={room.name}>
                                {room.name}
                              </span>
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

    </div>
  );
};
