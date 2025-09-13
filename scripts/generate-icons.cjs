const fs = require('fs');
const path = require('path');

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

// Tailles d'icônes nécessaires
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Créer le dossier icons s'il n'existe pas
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Générer les icônes SVG pour chaque taille
sizes.forEach(size => {
  const svgContent = iconSvg.replace('width="512"', `width="${size}"`).replace('height="512"', `height="${size}"`);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`✅ Généré: ${filename}`);
});

// Créer un fichier README pour expliquer comment convertir en PNG
const readmeContent = `# Icônes PWA

Ce dossier contient les icônes SVG pour l'application PWA.

## Conversion en PNG

Pour convertir les SVG en PNG, vous pouvez utiliser:

### Option 1: En ligne
- https://convertio.co/svg-png/
- https://cloudconvert.com/svg-to-png

### Option 2: En ligne de commande (ImageMagick)
\`\`\`bash
for size in 72 96 128 144 152 192 384 512; do
  convert icon-${size}x${size}.svg icon-${size}x${size}.png
done
\`\`\`

### Option 3: Node.js (sharp)
\`\`\`bash
npm install sharp
node -e "
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
  sharp(\`icon-\${size}x\${size}.svg\`)
    .png()
    .toFile(\`icon-\${size}x\${size}.png\`)
    .then(() => console.log(\`✅ Généré: icon-\${size}x\${size}.png\`));
});
"
\`\`\`

## Icônes générées
${sizes.map(size => `- icon-${size}x${size}.svg`).join('\n')}
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), readmeContent);

console.log('\n🎉 Toutes les icônes SVG ont été générées !');
console.log('📝 Consultez le README.md pour savoir comment les convertir en PNG');
