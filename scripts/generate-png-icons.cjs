const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tailles d'icônes nécessaires
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Créer le dossier icons s'il n'existe pas
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG de base pour l'icône du Carnet de Sécurité - Sécurité Privée
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#374151;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="lock" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="eye" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
    </radialGradient>
  </defs>
  
  <!-- Background circle with subtle gradient -->
  <circle cx="256" cy="256" r="240" fill="url(#bg)" stroke="#4b5563" stroke-width="6"/>
  
  <!-- Glow effect -->
  <circle cx="256" cy="256" r="200" fill="url(#glow)"/>
  
  <!-- Main lock body -->
  <rect x="200" y="180" width="112" height="80" rx="8" fill="url(#lock)" stroke="#92400e" stroke-width="3"/>
  
  <!-- Lock shackle -->
  <path d="M220 180 Q220 140 256 140 Q292 140 292 180" 
        stroke="url(#lock)" stroke-width="12" stroke-linecap="round" fill="none"/>
  
  <!-- Lock keyhole -->
  <circle cx="256" cy="220" r="8" fill="#1f2937"/>
  <rect x="252" y="220" width="8" height="16" fill="#1f2937"/>
  
  <!-- Surveillance eye -->
  <circle cx="256" cy="320" r="24" fill="url(#eye)" stroke="#1e40af" stroke-width="4"/>
  <circle cx="256" cy="320" r="16" fill="#ffffff"/>
  <circle cx="256" cy="320" r="8" fill="#1f2937"/>
  
  <!-- Security shield overlay -->
  <path d="M256 120 L200 160 L200 240 C200 280 220 320 256 340 C292 320 312 280 312 240 L312 160 Z" 
        fill="none" stroke="#10b981" stroke-width="4" opacity="0.6"/>
  
  <!-- Security dots pattern -->
  <circle cx="180" y="180" r="4" fill="#6b7280" opacity="0.7"/>
  <circle cx="332" y="180" r="4" fill="#6b7280" opacity="0.7"/>
  <circle cx="180" y="280" r="4" fill="#6b7280" opacity="0.7"/>
  <circle cx="332" y="280" r="4" fill="#6b7280" opacity="0.7"/>
  
  <!-- Privacy lines -->
  <line x1="160" y1="200" x2="180" y2="200" stroke="#6b7280" stroke-width="2" opacity="0.5"/>
  <line x1="160" y1="220" x2="180" y2="220" stroke="#6b7280" stroke-width="2" opacity="0.5"/>
  <line x1="160" y1="240" x2="180" y2="240" stroke="#6b7280" stroke-width="2" opacity="0.5"/>
  
  <line x1="332" y1="200" x2="352" y2="200" stroke="#6b7280" stroke-width="2" opacity="0.5"/>
  <line x1="332" y1="220" x2="352" y2="220" stroke="#6b7280" stroke-width="2" opacity="0.5"/>
  <line x1="332" y1="240" x2="352" y2="240" stroke="#6b7280" stroke-width="2" opacity="0.5"/>
  
  <!-- Security checkmark -->
  <path d="M240 300 L260 320 L280 300" 
        stroke="#10b981" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>
`;

async function generateIcons() {
  console.log('🎨 Génération des icônes PNG...\n');

  for (const size of sizes) {
    try {
      const filename = `icon-${size}x${size}.png`;
      const filepath = path.join(iconsDir, filename);
      
      await sharp(Buffer.from(iconSvg))
        .resize(size, size)
        .png()
        .toFile(filepath);
      
      console.log(`✅ Généré: ${filename}`);
    } catch (error) {
      console.error(`❌ Erreur pour ${size}x${size}:`, error.message);
    }
  }

  // Générer aussi les icônes manquantes pour le manifest
  const additionalSizes = [16, 32];
  for (const size of additionalSizes) {
    try {
      const filename = `icon-${size}x${size}.png`;
      const filepath = path.join(iconsDir, filename);
      
      await sharp(Buffer.from(iconSvg))
        .resize(size, size)
        .png()
        .toFile(filepath);
      
      console.log(`✅ Généré: ${filename}`);
    } catch (error) {
      console.error(`❌ Erreur pour ${size}x${size}:`, error.message);
    }
  }

  console.log('\n🎉 Toutes les icônes PNG ont été générées !');
  console.log('📱 Votre PWA est maintenant prête avec toutes les icônes nécessaires.');
}

generateIcons().catch(console.error);
