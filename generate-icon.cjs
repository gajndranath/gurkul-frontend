const fs = require('fs');
const { createCanvas } = require('canvas');

const generateIcon = () => {
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, size, size);

    // Text "L" for Library
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 300px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('L', size / 2, size / 2);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/icon.png', buffer);
    console.log('✅ Generated public/icon.png');
};

try {
    generateIcon();
} catch (e) {
    console.error('Failed to generate icon (canvas might not be installed):', e.message);
}
