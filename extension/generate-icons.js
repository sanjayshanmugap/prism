// Simple Node.js script to generate extension icons
const fs = require('fs');
const path = require('path');

// Create SVG icon with modern white P on blue-purple gradient
function createIconSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#gradient)"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" 
        font-weight="bold" 
        font-size="${size * 0.5}" 
        fill="white">P</text>
</svg>`;
}

// Icon sizes needed for browser extension
const sizes = [16, 32, 48, 128];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files for each size
sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = path.join(iconsDir, `icon-${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Generated icon-${size}.svg`);
});

console.log('All icons generated successfully!');
console.log('Note: You may need to convert SVG to PNG for browser extension compatibility.');
