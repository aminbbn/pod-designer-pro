const fs = require('fs');
const path = require('path');

const panelsDir = path.join(__dirname, 'src', 'components', 'panels');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace bg-border or bg-background with bg-white/10
    // Replace h-1 with h-1.5
    // Replace w-2/h-2 or w-3/h-3 with w-4/h-4
    
    // A regex to match the class string of the sliders
    const regex = /className="w-full h-1 (bg-border|bg-background|bg-white\/5) (rounded|rounded-lg) appearance-none cursor-pointer \[&::-webkit-slider-thumb\]:(w-[23]) \[&::-webkit-slider-thumb\]:(h-[23]) \[&::-webkit-slider-thumb\]:(bg-[a-z]+-[0-9]+|bg-primary) \[&::-webkit-slider-thumb\]:rounded-full"/g;
    
    content = content.replace(regex, (match, bg, rounded, w, h, thumbBg) => {
        return `className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:${thumbBg} [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"`;
    });

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
console.log('Done replacing sliders');
