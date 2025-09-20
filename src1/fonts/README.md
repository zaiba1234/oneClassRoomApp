# Fonts Directory

## How to add Brilliant font:

1. Download the Brilliant font file (.ttf) from a reliable source
2. Place it in this directory as `Brilliant.ttf`
3. Run `npx react-native link` to link the fonts
4. For iOS, also run `cd ios && pod install`

## Font files should be:
- Brilliant.ttf (or Brilliant-Regular.ttf)
- Make sure the filename matches exactly what you reference in the code

## After adding fonts:
- Clean and rebuild your project
- For Android: `npx react-native run-android`
- For iOS: `npx react-native run-ios`
