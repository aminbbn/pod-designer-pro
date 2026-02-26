const fs = require('fs');
const path = require('path');

const panelsDir = path.join(__dirname, 'src', 'components', 'panels');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace h-1.5 bg-white/10 with h-2 bg-white/20
    content = content.replace(/h-1\.5 bg-white\/10/g, 'h-2 bg-white/20');
    
    // Replace p-4 space-y-4 with p-3 space-y-3
    content = content.replace(/p-4 space-y-4/g, 'p-3 space-y-3');
    
    // Replace w-[340px] with w-[300px] in ToolsPanel
    if (filePath.endsWith('ToolsPanel.tsx')) {
        content = content.replace(/w-\[340px\]/g, 'w-[300px]');
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(panelsDir);
processFile(path.join(__dirname, 'src', 'components', 'ToolsPanel.tsx'));
console.log('Done replacing');
