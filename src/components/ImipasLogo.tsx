import React, { useState, useEffect } from 'react';

interface ImipasLogoProps {
  className?: string;
  size?: number;
}

export const APP_LOGO_KEY = 'kemenimipas_app_logo';

export const getStoredAppLogo = (): string | null => {
  try {
    return localStorage.getItem(APP_LOGO_KEY) || null;
  } catch {
    return null;
  }
};

export const setStoredAppLogo = (logoData: string | null): void => {
  try {
    if (logoData) {
      localStorage.setItem(APP_LOGO_KEY, logoData);
    } else {
      localStorage.removeItem(APP_LOGO_KEY);
    }
    window.dispatchEvent(new Event('app_logo_changed'));
  } catch (err) {
    console.error('Error storing app logo:', err);
  }
};

export const ImipasLogoSVGString = `
<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <path id="kemenTextTop" d="M 60,250 A 190,190 0 1,1 440,250" fill="none" />
    <path id="kemenTextBottom" d="M 440,250 A 190,190 0 0,1 60,250" fill="none" />
  </defs>

  <!-- Deep Navy Blue Base Outer Circle -->
  <circle cx="250" cy="250" r="242" fill="#031f3c" stroke="#d4af37" stroke-width="4" />

  <!-- Outer Ring Text (White) -->
  <text fill="#ffffff" font-size="24.5" font-weight="900" font-family="'Arial Black', Arial, sans-serif" letter-spacing="1.5">
    <textPath href="#kemenTextTop" startOffset="50%" text-anchor="middle">
      KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN
    </textPath>
  </text>
  <text fill="#ffffff" font-size="26" font-weight="900" font-family="'Arial Black', Arial, sans-serif" letter-spacing="2.5">
    <textPath href="#kemenTextBottom" startOffset="50%" text-anchor="middle">
      REPUBLIK INDONESIA
    </textPath>
  </text>

  <!-- Golden Rope / Chain Inner Ring -->
  <circle cx="250" cy="250" r="198" fill="none" stroke="#e5a913" stroke-width="8" stroke-dasharray="10 6" />
  <circle cx="250" cy="250" r="202" fill="none" stroke="#fef08a" stroke-width="1.5" />
  <circle cx="250" cy="250" r="194" fill="none" stroke="#b45309" stroke-width="1.5" />

  <!-- Inner Navy Field -->
  <circle cx="250" cy="250" r="190" fill="#031f3c" />

  <!-- Top Center Golden Star -->
  <polygon points="250,82 255.5,98 272,98 258.5,108 263.5,124 250,114 236.5,124 241.5,108 228,98 244.5,98" fill="#eab308" stroke="#fde047" stroke-width="1" />

  <!-- Left Laurel / Wheat Wreath (Gold) -->
  <g fill="#eab308" stroke="#ca8a04" stroke-width="1">
    <path d="M 235,115 C 200,120 160,135 125,180 C 110,210 100,250 105,290 C 110,325 125,360 155,390 C 185,415 220,425 242,427 C 230,420 195,405 168,375 C 140,345 125,310 122,275 C 120,240 130,205 150,175 C 170,148 200,130 235,115 Z" />
    <path d="M 205,128 C 175,135 150,165 140,185 C 158,172 185,152 205,128 Z" />
    <path d="M 180,150 C 150,165 130,195 120,220 C 140,202 165,180 180,150 Z" />
    <path d="M 155,185 C 130,205 110,235 105,265 C 122,242 145,218 155,185 Z" />
    <path d="M 138,225 C 115,250 100,280 100,310 C 115,285 132,258 138,225 Z" />
    <path d="M 130,270 C 112,298 102,328 108,355 C 120,328 132,298 130,270 Z" />
    <path d="M 135,315 C 120,342 118,370 130,392 C 138,368 142,338 135,315 Z" />
    <path d="M 152,358 C 140,380 145,402 162,418 C 165,398 162,378 152,358 Z" />
    <path d="M 180,392 C 170,410 182,425 202,435 C 200,418 192,402 180,392 Z" />
  </g>

  <!-- Right Laurel / Wheat Wreath (Gold) -->
  <g fill="#eab308" stroke="#ca8a04" stroke-width="1">
    <path d="M 265,115 C 300,120 340,135 375,180 C 390,210 400,250 395,290 C 390,325 375,360 345,390 C 315,415 280,425 258,427 C 270,420 305,405 332,375 C 360,345 375,310 378,275 C 380,240 370,205 350,175 C 330,148 300,130 265,115 Z" />
    <path d="M 295,128 C 325,135 350,165 360,185 C 342,172 315,152 295,128 Z" />
    <path d="M 320,150 C 350,165 370,195 380,220 C 360,202 335,180 320,150 Z" />
    <path d="M 345,185 C 370,205 390,235 395,265 C 378,242 355,218 345,185 Z" />
    <path d="M 362,225 C 385,250 400,280 400,310 C 385,285 368,258 362,225 Z" />
    <path d="M 370,270 C 388,298 398,328 392,355 C 380,328 368,298 370,270 Z" />
    <path d="M 365,315 C 380,342 382,370 370,392 C 362,368 358,338 365,315 Z" />
    <path d="M 348,358 C 360,380 355,402 338,418 C 335,398 338,378 348,358 Z" />
    <path d="M 320,392 C 330,410 318,425 298,435 C 300,418 308,402 320,392 Z" />
  </g>

  <!-- GARUDA PANCASILA CENTER -->
  <g>
    <!-- Left Wing -->
    <path d="M 250,230 C 230,200 190,170 155,160 C 170,185 185,210 195,240 C 175,220 150,200 130,195 C 150,220 170,245 185,270 C 165,250 140,235 125,230 C 145,255 168,280 182,305 C 165,290 145,280 135,275 C 155,298 178,320 190,340 C 180,335 160,328 150,325 C 170,345 195,360 215,370 C 230,350 240,310 242,280 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1.5" />
    <!-- Right Wing -->
    <path d="M 250,230 C 270,200 310,170 345,160 C 330,185 315,210 305,240 C 325,220 350,200 370,195 C 350,220 330,245 315,270 C 335,250 360,235 375,230 C 355,255 332,280 318,305 C 335,290 355,280 365,275 C 345,298 322,320 310,340 C 320,335 340,328 350,325 C 330,345 305,360 285,370 C 270,350 260,310 258,280 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1.5" />
    <!-- Tail Feathers -->
    <path d="M 230,365 L 210,410 L 225,415 L 235,375 L 245,420 L 255,420 L 265,375 L 275,415 L 290,410 L 270,365 Z" fill="#d97706" stroke="#78350f" stroke-width="1.5" />
    <!-- Head & Beak facing Right -->
    <path d="M 242,190 C 242,175 250,165 262,168 C 272,170 278,175 272,182 C 265,185 260,188 252,188 Z" fill="#f59e0b" stroke="#92400e" stroke-width="1" />
    <path d="M 265,170 C 278,172 284,178 273,184 C 268,182 266,177 265,170 Z" fill="#fde047" stroke="#b45309" stroke-width="1" />
    <circle cx="260" cy="174" r="2.5" fill="#000000" />
    <!-- Claws holding ribbon -->
    <path d="M 215,355 L 200,365 M 225,358 L 215,370 M 285,355 L 300,365 M 275,358 L 285,370" stroke="#b45309" stroke-width="3" stroke-linecap="round" />
    <!-- White Ribbon -->
    <path d="M 175,360 C 210,350 290,350 325,360 L 335,378 C 300,365 200,365 165,378 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
    <path d="M 165,378 L 150,362 L 175,360 Z M 335,378 L 350,362 L 325,360 Z" fill="#e2e8f0" stroke="#000000" stroke-width="1" />
    <text x="250" y="371" fill="#000000" font-size="9" font-weight="bold" font-family="'Times New Roman', serif" text-anchor="middle" letter-spacing="0.8">BHINNEKA TUNGGAL IKA</text>

    <!-- PANCASILA SHIELD -->
    <path d="M 210,220 L 290,220 C 290,280 270,325 250,338 C 230,325 210,280 210,220 Z" fill="#ffffff" stroke="#d97706" stroke-width="4" />
    <!-- Top Left Red -->
    <path d="M 212,222 L 248,222 L 248,273 L 212,273 C 212,250 212,230 212,222 Z" fill="#dc2626" />
    <!-- Top Right White -->
    <path d="M 252,222 L 288,222 C 288,230 288,250 288,273 L 252,273 Z" fill="#ffffff" />
    <!-- Bottom Left White -->
    <path d="M 212,277 L 248,277 L 248,333 C 235,325 220,305 212,277 Z" fill="#ffffff" />
    <!-- Bottom Right Red -->
    <path d="M 252,277 L 288,277 C 280,305 265,325 252,333 Z" fill="#dc2626" />
    <!-- Equator Thick Line -->
    <line x1="210" y1="275" x2="290" y2="275" stroke="#000000" stroke-width="4" />

    <!-- Center Black Shield with Gold Star (Bintang) -->
    <path d="M 236,260 L 264,260 C 264,282 258,292 250,296 C 242,292 236,282 236,260 Z" fill="#000000" stroke="#fde047" stroke-width="1" />
    <polygon points="250,265 252.5,272 260,272 254,276.5 256,284 250,279 244,284 246,276.5 240,272 247.5,272" fill="#fde047" />

    <!-- Top Left: Kepala Banteng -->
    <g transform="translate(222, 230)">
      <path d="M 4,6 C 0,0 8,-2 13,8 M 22,6 C 26,0 18,-2 13,8" fill="none" stroke="#000000" stroke-width="2.5" />
      <path d="M 7,8 L 19,8 L 16,20 L 10,20 Z" fill="#000000" />
    </g>

    <!-- Top Right: Pohon Beringin -->
    <g transform="translate(260, 230)">
      <circle cx="10" cy="8" r="8" fill="#16a34a" />
      <circle cx="5" cy="11" r="5" fill="#15803d" />
      <circle cx="15" cy="11" r="5" fill="#15803d" />
      <path d="M 9,14 L 11,14 L 11,21 L 13,23 M 9,18 L 7,23" fill="none" stroke="#78350f" stroke-width="2" />
    </g>

    <!-- Bottom Left: Padi dan Kapas -->
    <g transform="translate(218, 282)">
      <path d="M 6,20 C 6,10 12,4 12,2" fill="none" stroke="#eab308" stroke-width="1.5" />
      <circle cx="6" cy="18" r="1.5" fill="#eab308" />
      <circle cx="8" cy="14" r="1.5" fill="#eab308" />
      <circle cx="10" cy="10" r="1.5" fill="#eab308" />
      <circle cx="18" cy="16" r="2.5" fill="#ffffff" stroke="#16a34a" stroke-width="1" />
      <circle cx="21" cy="11" r="2.5" fill="#ffffff" stroke="#16a34a" stroke-width="1" />
    </g>

    <!-- Bottom Right: Rantai Emas -->
    <g transform="translate(260, 285)">
      <circle cx="6" cy="15" r="4" fill="none" stroke="#fde047" stroke-width="2" />
      <circle cx="14" cy="15" r="4" fill="none" stroke="#fde047" stroke-width="2" />
      <circle cx="10" cy="7" r="4" fill="none" stroke="#fde047" stroke-width="2" />
    </g>
  </g>
</svg>
`;

export const ImipasLogo: React.FC<ImipasLogoProps> = ({ className = 'w-10 h-10', size }) => {
  const [customLogo, setCustomLogo] = useState<string | null>(getStoredAppLogo);

  useEffect(() => {
    const handleUpdate = () => {
      setCustomLogo(getStoredAppLogo());
    };
    window.addEventListener('app_logo_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('app_logo_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (customLogo) {
    if (customLogo.trim().startsWith('<svg')) {
      return (
        <div
          className={`inline-block ${className}`}
          style={size ? { width: size, height: size } : undefined}
          dangerouslySetInnerHTML={{ __html: customLogo }}
        />
      );
    }
    return (
      <img
        src={customLogo}
        alt="Logo Aplikasi"
        className={`object-contain ${className}`}
        style={size ? { width: size, height: size } : undefined}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path id="kemenTextTopComp" d="M 60,250 A 190,190 0 1,1 440,250" fill="none" />
        <path id="kemenTextBottomComp" d="M 440,250 A 190,190 0 0,1 60,250" fill="none" />
      </defs>

      {/* Deep Navy Blue Base Outer Circle */}
      <circle cx="250" cy="250" r="242" fill="#031f3c" stroke="#d4af37" strokeWidth="4" />

      {/* Outer Ring Text (White) */}
      <text fill="#ffffff" fontSize="24.5" fontWeight="900" fontFamily="'Arial Black', Arial, sans-serif" letterSpacing="1.5">
        <textPath href="#kemenTextTopComp" startOffset="50%" textAnchor="middle">
          KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN
        </textPath>
      </text>
      <text fill="#ffffff" fontSize="26" fontWeight="900" fontFamily="'Arial Black', Arial, sans-serif" letterSpacing="2.5">
        <textPath href="#kemenTextBottomComp" startOffset="50%" textAnchor="middle">
          REPUBLIK INDONESIA
        </textPath>
      </text>

      {/* Golden Rope / Chain Inner Ring */}
      <circle cx="250" cy="250" r="198" fill="none" stroke="#e5a913" strokeWidth="8" strokeDasharray="10 6" />
      <circle cx="250" cy="250" r="202" fill="none" stroke="#fef08a" strokeWidth="1.5" />
      <circle cx="250" cy="250" r="194" fill="none" stroke="#b45309" strokeWidth="1.5" />

      {/* Inner Navy Field */}
      <circle cx="250" cy="250" r="190" fill="#031f3c" />

      {/* Top Center Golden Star */}
      <polygon points="250,82 255.5,98 272,98 258.5,108 263.5,124 250,114 236.5,124 241.5,108 228,98 244.5,98" fill="#eab308" stroke="#fde047" strokeWidth="1" />

      {/* Left Laurel / Wheat Wreath (Gold) */}
      <g fill="#eab308" stroke="#ca8a04" strokeWidth="1">
        <path d="M 235,115 C 200,120 160,135 125,180 C 110,210 100,250 105,290 C 110,325 125,360 155,390 C 185,415 220,425 242,427 C 230,420 195,405 168,375 C 140,345 125,310 122,275 C 120,240 130,205 150,175 C 170,148 200,130 235,115 Z" />
        <path d="M 205,128 C 175,135 150,165 140,185 C 158,172 185,152 205,128 Z" />
        <path d="M 180,150 C 150,165 130,195 120,220 C 140,202 165,180 180,150 Z" />
        <path d="M 155,185 C 130,205 110,235 105,265 C 122,242 145,218 155,185 Z" />
        <path d="M 138,225 C 115,250 100,280 100,310 C 115,285 132,258 138,225 Z" />
        <path d="M 130,270 C 112,298 102,328 108,355 C 120,328 132,298 130,270 Z" />
        <path d="M 135,315 C 120,342 118,370 130,392 C 138,368 142,338 135,315 Z" />
        <path d="M 152,358 C 140,380 145,402 162,418 C 165,398 162,378 152,358 Z" />
        <path d="M 180,392 C 170,410 182,425 202,435 C 200,418 192,402 180,392 Z" />
      </g>

      {/* Right Laurel / Wheat Wreath (Gold) */}
      <g fill="#eab308" stroke="#ca8a04" strokeWidth="1">
        <path d="M 265,115 C 300,120 340,135 375,180 C 390,210 400,250 395,290 C 390,325 375,360 345,390 C 315,415 280,425 258,427 C 270,420 305,405 332,375 C 360,345 375,310 378,275 C 380,240 370,205 350,175 C 330,148 300,130 265,115 Z" />
        <path d="M 295,128 C 325,135 350,165 360,185 C 342,172 315,152 295,128 Z" />
        <path d="M 320,150 C 350,165 370,195 380,220 C 360,202 335,180 320,150 Z" />
        <path d="M 345,185 C 370,205 390,235 395,265 C 378,242 355,218 345,185 Z" />
        <path d="M 362,225 C 385,250 400,280 400,310 C 385,285 368,258 362,225 Z" />
        <path d="M 370,270 C 388,298 398,328 392,355 C 380,328 368,298 370,270 Z" />
        <path d="M 365,315 C 380,342 382,370 370,392 C 362,368 358,338 365,315 Z" />
        <path d="M 348,358 C 360,380 355,402 338,418 C 335,398 338,378 348,358 Z" />
        <path d="M 320,392 C 330,410 318,425 298,435 C 300,418 308,402 320,392 Z" />
      </g>

      {/* GARUDA PANCASILA CENTER */}
      <g>
        {/* Left Wing */}
        <path d="M 250,230 C 230,200 190,170 155,160 C 170,185 185,210 195,240 C 175,220 150,200 130,195 C 150,220 170,245 185,270 C 165,250 140,235 125,230 C 145,255 168,280 182,305 C 165,290 145,280 135,275 C 155,298 178,320 190,340 C 180,335 160,328 150,325 C 170,345 195,360 215,370 C 230,350 240,310 242,280 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
        {/* Right Wing */}
        <path d="M 250,230 C 270,200 310,170 345,160 C 330,185 315,210 305,240 C 325,220 350,200 370,195 C 350,220 330,245 315,270 C 335,250 360,235 375,230 C 355,255 332,280 318,305 C 335,290 355,280 365,275 C 345,298 322,320 310,340 C 320,335 340,328 350,325 C 330,345 305,360 285,370 C 270,350 260,310 258,280 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
        {/* Tail Feathers */}
        <path d="M 230,365 L 210,410 L 225,415 L 235,375 L 245,420 L 255,420 L 265,375 L 275,415 L 290,410 L 270,365 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
        {/* Head & Beak */}
        <path d="M 242,190 C 242,175 250,165 262,168 C 272,170 278,175 272,182 C 265,185 260,188 252,188 Z" fill="#f59e0b" stroke="#92400e" strokeWidth="1" />
        <path d="M 265,170 C 278,172 284,178 273,184 C 268,182 266,177 265,170 Z" fill="#fde047" stroke="#b45309" strokeWidth="1" />
        <circle cx="260" cy="174" r="2.5" fill="#000000" />
        {/* Claws holding ribbon */}
        <path d="M 215,355 L 200,365 M 225,358 L 215,370 M 285,355 L 300,365 M 275,358 L 285,370" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
        {/* Ribbon */}
        <path d="M 175,360 C 210,350 290,350 325,360 L 335,378 C 300,365 200,365 165,378 Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        <path d="M 165,378 L 150,362 L 175,360 Z M 335,378 L 350,362 L 325,360 Z" fill="#e2e8f0" stroke="#000000" strokeWidth="1" />
        <text x="250" y="371" fill="#000000" fontSize="9" fontWeight="bold" fontFamily="'Times New Roman', serif" textAnchor="middle" letterSpacing="0.8">BHINNEKA TUNGGAL IKA</text>

        {/* PANCASILA SHIELD */}
        <path d="M 210,220 L 290,220 C 290,280 270,325 250,338 C 230,325 210,280 210,220 Z" fill="#ffffff" stroke="#d97706" strokeWidth="4" />
        <path d="M 212,222 L 248,222 L 248,273 L 212,273 C 212,250 212,230 212,222 Z" fill="#dc2626" />
        <path d="M 252,222 L 288,222 C 288,230 288,250 288,273 L 252,273 Z" fill="#ffffff" />
        <path d="M 212,277 L 248,277 L 248,333 C 235,325 220,305 212,277 Z" fill="#ffffff" />
        <path d="M 252,277 L 288,277 C 280,305 265,325 252,333 Z" fill="#dc2626" />
        <line x1="210" y1="275" x2="290" y2="275" stroke="#000000" strokeWidth="4" />

        <path d="M 236,260 L 264,260 C 264,282 258,292 250,296 C 242,292 236,282 236,260 Z" fill="#000000" stroke="#fde047" strokeWidth="1" />
        <polygon points="250,265 252.5,272 260,272 254,276.5 256,284 250,279 244,284 246,276.5 240,272 247.5,272" fill="#fde047" />

        <g transform="translate(222, 230)">
          <path d="M 4,6 C 0,0 8,-2 13,8 M 22,6 C 26,0 18,-2 13,8" fill="none" stroke="#000000" strokeWidth="2.5" />
          <path d="M 7,8 L 19,8 L 16,20 L 10,20 Z" fill="#000000" />
        </g>

        <g transform="translate(260, 230)">
          <circle cx="10" cy="8" r="8" fill="#16a34a" />
          <circle cx="5" cy="11" r="5" fill="#15803d" />
          <circle cx="15" cy="11" r="5" fill="#15803d" />
          <path d="M 9,14 L 11,14 L 11,21 L 13,23 M 9,18 L 7,23" fill="none" stroke="#78350f" strokeWidth="2" />
        </g>

        <g transform="translate(218, 282)">
          <path d="M 6,20 C 6,10 12,4 12,2" fill="none" stroke="#eab308" strokeWidth="1.5" />
          <circle cx="6" cy="18" r="1.5" fill="#eab308" />
          <circle cx="8" cy="14" r="1.5" fill="#eab308" />
          <circle cx="10" cy="10" r="1.5" fill="#eab308" />
          <circle cx="18" cy="16" r="2.5" fill="#ffffff" stroke="#16a34a" strokeWidth="1" />
          <circle cx="21" cy="11" r="2.5" fill="#ffffff" stroke="#16a34a" strokeWidth="1" />
        </g>

        <g transform="translate(260, 285)">
          <circle cx="6" cy="15" r="4" fill="none" stroke="#fde047" strokeWidth="2" />
          <circle cx="14" cy="15" r="4" fill="none" stroke="#fde047" strokeWidth="2" />
          <circle cx="10" cy="7" r="4" fill="none" stroke="#fde047" strokeWidth="2" />
        </g>
      </g>
    </svg>
  );
};
