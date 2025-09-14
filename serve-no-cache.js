const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Désactiver le cache
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'dist')));

// Route pour toutes les pages (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log('📱 Cache désactivé - Changements visibles immédiatement');
});
