const fs = require('fs');
const path = require('path');


// Create fonts directory if it doesn't exist
const fontsDir = path.join(__dirname, 'src', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

