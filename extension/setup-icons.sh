#!/bin/bash

# Prism AI Extension Icon Setup Script
echo "🎨 Setting up Prism AI Extension Icons..."

# Check if we have Node.js available
if command -v node &> /dev/null; then
    echo "✅ Node.js found, generating SVG icons..."
    node generate-icons.js
    
    echo "📝 To convert SVG to PNG:"
    echo "1. Open create-png-icons.html in your browser"
    echo "2. Icons will auto-download as PNG files"
    echo "3. Move PNG files to icons/ folder"
    echo ""
    echo "Or use online converter: https://cloudconvert.com/svg-to-png"
else
    echo "❌ Node.js not found. Please install Node.js or use the HTML generator."
    echo "📝 Open create-png-icons.html in your browser to generate PNG icons."
fi

echo ""
echo "🚀 Extension Setup Complete!"
echo "📋 Next steps:"
echo "1. Generate PNG icons (if needed)"
echo "2. Load extension in Chrome: chrome://extensions/"
echo "3. Enable Developer mode"
echo "4. Click 'Load unpacked' and select this folder"
echo "5. Test the extension on various websites"
echo ""
echo "📖 See TESTING.md for detailed testing instructions"
