// Package the supplied artwork at platform sizes without redrawing the logo.
const { generateImageAsync, generateImageBackgroundAsync, compositeImagesAsync } = require('@expo/image-utils');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
(async () => {
  const generate = async (size, filename, sourceName = 'qasd-source.png', transparent = false) => {
    const { source } = await generateImageAsync({ projectRoot: root }, {
      src: path.join(root, 'assets/brand', sourceName), width: size, height: size,
      resizeMode: 'contain',
      ...(transparent ? {} : { backgroundColor: '#06182e', removeTransparency: true }),
    });
    fs.writeFileSync(path.join(root, filename), source);
  };
  await generate(1024, 'assets/brand/icon.png');
  const foreground = await generateImageAsync({ projectRoot: root }, {
    src: path.join(root, 'assets/brand/qasd-source.png'), width: 704, height: 704,
    resizeMode: 'contain', backgroundColor: '#06182e', removeTransparency: true,
  });
  const background = await generateImageBackgroundAsync({ width: 1024, height: 1024, backgroundColor: '#06182e', resizeMode: 'contain' });
  fs.writeFileSync(path.join(root, 'assets/brand/adaptive-icon.png'), await compositeImagesAsync({ foreground: foreground.source, background, x: 160, y: 160 }));
  await generate(64, 'assets/brand/favicon.png');
  // Refresh an existing local native project, when present. Expo config handles future prebuilds.
  const catalog = 'ios/RawafHajj/Images.xcassets';
  if (fs.existsSync(path.join(root, catalog))) {
    await generate(1024, `${catalog}/AppIcon.appiconset/App-Icon-1024x1024@1x.png`);
    for (const [size, suffix] of [[200, ''], [400, '@2x'], [600, '@3x']]) {
      await generate(size, `${catalog}/SplashScreenLogo.imageset/image${suffix}.png`, 'qasd-mark.png', true);
    }
  }
})();
