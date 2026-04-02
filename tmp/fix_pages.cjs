const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('page.tsx') || file.endsWith('layout.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src/app');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // 1. Remove all existing instances of export const dynamic
    content = content.replace(/^export const dynamic = ["'].*?["'];\n?/gm, '');
    
    // 2. Check if it's a client component
    const isClient = content.includes('"use client"') || content.includes("'use client'");
    
    if (!isClient) {
        // 3. Prepend the protection at the very top for Server components
        content = 'export const dynamic = "force-dynamic";\n' + content;
        console.log(`Fixed Server Component: ${file}`);
    } else {
        console.log(`Skipped Client Component: ${file}`);
    }
    
    fs.writeFileSync(file, content);
});
