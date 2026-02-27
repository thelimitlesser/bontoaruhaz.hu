#!/bin/bash
cd "$(dirname "$0")"
echo "---------------------------------------------------"
echo "   AutoNexus Fejlesztői Szerver Indítása..."
echo "---------------------------------------------------"
echo ""
echo "Mappa: $(pwd)"
echo ""

# Add the discovered Node.js path
export PATH="/Users/erdelyipeter/.gemini/antigravity/playground/shining-bohr/node-v20.12.2-darwin-arm64/bin:$PATH"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "HIBA: Az 'npm' parancs nem található!"
    echo "Kérlek telepítsd a Node.js-t: https://nodejs.org/"
    echo ""
    read -p "Nyomj Entert a bezáráshoz..."
    exit 1
fi

echo "Szerver indítása (npm run dev)..."
echo "Ha elindult, nyisd meg: http://localhost:3000"
echo "---------------------------------------------------"
echo ""
npm run dev
