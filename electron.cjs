const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function getIconPath() {
  // Vite copies public/vite.svg to dist/vite.svg during build.
  // Prefer the packaged dist copy; fallback to public/ for development.
  const candidates = [
    path.join(__dirname, 'dist', 'vite.svg'),
    path.join(__dirname, 'public', 'vite.svg'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'QuizParty - 聚会问答大冒险',
    icon: getIconPath(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Remove menu bar
  win.setMenuBarVisibility(false);

  // Load the built app
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
