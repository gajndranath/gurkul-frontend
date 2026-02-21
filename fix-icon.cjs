const fs = require('fs');
const path = require('path');

// 1x1 transparent PNG base64
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(base64Png, 'base64');

const targetPath = path.join(__dirname, 'public', 'icon.png');
fs.writeFileSync(targetPath, buffer);
console.log('✅ Created a valid 1x1 PNG at:', targetPath);
