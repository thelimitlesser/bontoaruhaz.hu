const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findAndCleanFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findAndCleanFiles(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            cleanFile(fullPath);
        }
    });
}

function cleanFile(filePath) {
    const originalContent = fs.readFileSync(filePath, 'utf-8');

    // Regex to match "dark:something" classes, including those inside dynamic strings or clsx
    // It matches whitespace or quotes/backticks before 'dark:', then any non-whitespace characters
    // The replace pattern replaces the 'dark:...' part with empty string, leaving surrounding spaces
    let newContent = originalContent.replace(/(?<=\s|["'`])dark:[^\s"'\`]+(?=\s|["'`]|$)/g, '');

    // Cleanup multiple spaces that might have been left behind
    newContent = newContent.replace(/\s+/g, (match) => match.includes('\n') ? match : ' ');
    // Clean spaces just before quotes (e.g., ' class ' -> ' class')
    newContent = newContent.replace(/\s+(["'`])/g, '$1');
    // Clean spaces just after quotes (e.g., '" class' -> '"class')
    newContent = newContent.replace(/(["'`])\s+/g, '$1 ');

    if (originalContent !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Cleaned: ${filePath}`);
    }
}

console.log('Starting dark mode class removal...');
findAndCleanFiles(srcDir);
console.log('Cleanup complete.');
