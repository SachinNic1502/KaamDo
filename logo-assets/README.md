# KaamDo Official Brand & Logo Asset Package

> **Har Kaam, Sahi Insaan**

This directory contains the production-grade logo assets generated directly from the official **KaamDo** master identity (`logo design.png`). 

Zero alterations, zero redesigns, and zero AI reinterpretations were applied. Proportions, geometry, typography, letter shapes, colors, and alignments are preserved with mathematical precision.

---

## 🎨 Official Brand Color Palette

| Color Name | Hex Code | RGB | Description |
| :--- | :--- | :--- | :--- |
| **KaamDo Royal Blue** | `#0456D3` | `rgb(4, 86, 211)` | Primary brand color used in icon arc & accents |
| **KaamDo Vivid Orange** | `#FE6705` | `rgb(254, 103, 5)` | Brand accent color used in checkmark & "Do" |
| **KaamDo Deep Navy** | `#001E68` | `rgb(0, 30, 104)` | Primary text color for "Kaam" & tagline on light surfaces |
| **Pure White** | `#FFFFFF` | `rgb(255, 255, 255)` | Text on dark/brand backgrounds, iOS icon canvas |
| **Dark Slate Surface** | `#0F172A` | `rgb(15, 23, 42)` | Dark mode background reference |

---

## 📁 Package Structure

The package is available in both flat format (root of `logo-assets/`) and organized sub-directories:

```
logo-assets/
├── primary/                 # Master full-lockup transparent assets
├── horizontal/              # Horizontal layouts (with & without tagline)
├── vertical/                # Stacked vertical lockup (Icon centered above wordmark)
├── icon-only/               # High-res square icon assets
├── wordmark/                # Pure wordmark ("KaamDo")
├── background-variants/     # Dark mode, brand blue, and pure white backgrounds
├── monochrome/              # 100% solid black and solid white silhouette exports
├── website/                 # Header, compact nav, and dark footer assets
├── favicons/                # 16px to 512px PNG favicons + multi-size favicon.ico
├── pwa/                     # Standard and maskable (80% safe zone) PWA icons
├── android/                 # Density-bucket launcher icons + adaptive foreground/background
├── ios/                     # 1024x1024 master icon + standard iOS app icon sizes
├── splash/                  # Mobile & web responsive splash screens
├── notification/            # Android white silhouette notification alpha masks
├── social/                  # 1080x1080 social profile avatars and brand square posts
└── documents/               # High-res document/invoice letterhead logos, watermark, and email signatures
```

---

## 📋 Asset Inventory & Specifications

### 1. Primary & Orientation Variants
- **`kaamdo-logo-primary.png`** (1400 × 420 px): Master transparent lockup (Icon + "KaamDo" + "Har Kaam, Sahi Insaan").
- **`kaamdo-logo-horizontal.png`** (1400 × 420 px): Standard horizontal lockup with tagline.
- **`kaamdo-logo-no-tagline.png`** (1400 × 350 px): Icon + Wordmark with tagline cleanly removed.
- **`kaamdo-logo-vertical.png`** (1000 × 800 px): Stacked orientation — Icon centered above "KaamDo" and "Har Kaam, Sahi Insaan".

### 2. Standalone Elements
- **`kaamdo-logo-icon.png`** (1024 × 1024 px): Official symbol centered on a transparent canvas with safe padding.
- **`kaamdo-wordmark.png`** (1000 × 260 px): Isolated "KaamDo" wordmark with authentic custom lettering and orange "Do".

### 3. Background Variants
- **`kaamdo-logo-white-bg.png`** (1400 × 420 px): Master logo on solid `#FFFFFF`.
- **`kaamdo-logo-dark-bg.png`** (1400 × 420 px): Optimized for dark theme (`#0F172A`), with navy text converted to pure white `#FFFFFF` while retaining vivid orange & royal blue.
- **`kaamdo-logo-dark-transparent.png`** (1400 × 420 px): Dark-theme optimized logo with transparent background for dark navbars and footers.
- **`kaamdo-logo-brand-bg.png`** (1400 × 420 px): Master logo displayed on KaamDo Royal Blue (`#0456D3`).

### 4. Monochrome Versions
- **`kaamdo-logo-black.png`** (1400 × 420 px): 100% solid black `#000000` on transparent background.
- **`kaamdo-logo-white.png`** (1400 × 420 px): 100% solid white `#FFFFFF` on transparent background.
- **`kaamdo-icon-black.png`** (512 × 512 px): Solid black icon.
- **`kaamdo-icon-white.png`** (512 × 512 px): Solid white icon.

### 5. Website Assets
- **`kaamdo-header-logo.png`** (1200 × 400 px): Transparent horizontal logo sized with comfortable padding for desktop & mobile navigation bars.
- **`kaamdo-compact-logo.png`** (800 × 300 px): Compact Icon + Wordmark for sticky headers and condensed layouts.
- **`kaamdo-footer-logo.png`** (1200 × 400 px): Dark-optimized transparent logo for dark website footers.

### 6. Favicons
- **`favicon.ico`**: Multi-resolution Windows ICO container containing 16x16, 32x32, and 48x48 PNG icons.
- **`kaamdo-favicon-16.png`** (16 × 16 px)
- **`kaamdo-favicon-32.png`** (32 × 32 px)
- **`kaamdo-favicon-48.png`** (48 × 48 px)
- **`kaamdo-favicon-64.png`** (64 × 64 px)
- **`kaamdo-favicon-96.png`** (96 × 96 px)
- **`kaamdo-favicon-128.png`** (128 × 128 px)
- **`kaamdo-favicon-192.png`** (192 × 192 px)
- **`kaamdo-favicon-256.png`** (256 × 256 px)
- **`kaamdo-favicon-512.png`** (512 × 512 px)

### 7. Progressive Web App (PWA)
- **`kaamdo-pwa-192.png`** (192 × 192 px)
- **`kaamdo-pwa-512.png`** (512 × 512 px)
- **`kaamdo-pwa-maskable-192.png`** (192 × 192 px): 20% safe zone inset to prevent Android adaptive clipping.
- **`kaamdo-pwa-maskable-512.png`** (512 × 512 px): 20% safe zone inset.

### 8. Mobile App Icons (Android & iOS)
- **Android Standard Icons**: 48x48, 72x72, 96x96, 144x144, 192x192, 512x512.
- **Android Adaptive Icon**:
  - `kaamdo-adaptive-foreground.png` (512 × 512 px): Centered icon within the Android adaptive 66% safe zone.
  - `kaamdo-adaptive-background.png` (512 × 512 px): Solid `#0456D3` brand background.
  - `kaamdo-adaptive-background-white.png` (512 × 512 px): Clean `#FFFFFF` alternative background.
- **Android Notification Icon**:
  - `kaamdo-notification-icon.png` (96 × 96 px): Pure white alpha silhouette on transparent background (compliant with Android status bar notification standards).
  - `kaamdo-notification-icon-192.png` (192 × 192 px): High-DPI notification icon.
- **iOS App Icons**:
  - `kaamdo-ios-icon-1024.png` (1024 × 1024 px): Official App Store master, opaque solid white background with centered symbol and Apple-compliant margins (zero transparency).
  - Standard iOS asset sizes: 180x180, 167x167, 152x152, 120x120, 87x87, 80x80, 58x58.

### 9. Splash Screens
- **`kaamdo-splash-logo.png`** (1200 × 1200 px): Centered Icon + Wordmark with generous canvas margins for responsive splash scaling.
- **`kaamdo-splash-logo-full.png`** (1200 × 1200 px): Full lockup with tagline.
- **`kaamdo-splash-icon.png`** (1200 × 1200 px): Minimalist centered icon.

### 10. Social Media & Marketing
- **`kaamdo-social-profile.png`** (1080 × 1080 px): Square avatar with centered icon on white.
- **`kaamdo-social-profile-brand-bg.png`** (1080 × 1080 px): Square avatar with icon on brand Royal Blue `#0456D3`.
- **`kaamdo-social-brand.png`** (1080 × 1080 px): Stacked brand mark on solid white for social posts/covers.
- **`kaamdo-social-brand-transparent.png`** (1080 × 1080 px): Stacked brand mark on transparent background.

### 11. Documents & Signatures
- **`kaamdo-document-logo.png`** (2400 × 700 px): Ultra-high-resolution transparent lockup for PDF invoices, proposals, receipts, and letterheads.
- **`kaamdo-watermark.png`** (1200 × 360 px): Semi-transparent (22% opacity) watermark logo.
- **`kaamdo-email-logo.png`** (600 × 160 px): Compact transparent logo optimized for HTML email signatures.
- **`kaamdo-email-logo-full.png`** (600 × 180 px): Full logo version for email signatures.
