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

// SVG de base pour l'icône du Carnet de Sécurité
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="shield" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bg)" stroke="#1e3a8a" stroke-width="8"/>
  
  <!-- Shield -->
  <path d="M256 80 L200 120 L200 200 C200 250 220 300 256 320 C292 300 312 250 312 200 L312 120 Z" 
        fill="url(#shield)" stroke="#047857" stroke-width="4"/>
  
  <!-- Checkmark -->
  <path d="M220 200 L240 220 L292 168" 
        stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <!-- Map pin -->
  <circle cx="256" cy="380" r="20" fill="white" stroke="#1e40af" stroke-width="4"/>
  <path d="M256 360 L240 380 L272 380 Z" fill="#1e40af"/>
  
  <!-- Security lines -->
  <line x1="180" y1="160" x2="180" y2="180" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <line x1="180" y1="160" x2="200" y2="160" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <line x1="312" y1="160" x2="312" y2="180" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <line x1="312" y1="160" x2="292" y2="160" stroke="white" stroke-width="3" stroke-linecap="round"/>
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
