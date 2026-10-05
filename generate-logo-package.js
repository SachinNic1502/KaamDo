const path = require('path');
const fs = require('fs');
const sharp = require('./mobile/node_modules/sharp');

const SOURCE_PATH = path.join(__dirname, 'logo design.png');
const OUTPUT_DIR = path.join(__dirname, 'logo-assets');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Subdirectories for pristine organization
const SUBDIRS = [
  'primary',
  'horizontal',
  'vertical',
  'icon-only',
  'wordmark',
  'monochrome',
  'background-variants',
  'website',
  'favicons',
  'pwa',
  'android',
  'ios',
  'splash',
  'notification',
  'social',
  'documents'
];

SUBDIRS.forEach(sub => {
  const p = path.join(OUTPUT_DIR, sub);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

async function main() {
  console.log('--- Step 1: Loading Source Image & Extracting Matte ---');
  const img = sharp(SOURCE_PATH);
  const metadata = await img.metadata();
  console.log(`Source image dimensions: ${metadata.width}x${metadata.height}, channels: ${metadata.channels}`);

  const rawObj = await sharp(SOURCE_PATH).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = rawObj;
  const { width, height, channels } = info;

  // Perform mathematical matte extraction:
  // Since background is pure white #FFFFFF (255, 255, 255):
  // For pixel (R, G, B) = alpha * (R_fg, G_fg, B_fg) + (1 - alpha) * (255, 255, 255)
  // 1 - alpha = min(R, G, B) / 255  => alpha = 1 - min(R, G, B) / 255
  // If alpha > 0: R_fg = (R - 255 * (1 - alpha)) / alpha
  const rgba = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    const minVal = Math.min(r, g, b);
    let alpha = 255 - minVal;

    // Clean thresholding for noise near pure white
    if (alpha < 14) {
      alpha = 0;
    } else {
      alpha = Math.min(255, Math.round((alpha - 14) * (255 / (255 - 14))));
    }

    const dstIdx = i * 4;
    if (alpha === 0) {
      rgba[dstIdx] = 0;
      rgba[dstIdx + 1] = 0;
      rgba[dstIdx + 2] = 0;
      rgba[dstIdx + 3] = 0;
    } else {
      const aNorm = alpha / 255;
      const unR = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - aNorm)) / aNorm)));
      const unG = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - aNorm)) / aNorm)));
      const unB = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - aNorm)) / aNorm)));

      rgba[dstIdx] = unR;
      rgba[dstIdx + 1] = unG;
      rgba[dstIdx + 2] = unB;
      rgba[dstIdx + 3] = alpha;
    }
  }

  // Master transparent image
  const masterTransparentBuffer = await sharp(rgba, {
    raw: { width, height, channels: 4 }
  }).png().toBuffer();

  console.log('--- Step 2: Extracting Key Components with Exact Coordinates ---');
  // Component Crops (tested & pixel-perfect):
  // Icon: left: 631, top: 122, width: 331, height: 334
  // Wordmark: left: 998, top: 198, width: 887, height: 163
  // Tagline: left: 1003, top: 389, width: 846, height: 70
  // Full Logo (Icon + Wordmark + Tagline): left: 631, top: 122, width: 1254, height: 337
  // No-Tagline Logo (Icon + Wordmark): left: 631, top: 122, width: 1254, height: 239

  const iconBuffer = await sharp(masterTransparentBuffer)
    .extract({ left: 631, top: 122, width: 331, height: 334 })
    .png().toBuffer();

  const wordmarkBuffer = await sharp(masterTransparentBuffer)
    .extract({ left: 998, top: 198, width: 887, height: 163 })
    .png().toBuffer();

  const taglineBuffer = await sharp(masterTransparentBuffer)
    .extract({ left: 1003, top: 389, width: 846, height: 70 })
    .png().toBuffer();

  const primaryFullBuffer = await sharp(masterTransparentBuffer)
    .extract({ left: 631, top: 122, width: 1254, height: 337 })
    .png().toBuffer();

  const noTaglineBuffer = await sharp(masterTransparentBuffer)
    .extract({ left: 631, top: 122, width: 1254, height: 239 })
    .png().toBuffer();

  console.log('Extracted components successfully!');

  // Helper function to create solid monochrome version
  async function makeMonochrome(buffer, r, g, b) {
    const raw = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
    const buf = raw.data;
    const len = raw.info.width * raw.info.height;
    const out = Buffer.alloc(len * 4);
    for (let i = 0; i < len; i++) {
      const alpha = buf[i * 4 + 3];
      out[i * 4] = r;
      out[i * 4 + 1] = g;
      out[i * 4 + 2] = b;
      out[i * 4 + 3] = alpha;
    }
    return sharp(out, { raw: { width: raw.info.width, height: raw.info.height, channels: 4 } }).png().toBuffer();
  }

  // Helper function to make Dark-background version:
  // On dark backgrounds, navy text (#001E68) should become crisp white (#FFFFFF) while keeping Royal Blue and Orange checkmark/accent vibrant!
  async function makeDarkOptimized(buffer) {
    const raw = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
    const buf = raw.data;
    const len = raw.info.width * raw.info.height;
    const out = Buffer.alloc(len * 4);
    for (let i = 0; i < len; i++) {
      const idx = i * 4;
      const r = buf[idx];
      const g = buf[idx + 1];
      const b = buf[idx + 2];
      const a = buf[idx + 3];

      if (a === 0) {
        out[idx] = 0; out[idx + 1] = 0; out[idx + 2] = 0; out[idx + 3] = 0;
        continue;
      }

      // Check if pixel belongs to dark navy text (#001E68, where r is low < 50, b > 40 but total brightness is low)
      // Orange has high R (>180) and low B (<60)
      // Blue has high B (>150), medium G, low R (<50)
      const isOrange = r > 160 && b < 100;
      const isNavy = !isOrange && (r < 75 && g < 80 && b < 130);

      if (isNavy) {
        // Convert navy text to white while preserving its antialiasing alpha
        out[idx] = 255;
        out[idx + 1] = 255;
        out[idx + 2] = 255;
        out[idx + 3] = a;
      } else {
        out[idx] = r;
        out[idx + 1] = g;
        out[idx + 2] = b;
        out[idx + 3] = a;
      }
    }
    return sharp(out, { raw: { width: raw.info.width, height: raw.info.height, channels: 4 } }).png().toBuffer();
  }

  // Helper function to create vertical stacked logo (Icon centered above KaamDo and tagline)
  // Let's composite:
  // Icon: width 331, height 334
  // Wordmark: width 887, height 163
  // Tagline: width 846, height 70
  // Target vertical canvas: width: 1000, height: 720
  console.log('Generating vertical stacked logo...');
  const verticalCanvasWidth = 1000;
  const verticalCanvasHeight = 720;
  const iconLeft = Math.round((verticalCanvasWidth - 331) / 2);
  const iconTop = 40;
  const wordmarkLeft = Math.round((verticalCanvasWidth - 887) / 2);
  const wordmarkTop = iconTop + 334 + 35; // 409
  const taglineLeft = Math.round((verticalCanvasWidth - 846) / 2);
  const taglineTop = wordmarkTop + 163 + 28; // 600

  const verticalLogoBuffer = await sharp({
    create: {
      width: verticalCanvasWidth,
      height: verticalCanvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: iconBuffer, left: iconLeft, top: iconTop },
      { input: wordmarkBuffer, left: wordmarkLeft, top: wordmarkTop },
      { input: taglineBuffer, left: taglineLeft, top: taglineTop }
    ])
    .png().toBuffer();

  // Helper to save both to root logo-assets and specific subcategory
  const saveAsset = async (filename, subDir, buffer) => {
    const rootPath = path.join(OUTPUT_DIR, filename);
    const subPath = path.join(OUTPUT_DIR, subDir, filename);
    await fs.promises.writeFile(rootPath, buffer);
    await fs.promises.writeFile(subPath, buffer);
    console.log(`Saved: ${filename} (root & ${subDir}/)`);
  };

  // Helper for putting an image centered inside a canvas with optional background
  async function placeInCanvas(contentBuffer, canvasW, canvasH, paddingFraction = 0.1, bgColor = null) {
    const maxContentW = Math.round(canvasW * (1 - 2 * paddingFraction));
    const maxContentH = Math.round(canvasH * (1 - 2 * paddingFraction));

    const resized = await sharp(contentBuffer)
      .resize({
        width: maxContentW,
        height: maxContentH,
        fit: 'inside',
        withoutEnlargement: false
      })
      .png().toBuffer();

    const resizedMeta = await sharp(resized).metadata();
    const left = Math.round((canvasW - resizedMeta.width) / 2);
    const top = Math.round((canvasH - resizedMeta.height) / 2);

    const bg = bgColor || { r: 0, g: 0, b: 0, alpha: 0 };

    return sharp({
      create: {
        width: canvasW,
        height: canvasH,
        channels: 4,
        background: bg
      }
    })
      .composite([{ input: resized, left, top }])
      .png().toBuffer();
  }

  console.log('\n--- Step 3: Generating Logo Variants ---');

  // 1. Primary Logo (transparent)
  // Let's add comfortable margin around primaryFullBuffer (1254x337) => canvas 1400 x 420
  const primaryLogo = await placeInCanvas(primaryFullBuffer, 1400, 420, 0.05);
  await saveAsset('kaamdo-logo-primary.png', 'primary', primaryLogo);

  // 2. Horizontal Logo
  const horizontalLogo = await placeInCanvas(primaryFullBuffer, 1400, 420, 0.05);
  await saveAsset('kaamdo-logo-horizontal.png', 'horizontal', horizontalLogo);

  // 3. Vertical / Stacked Logo
  const verticalTrimmed = await sharp(verticalLogoBuffer).trim().png().toBuffer();
  const verticalLogo = await placeInCanvas(verticalTrimmed, 1000, 800, 0.06);
  await saveAsset('kaamdo-logo-vertical.png', 'vertical', verticalLogo);

  // 4. Logo Without Tagline
  const noTaglineLogo = await placeInCanvas(noTaglineBuffer, 1400, 350, 0.06);
  await saveAsset('kaamdo-logo-no-tagline.png', 'horizontal', noTaglineLogo);

  // 5. Icon-Only Logo (Square canvas 1024x1024, transparent)
  const iconOnly1024 = await placeInCanvas(iconBuffer, 1024, 1024, 0.12);
  await saveAsset('kaamdo-logo-icon.png', 'icon-only', iconOnly1024);

  // 6. Wordmark-Only Logo
  const wordmarkOnly = await placeInCanvas(wordmarkBuffer, 1000, 260, 0.08);
  await saveAsset('kaamdo-wordmark.png', 'wordmark', wordmarkOnly);

  // 7. Background Variants
  // Transparent variant is primary
  // White background:
  const whiteBgLogo = await placeInCanvas(primaryFullBuffer, 1400, 420, 0.05, { r: 255, g: 255, b: 255, alpha: 1 });
  await saveAsset('kaamdo-logo-white-bg.png', 'background-variants', whiteBgLogo);

  // Dark background (#0F172A slate-900 / #0B1329):
  const darkOptimizedContent = await makeDarkOptimized(primaryFullBuffer);
  const darkBgLogo = await placeInCanvas(darkOptimizedContent, 1400, 420, 0.05, { r: 15, g: 23, b: 42, alpha: 1 });
  await saveAsset('kaamdo-logo-dark-bg.png', 'background-variants', darkBgLogo);

  // Dark-compatible transparent logo (for arbitrary dark navbars/footers):
  const darkTransparentLogo = await placeInCanvas(darkOptimizedContent, 1400, 420, 0.05);
  await saveAsset('kaamdo-logo-dark-transparent.png', 'background-variants', darkTransparentLogo);

  // Brand background (#0456D3):
  // When brand background is Royal Blue (#0456D3), the white text + orange checkmark looks iconic
  const brandBgLogo = await placeInCanvas(darkOptimizedContent, 1400, 420, 0.05, { r: 4, g: 86, b: 211, alpha: 1 });
  await saveAsset('kaamdo-logo-brand-bg.png', 'background-variants', brandBgLogo);

  // 8. Monochrome Versions
  console.log('Generating monochrome versions...');
  const blackFullContent = await makeMonochrome(primaryFullBuffer, 0, 0, 0);
  const blackLogo = await placeInCanvas(blackFullContent, 1400, 420, 0.05);
  await saveAsset('kaamdo-logo-black.png', 'monochrome', blackLogo);

  const whiteFullContent = await makeMonochrome(primaryFullBuffer, 255, 255, 255);
  const whiteLogo = await placeInCanvas(whiteFullContent, 1400, 420, 0.05);
  await saveAsset('kaamdo-logo-white.png', 'monochrome', whiteLogo);

  // Also icon monochromes
  const blackIcon = await makeMonochrome(iconBuffer, 0, 0, 0);
  await saveAsset('kaamdo-icon-black.png', 'monochrome', await placeInCanvas(blackIcon, 512, 512, 0.12));
  const whiteIcon = await makeMonochrome(iconBuffer, 255, 255, 255);
  await saveAsset('kaamdo-icon-white.png', 'monochrome', await placeInCanvas(whiteIcon, 512, 512, 0.12));

  // 9. Website Assets
  console.log('Generating website assets...');
  // Header Logo (1200 x 400 px, transparent)
  const headerLogo = await placeInCanvas(primaryFullBuffer, 1200, 400, 0.08);
  await saveAsset('kaamdo-header-logo.png', 'website', headerLogo);

  // Compact Logo (800 x 300 px, icon + wordmark, transparent)
  const compactLogo = await placeInCanvas(noTaglineBuffer, 800, 300, 0.08);
  await saveAsset('kaamdo-compact-logo.png', 'website', compactLogo);

  // Footer Logo (1200 x 400 px, transparent, optimized for dark footer)
  const footerLogo = await placeInCanvas(darkOptimizedContent, 1200, 400, 0.08);
  await saveAsset('kaamdo-footer-logo.png', 'website', footerLogo);

  // 10. Favicon Assets (from exact icon, centered, safe padding)
  console.log('Generating favicon assets...');
  const faviconSizes = [16, 32, 48, 64, 96, 128, 192, 256, 512];
  for (const size of faviconSizes) {
    const fav = await placeInCanvas(iconBuffer, size, size, 0.06);
    await saveAsset(`kaamdo-favicon-${size}.png`, 'favicons', fav);
  }

  // 11. PWA Assets
  console.log('Generating PWA assets...');
  // Standard PWA icons (192, 512)
  const pwa192 = await placeInCanvas(iconBuffer, 192, 192, 0.10);
  await saveAsset('kaamdo-pwa-192.png', 'pwa', pwa192);

  const pwa512 = await placeInCanvas(iconBuffer, 512, 512, 0.10);
  await saveAsset('kaamdo-pwa-512.png', 'pwa', pwa512);

  // Maskable PWA icons (safe inner 80% circle, on crisp white or brand background)
  // Maskable standard specifies icon content within central 60-80% safe zone with solid background
  const pwaMaskable192 = await placeInCanvas(iconBuffer, 192, 192, 0.20, { r: 255, g: 255, b: 255, alpha: 1 });
  await saveAsset('kaamdo-pwa-maskable-192.png', 'pwa', pwaMaskable192);

  const pwaMaskable512 = await placeInCanvas(iconBuffer, 512, 512, 0.20, { r: 255, g: 255, b: 255, alpha: 1 });
  await saveAsset('kaamdo-pwa-maskable-512.png', 'pwa', pwaMaskable512);

  // 12. Android App Icons
  console.log('Generating Android app icons...');
  const androidSizes = [48, 72, 96, 144, 192, 512];
  for (const s of androidSizes) {
    const androidIcon = await placeInCanvas(iconBuffer, s, s, 0.08);
    await saveAsset(`kaamdo-android-icon-${s}.png`, 'android', androidIcon);
  }

  // 13. Android Adaptive Icon
  console.log('Generating Android adaptive icon...');
  // Android adaptive icon canvas is 432x432 (or 512x512) with safe icon within center 66% (33% margins)
  const adaptiveFg = await placeInCanvas(iconBuffer, 512, 512, 0.25);
  await saveAsset('kaamdo-adaptive-foreground.png', 'android', adaptiveFg);

  // Background: Primary brand color (#0456D3)
  const adaptiveBg = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 4, g: 86, b: 211, alpha: 1 }
    }
  }).png().toBuffer();
  await saveAsset('kaamdo-adaptive-background.png', 'android', adaptiveBg);

  // Also white adaptive background option
  const adaptiveBgWhite = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toBuffer();
  await saveAsset('kaamdo-adaptive-background-white.png', 'android', adaptiveBgWhite);

  // 14. iOS App Icon (1024 x 1024 px, NO transparency, solid white background)
  console.log('Generating iOS app icon...');
  const iosIcon1024 = await placeInCanvas(iconBuffer, 1024, 1024, 0.16, { r: 255, g: 255, b: 255, alpha: 1 });
  await saveAsset('kaamdo-ios-icon-1024.png', 'ios', iosIcon1024);

  // Standard iOS sizes
  const iosSizes = [180, 167, 152, 120, 87, 80, 58];
  for (const s of iosSizes) {
    const iosSub = await placeInCanvas(iconBuffer, s, s, 0.16, { r: 255, g: 255, b: 255, alpha: 1 });
    await saveAsset(`kaamdo-ios-icon-${s}.png`, 'ios', iosSub);
  }

  // 15. App Splash Screen Logo
  console.log('Generating Splash screen assets...');
  // High-res transparent version of Icon + Wordmark with comfortable breathing room (1200x1200)
  const splashLogo = await placeInCanvas(noTaglineBuffer, 1200, 1200, 0.20);
  await saveAsset('kaamdo-splash-logo.png', 'splash', splashLogo);

  // Full mark splash
  const splashFullLogo = await placeInCanvas(primaryFullBuffer, 1200, 1200, 0.20);
  await saveAsset('kaamdo-splash-logo-full.png', 'splash', splashFullLogo);

  // Icon-only splash
  const splashIconOnly = await placeInCanvas(iconBuffer, 1200, 1200, 0.32);
  await saveAsset('kaamdo-splash-icon.png', 'splash', splashIconOnly);

  // 16. Notification Icon
  console.log('Generating Notification icon...');
  // Android notification requires 100% solid white silhouette with alpha mask on transparent background
  const whiteNotif = await makeMonochrome(iconBuffer, 255, 255, 255);
  const notificationIcon = await placeInCanvas(whiteNotif, 96, 96, 0.10);
  await saveAsset('kaamdo-notification-icon.png', 'notification', notificationIcon);

  // High res notification icon 192x192
  const notificationIcon192 = await placeInCanvas(whiteNotif, 192, 192, 0.10);
  await saveAsset('kaamdo-notification-icon-192.png', 'notification', notificationIcon192);

  // 17. Social Media Profile Image (1080 x 1080 px)
  console.log('Generating Social media profile images...');
  // Profile with Brand Background (#0456D3) - standard for social media avatars
  // For brand background, let's also provide a clean white card or the icon on white
  const socialProfileBrand = await placeInCanvas(iconBuffer, 1080, 1080, 0.18, { r: 255, g: 255, b: 255, alpha: 1 });
  await saveAsset('kaamdo-social-profile.png', 'social', socialProfileBrand);

  // Also brand background version
  // On royal blue brand background, let's place white/orange icon
  const darkIcon = await makeDarkOptimized(iconBuffer);
  const socialProfileBlue = await placeInCanvas(darkIcon, 1080, 1080, 0.20, { r: 4, g: 86, b: 211, alpha: 1 });
  await saveAsset('kaamdo-social-profile-brand-bg.png', 'social', socialProfileBlue);

  // 18. Social / Brand Logo (1080 x 1080 px with Icon + Wordmark + Tagline)
  const socialBrand = await placeInCanvas(verticalTrimmed, 1080, 1080, 0.18, { r: 255, g: 255, b: 255, alpha: 1 });
  await saveAsset('kaamdo-social-brand.png', 'social', socialBrand);

  // Transparent social brand
  const socialBrandTrans = await placeInCanvas(verticalTrimmed, 1080, 1080, 0.18);
  await saveAsset('kaamdo-social-brand-transparent.png', 'social', socialBrandTrans);

  // 19. Watermark Version
  console.log('Generating Watermark version...');
  // Transparent watermark version: Icon + KaamDo wordmark with ~22% opacity
  const watermarkRaw = await sharp(noTaglineBuffer).raw().toBuffer({ resolveWithObject: true });
  const wmBuf = watermarkRaw.data;
  const wmLim = watermarkRaw.info.width * watermarkRaw.info.height;
  const wmOut = Buffer.alloc(wmLim * 4);
  for (let i = 0; i < wmLim; i++) {
    const idx = i * 4;
    wmOut[idx] = wmBuf[idx];
    wmOut[idx + 1] = wmBuf[idx + 1];
    wmOut[idx + 2] = wmBuf[idx + 2];
    wmOut[idx + 3] = Math.round(wmBuf[idx + 3] * 0.22); // 22% watermark opacity
  }
  const watermarkPngBuffer = await sharp(wmOut, {
    raw: { width: watermarkRaw.info.width, height: watermarkRaw.info.height, channels: 4 }
  }).png().toBuffer();
  const watermarkLogo = await placeInCanvas(watermarkPngBuffer, 1200, 360, 0.05);
  await saveAsset('kaamdo-watermark.png', 'documents', watermarkLogo);

  // 20. Document Logo (2400 x 700 px, ultra-high-resolution for invoices, PDFs, letterheads)
  console.log('Generating Document logo...');
  const documentLogo = await placeInCanvas(primaryFullBuffer, 2400, 700, 0.06);
  await saveAsset('kaamdo-document-logo.png', 'documents', documentLogo);

  // 21. Email Logo (600 x 160 px, compact horizontal transparent)
  console.log('Generating Email signature logo...');
  const emailLogo = await placeInCanvas(noTaglineBuffer, 600, 160, 0.06);
  await saveAsset('kaamdo-email-logo.png', 'documents', emailLogo);

  // With tagline email version
  const emailFullLogo = await placeInCanvas(primaryFullBuffer, 600, 180, 0.06);
  await saveAsset('kaamdo-email-logo-full.png', 'documents', emailFullLogo);

  console.log('\n=========================================');
  console.log('All 30+ requested logo assets generated successfully!');
  console.log(`Directory: ${OUTPUT_DIR}`);
  console.log('=========================================\n');
}

main().catch(err => {
  console.error('Fatal Error generating logo assets:', err);
  process.exit(1);
});
