// Téo, o técnico da Elite Parts. Desenho em SVG com boca e olhos animáveis.
// teo({ boca: 0..1 (abertura), piscar: 0..1, joinha: bool, olhar: -1..1 }) -> string <svg>
const PELE = '#c68a5e', PELE_E = '#a8704a', CABELO = '#1d1611', LUVA = '#5b8fe0', LUVA_E = '#3c6fc4';
const AZUL = '#2B57B8', AZUL_C = '#3D7BFF', ESCURO = '#151B29';

function teo({ boca = 0, piscar = 0, joinha = true, olhar = 0, simbolo = '' } = {}) {
  const o = Math.max(0, Math.min(1, boca));
  const ey = 26 * (1 - Math.max(0, Math.min(1, piscar)));
  const ox = olhar * 6;
  const olho = (x) => `
    <ellipse cx="${x}" cy="565" rx="36" ry="${Math.max(2, ey)}" fill="#fff"/>
    ${ey > 8 ? `<circle cx="${x + ox}" cy="567" r="19" fill="#3a2418"/><circle cx="${x + ox}" cy="567" r="10" fill="#0d0907"/>
    <circle cx="${x + ox + 7}" cy="560" r="6" fill="#fff"/>` : ''}
    <path d="M${x - 40} ${565 - ey - 2} Q${x} ${565 - ey - 16} ${x + 40} ${565 - ey - 2}" stroke="${PELE_E}" stroke-width="5" fill="none"/>`;
  // boca: sorriso fechado quando o=0; abre conforme fala
  const ly = 688, w = 64 - o * 10;
  const bocaSvg = o < 0.05
    ? `<path d="M${540 - w} ${ly} Q540 ${ly + 46} ${540 + w} ${ly}" stroke="#5a2418" stroke-width="9" stroke-linecap="round" fill="none"/>`
    : `<path d="M${540 - w} ${ly} Q540 ${ly + 14} ${540 + w} ${ly} Q540 ${ly + 30 + o * 95} ${540 - w} ${ly} Z" fill="#3b120d"/>
       <clipPath id="bc"><path d="M${540 - w} ${ly} Q540 ${ly + 14} ${540 + w} ${ly} Q540 ${ly + 30 + o * 95} ${540 - w} ${ly} Z"/></clipPath>
       <g clip-path="url(#bc)"><rect x="${540 - w}" y="${ly - 4}" width="${2 * w}" height="${14 + o * 4}" fill="#fff"/>
       <ellipse cx="540" cy="${ly + 30 + o * 80}" rx="${w * .6}" ry="${16 + o * 14}" fill="#c4544a"/></g>
       <path d="M${540 - w} ${ly} Q540 ${ly + 30 + o * 95} ${540 + w} ${ly}" stroke="#5a2418" stroke-width="6" fill="none"/>`;
  const braco = joinha ? `
    <path d="M905 1350 L930 1130 Q935 1070 900 1040" stroke="${AZUL}" stroke-width="150" stroke-linecap="round" fill="none"/>
    <path d="M905 1080 L880 940" stroke="${PELE}" stroke-width="92" stroke-linecap="round" fill="none"/>
    <rect x="812" y="850" width="140" height="130" rx="40" fill="${LUVA}" stroke="${LUVA_E}" stroke-width="5"/>
    ${[880, 912, 944].map(y => `<path d="M818 ${y} L870 ${y}" stroke="${LUVA_E}" stroke-width="5" stroke-linecap="round"/>`).join('')}
    <rect x="830" y="740" width="56" height="140" rx="28" fill="${LUVA}" stroke="${LUVA_E}" stroke-width="5"/>
    <rect x="852" y="955" width="96" height="40" rx="12" fill="${LUVA_E}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <!-- tronco: camisa polo azul da loja -->
  <g transform="translate(0,-45)">
  <path d="M150 1420 L160 1110 Q180 960 380 925 L700 925 Q900 960 920 1110 L930 1420 Z" fill="${AZUL}"/>
  <path d="M380 925 Q540 990 700 925 L700 940 Q540 1010 380 940 Z" fill="#244a9c"/>
  <path d="M455 905 L540 1010 L625 905 L610 900 L540 975 L470 900 Z" fill="${AZUL_C}"/>
  <path d="M440 905 L505 1000 L470 1015 L405 935 Z M640 905 L575 1000 L610 1015 L675 935 Z" fill="${AZUL_C}"/>
  <rect x="530" y="1000" width="20" height="120" rx="6" fill="#244a9c"/>
  <circle cx="540" cy="1035" r="7" fill="#e8eefb"/><circle cx="540" cy="1080" r="7" fill="#e8eefb"/>
  <rect x="640" y="1060" width="150" height="110" rx="18" fill="${ESCURO}"/>
  ${simbolo ? `<image href="${simbolo}" x="687" y="1072" width="56" height="86"/>` : ''}
  </g>
  <!-- pescoço, orelhas e rosto -->
  <rect x="460" y="740" width="160" height="150" rx="40" fill="${PELE_E}"/>
  <ellipse cx="352" cy="585" rx="36" ry="54" fill="${PELE_E}"/><ellipse cx="728" cy="585" rx="36" ry="54" fill="${PELE_E}"/>
  <ellipse cx="540" cy="565" rx="190" ry="228" fill="${PELE}"/>
  <path d="M365 600 Q380 790 540 800 Q700 790 715 600 Q700 720 620 745 Q540 770 460 745 Q380 720 365 600 Z" fill="rgba(40,22,14,.28)"/>
  <!-- cabelo curto -->
  <path d="M352 570 Q330 330 540 315 Q750 330 728 570 Q712 455 655 425 Q540 455 425 425 Q368 455 352 570 Z" fill="${CABELO}"/>
  ${[[400, 380], [450, 345], [510, 330], [570, 330], [630, 345], [680, 380], [372, 440], [708, 440]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="38" fill="${CABELO}"/>`).join('')}
  <!-- lupa de bancada na testa -->
  <path d="M356 480 Q540 395 724 480" stroke="${ESCURO}" stroke-width="26" fill="none" stroke-linecap="round"/>
  <rect x="455" y="378" width="170" height="74" rx="30" fill="${ESCURO}" stroke="#2a3550" stroke-width="5"/>
  <circle cx="500" cy="415" r="26" fill="${AZUL_C}"/><circle cx="580" cy="415" r="26" fill="${AZUL_C}"/>
  <circle cx="492" cy="406" r="8" fill="#cfe0ff"/><circle cx="572" cy="406" r="8" fill="#cfe0ff"/>
  <!-- sobrancelhas, olhos, nariz, bochechas, boca -->
  <path d="M410 505 Q450 488 488 500" stroke="${CABELO}" stroke-width="15" stroke-linecap="round" fill="none"/>
  <path d="M592 500 Q630 488 670 505" stroke="${CABELO}" stroke-width="15" stroke-linecap="round" fill="none"/>
  ${olho(450)}${olho(630)}
  <path d="M540 585 Q522 640 515 650 Q540 664 565 650" stroke="${PELE_E}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <ellipse cx="420" cy="650" rx="36" ry="20" fill="#d9775f" opacity=".3"/><ellipse cx="660" cy="650" rx="36" ry="20" fill="#d9775f" opacity=".3"/>
  ${bocaSvg}
  ${braco}
</svg>`;
}
if (typeof module !== 'undefined') module.exports = { teo };
