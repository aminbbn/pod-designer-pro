const fs = require('fs');
const files = [
  'src/components/admin/AdminDashboard.tsx',
  'src/components/admin/ProductManager.tsx',
  'src/components/admin/LoginPage.tsx',
  'src/components/CanvasArea.tsx',
  'src/components/ToolsPanel.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/border-white\/[0-9]+/g, 'border-border');
    content = content.replace(/bg-white\/[0-9]+/g, 'bg-surface-hover');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
