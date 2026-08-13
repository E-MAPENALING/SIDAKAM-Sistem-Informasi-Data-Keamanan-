import { getStoredAppLogo } from '../components/ImipasLogo';

export const getKopSuratHTML = (titleText?: string, subtitleText?: string) => {
  const logoUrl = getStoredAppLogo();
  const defaultLogoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="%231e3a8a"/><path d="M50 15 L80 80 L20 80 Z" fill="%23fbbf24"/></svg>`;
  const activeLogo = logoUrl || defaultLogoSvg;

  return `
    <div style="display: flex; align-items: center; justify-content: center; position: relative; border-bottom: 3.5px double #000; padding-bottom: 8px; margin-bottom: 16px;">
      <div style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 80px; display: flex; align-items: center; justify-content: center;">
        <img src="${activeLogo}" style="max-width: 75px; max-height: 75px; object-fit: contain; display: block;" alt="Logo Imipas" />
      </div>
      <div style="text-align: center; width: 100%; padding-left: 80px; font-family: Arial, Helvetica, sans-serif; color: #000;">
        <div style="font-size: 10.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2px; line-height: 1.25;">KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA</div>
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; margin-top: 1px; line-height: 1.25;">KANTOR WILAYAH JAWA TENGAH</div>
        <div style="font-size: 11.5pt; font-weight: 900; text-transform: uppercase; margin-top: 2px; line-height: 1.25;">LEMBAGA PEMASYARAKATAN KELAS IIB BATANG</div>
        <div style="font-size: 8.5pt; font-weight: 600; margin-top: 3px; line-height: 1.2;">Jl. Raya Batang-Bandar km 4,1, Batang 51216, Telepon: (0285) 4494300</div>
      </div>
    </div>
    ${titleText ? `
      <div style="text-align: center; margin-bottom: 14px;">
        <div style="font-size: 12pt; font-weight: 900; font-family: 'Times New Roman', Times, serif; text-transform: uppercase; text-decoration: underline; letter-spacing: 0.5px;">${titleText}</div>
        ${subtitleText ? `<div style="font-size: 10pt; font-weight: 800; font-family: Arial, sans-serif; text-transform: uppercase; margin-top: 2px; color: #0f172a;">${subtitleText}</div>` : ''}
      </div>
    ` : ''}
  `;
};
