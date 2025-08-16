const fs = require('fs');
const path = require('path');

console.log('🎨 Setting up Brilliant font for LearningSaint...\n');

// Create fonts directory if it doesn't exist
const fontsDir = path.join(__dirname, 'src', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
  console.log('✅ Created fonts directory');
}

console.log('📁 Fonts directory: ' + fontsDir);
console.log('\n📥 To add the Brilliant font:');
console.log('1. Download Brilliant.ttf from a reliable font source');
console.log('2. Place it in: ' + fontsDir);
console.log('3. Run: npx react-native link');
console.log('4. For iOS: cd ios && pod install');
console.log('5. Clean and rebuild your project');
console.log('\n🎯 The BadgeCourseScreen is already configured to use the font!');
console.log('   Just add the font file and rebuild.');
