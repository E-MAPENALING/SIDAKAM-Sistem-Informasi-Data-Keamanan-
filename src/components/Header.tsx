import React, { useState, useEffect, useRef } from 'react';
import { SecurityLevel } from '../types';
import { ShieldAlert, ShieldCheck, Siren, Clock, UserCheck, Upload, RotateCcw, Cloud } from 'lucide-react';
import { ImipasLogo, setStoredAppLogo, getStoredAppLogo } from './ImipasLogo';
import { compressImage } from '../lib/imageUtils';

interface HeaderProps {
  securityLevel: SecurityLevel;
  onSecurityLevelChange: (level: SecurityLevel) => void;
  onOpenEmergencyModal: () => void;
  rupamActive: string;
  danrupamActive: string;
  totalWBP: number;
}

export const Header: React.FC<HeaderProps> = ({
  securityLevel,
  onSecurityLevelChange,
  onOpenEmergencyModal,
  rupamActive,
  danrupamActive,
  totalWBP,
}) => {
  const [time, setTime] = useState<string>('');
  const [hasCustomLogo, setHasCustomLogo] = useState<boolean>(() => !!getStoredAppLogo());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setHasCustomLogo(!!getStoredAppLogo());
    };
    window.addEventListener('app_logo_changed', handleUpdate);
    return () => window.removeEventListener('app_logo_changed', handleUpdate);
  }, []);

  const handleAppLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress image to max 300x300, 0.75 quality (~20KB - 50KB)
        const compressed = await compressImage(file, 300, 300, 0.75);
        if (compressed) {
          setStoredAppLogo(compressed);
        }
      } catch (err) {
        console.error('Error compressing logo:', err);
      }
    }
  };

  const handleResetAppLogo = () => {
    setStoredAppLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) +
          ' | ' +
          now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSecurityBadge = () => {
    switch (securityLevel) {
      case 'KONDUSIF':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: 'SIAGA AMAN',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        };
      case 'SIAGA':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400 animate-pulse',
          label: 'SIAGA PENGAWASAN',
          icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
        };
      case 'BAHAYA':
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse',
          dot: 'bg-red-400 animate-ping',
          label: 'BAHAYA / KRITIS',
          icon: <Siren className="w-4 h-4 text-red-400 animate-bounce" />,
        };
    }
  };

  const badge = getSecurityBadge();

  return (
    <header id="kplp-main-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          
          {/* Hidden File Input for App Logo */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAppLogoChange}
            accept="image/*,.svg"
            className="hidden"
          />

          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <ImipasLogo className="h-11 w-11 shrink-0 drop-shadow-md" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-500 text-white p-1 rounded-full shadow-lg text-xs transition-transform hover:scale-110"
                title="Ubah Logo Aplikasi"
              >
                <Upload className="w-3 h-3" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-black text-amber-400">
                  LAPAS KELAS IIB BATANG
                </span>
                {hasCustomLogo && (
                  <button
                    type="button"
                    onClick={handleResetAppLogo}
                    className="text-[10px] text-slate-400 hover:text-amber-400 underline flex items-center gap-0.5 ml-1 transition-colors"
                    title="Reset logo ke default"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset Logo</span>
                  </button>
                )}
              </div>
              <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>SIDAKAM</span>
                <span className="text-xs font-semibold text-slate-300 hidden sm:inline-block">
                  • Sistem Informasi Data Keamanan LAPAS BATANG
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 sm:hidden">
                Sistem Informasi Data Keamanan LAPAS BATANG
              </p>
            </div>
          </div>

          {/* Status & Quick Emergency Tools */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Realtime Cloud Sync Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/60 rounded-md border border-emerald-800/80 text-xs text-emerald-300 shadow-sm" title="Data tersinkron otomatis real-time antara HP & Laptop">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-[11px] tracking-wide hidden sm:inline">Sync Realtime HP & Web</span>
            </div>

            {/* Clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 rounded-md border border-slate-800 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-slate-300">{time}</span>
            </div>

            {/* Regu Pengamanan Aktif */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-md border border-slate-700/80 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <div>
                <span className="text-slate-400 block text-[10px] leading-tight uppercase font-medium">Regu Jaga</span>
                <span className="font-semibold text-slate-200">{rupamActive}</span>
              </div>
            </div>

            {/* Security Level Dropdown Toggle */}
            <div className="flex items-center gap-1.5">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold ${badge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                {badge.icon}
                <span>{badge.label}</span>
              </div>

              <select
                id="security-level-select"
                value={securityLevel}
                onChange={(e) => onSecurityLevelChange(e.target.value as SecurityLevel)}
                className="bg-slate-950 text-xs text-slate-300 border border-slate-700 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                title="Ubah Status Keamanan"
              >
                <option value="KONDUSIF">KONDUSIF</option>
                <option value="SIAGA">SIAGA</option>
                <option value="BAHAYA">BAHAYA / KRITICAL</option>
              </select>
            </div>

            {/* Panic Button */}
            <button
              id="btn-emergency-panic"
              onClick={onOpenEmergencyModal}
              className="flex items-center gap-2 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow-sm transition-all active:scale-95"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
              </span>
              <span className="uppercase tracking-wider">Lapor Insiden Darurat</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
