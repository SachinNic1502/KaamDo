const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const logoDir = path.join(__dirname, "assets", "logo");

async function generatePNGs() {
  const iconSvg = fs.readFileSync(path.join(logoDir, "icon.svg"));
  const iconCircleSvg = fs.readFileSync(path.join(logoDir, "icon-circle.svg"));
  const iconSquareSvg = fs.readFileSync(path.join(logoDir, "icon-square.svg"));
  const fullLogoSvg = fs.readFileSync(path.join(logoDir, "full-logo.svg"));

  // App icon (1024x1024)
  await sharp(iconSvg).resize(1024, 1024).png().toFile(path.join(logoDir, "icon.png"));
  console.log("Generated icon.png (1024x1024)");

  // Adaptive icon foreground (1024x1024)
  await sharp(iconSvg).resize(1024, 1024).png().toFile(path.join(logoDir, "android-icon-foreground.png"));
  console.log("Generated android-icon-foreground.png");

  // Adaptive icon background (white)
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  }).png().toFile(path.join(logoDir, "android-icon-background.png"));
  console.log("Generated android-icon-background.png");

  // Monochrome icon
  await sharp(iconSvg).resize(1024, 1024).png().toFile(path.join(logoDir, "android-icon-monochrome.png"));
  console.log("Generated android-icon-monochrome.png");

  // Favicon (48x48)
  await sharp(iconSvg).resize(48, 48).png().toFile(path.join(logoDir, "favicon.png"));
  console.log("Generated favicon.png (48x48)");

  // Splash screen (1284x2778 for iPhone 12 Pro Max)
  const splashWidth = 1284;
  const splashHeight = 2778;
  const logoWidth = 400;

  const logoBuffer = await sharp(fullLogoSvg).resize(logoWidth).png().toBuffer();

  const splashBg = await sharp({
    create: {
      width: splashWidth,
      height: splashHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toBuffer();

  const logoMetadata = await sharp(logoBuffer).metadata();
  const compositeX = Math.floor((splashWidth - logoMetadata.width) / 2);
  const compositeY = Math.floor((splashHeight - logoMetadata.height) / 2);

  await sharp(splashBg)
    .composite([{
      input: logoBuffer,
      left: compositeX,
      top: compositeY
    }])
    .png()
    .toFile(path.join(logoDir, "splash.png"));
  console.log("Generated splash.png (1284x2778)");

  // Notification icon (96x96)
  await sharp(iconSvg).resize(96, 96).png().toFile(path.join(logoDir, "notification-icon.png"));
  console.log("Generated notification-icon.png (96x96)");

  console.log("\nAll PNG assets generated successfully!");
}

generatePNGs().catch(console.error);
