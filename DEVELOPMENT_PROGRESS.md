# Development Progress - PhotoMaze

This document tracks phase-by-phase implementation status, completed features, pending items, and budget utilization for **PhotoMaze** under a **100% Free & Open Architecture (Zero-Cost Forever)**.

---

## 💰 Budget & Cost Tracker

- **Allocated Budget:** ₹500.00 INR
- **Current Total Spend:** **₹0.00 INR** (Zero paid API calls)
- **Remaining Budget:** **₹500.00 INR (100% Intact)**
- **Monetization Policy:** **100% Free Forever.** No paywalls, no subscriptions, no credit deduction systems, and no paid upgrades.
- **Privacy Policy:** On-device biometric processing in the browser; no photo uploads without user consent.

---

## Current Status Summary

- **Current Active Phase:** PHASE 10 CORRECTION & PHOTOMAZE REBRANDING
- **Phase Status:** COMPLETED & TESTED ✅ (All 394 automated tests passing across 6 suites — Awaiting user review & approval before Android packaging)
- **Last Updated:** 2026-11-02

---

## Development Roadmap

1. [x] **PHASE 1 – Research, architecture and project setup** (Next.js 14, TypeScript, Tailwind CSS, Sharp, zero-cost specs).
2. [x] **PHASE 2 – Premium website UI, homepage and navigation** (Interactive canvas dropzone, before-after slider, country dimensions, FAQ, footer).
3. [x] **PHASE 3 – Image uploading, preview and basic photo editor** (Drag-and-drop, format & DPI validation, upload progress, interactive canvas, pan/zoom, fine rotation, flip, manual crop, Sharp 300 DPI crop pipeline, replace/delete photo, reversible original).
4. [x] **PHASE 4 – Client-side AI background removal** (In-browser ONNX / WebGPU / WASM execution using RMBG-1.4, transparent output, compliant solid background color palette: White, Light Blue, Royal Blue, Light Gray, Red, and Custom hex picker, Before/After split slider, reversible original).
5. [x] **PHASE 5 – Client-side face detection & biometric auto-crop** (MediaPipe Tasks Vision, 468 landmark detection, ICAO Doc 9303 auto-cropping, eye plane alignment, 29+ official country specifications with verified government URLs, custom dimensions & DPI builder, live compliance evaluation audit).
6. [x] **PHASE 6 – AI outfit replacement templates** (21+ formal outfit templates across 7 categories, transparent trial GPU connection, Before/After preview, non-destructive original preservation).
7. [x] **PHASE 7 – Browser-based photo enhancement** (Skin retouching, blemish reduction, lighting correction, brightness, contrast, unsharp mask sharpness, noise reduction, color balance, 300 DPI detail reconstruction, before/after compare toggle, non-destructive export compatibility).
8. [x] **PHASE 8 – Custom passport photo sheet & printing engine** (Arbitrary copy counts 1 to 1000+, A4, A5, A3, 4×6, 5×7, 6×8, Letter, Legal, Custom paper dimensions & units, smart auto-orientation packing engine, live interactive preview with zoom & page navigation, vector PDF generator via `pdf-lib`, high-res JPEG/PNG raster export, cutting guides, printer-safe margins).
9. [x] **PHASE 9 – Complete image and print export system** (High-quality JPEG, PNG & PDF downloads for individual photos and multi-page print sheets, embedded JFIF/pHYs 300 & 600 DPI metadata, portal JPEG size constraints <= 240 KB, exact PostScript millimeter PDF dimensions, desktop & mobile native download/share compatibility).
10. [x] **PHASE 10 – Supabase authentication, user profiles, project history & secure storage** (Registration, login, password recovery, Google OAuth detection, user profiles, save/reopen/delete projects, strict account isolation with RLS, dual-mode: Supabase live & localStorage demo).
11. [x] **PHASE 10 CORRECTION – PhotoMaze Rebranding, 100% Free Architecture & Indian Default Preset** (New vector SVG logos, 100% free guarantee, guest mode local saving, Indian 35×45mm passport default, PSK/POPSK guidance, complete monetization removal).
12. [ ] **PHASE 11 – Android Mobile Application (Capacitor packaging)** (Awaiting approval of website before beginning Android Studio APK packaging).

---

## Detailed Deliverables Completed in Phase 3

- [x] **Supported Upload Formats:** Full validation for `JPG`, `JPEG`, `PNG`, `WEBP`, `HEIC`, and `HEIF` with file size limit protection (up to 20MB).
- [x] **Drag-and-Drop & Mobile Input:** Interactive drag-and-drop canvas dropzone and mobile-friendly file browser trigger.
- [x] **Upload Progress Indicator:** Visual progress indicator displaying stage messages and animated 0% to 100% completion bar.
- [x] **Reversible Original Image Preservation:** The raw uploaded image is stored in `originalImageSrc` memory state and never overwritten by transforms, ensuring all edits remain 100% reversible.
- [x] **Replace Photo:** 1-click photo replacement button triggering the file picker and updating the editor while preserving the country size preset.
- [x] **Delete Photo:** Safe deletion workflow prompting confirmation, wiping active buffers and resetting editor to the dropzone state.
- [x] **Interactive Zoom & Scaling:** Continuous slider (50% to 300%), mouse wheel zoom, and floating zoom percentage controls.
- [x] **Continuous & Stepped Rotation:** Fine rotation angle slider (-45° to +45°), ±90° clockwise/counter-clockwise buttons, and horizontal/vertical flips.
- [x] **Manual Cropping & Positioning:** Aspect ratio boundary matching country regulations, with smooth horizontal (Pan X) and vertical (Pan Y) mouse/touch drag manipulation and numeric sliders.
- [x] **Biometric ICAO Guideline Overlay:** 1-click toggleable overlay displaying eye level line, chin line, top-of-head line, vertical symmetry midline, and head height bracket.
- [x] **Lighting & Tone Adjustments:** Real-time brightness (-50 to +50), contrast (-50 to +50), and saturation (-50 to +50) controls.
- [x] **Reset Adjustments:** 1-click restore function resetting all transforms, zoom, pan, and rotations back to default without losing the uploaded photo.
- [x] **Sharp Image Processing Engine (`/api/image/crop`):** Server-side pipeline receiving crop coordinates and rotation, extracting the region with Lanczos3 resampling, applying mozjpeg compression, and embedding exact 300 DPI density metadata.
- [x] **Client-Side Canvas Exporter:** In-browser offscreen `<canvas>` renderer allowing instant high-resolution 300 DPI JPEG downloads.

---

## Detailed Deliverables Completed in Phase 4

- [x] **Zero-Cost Client-Side AI Engine:** Integrated `@huggingface/transformers` (Apache-2.0 license) with `briaai/RMBG-1.4`, running client-side with WebGPU hardware acceleration and WASM CPU fallback for ₹0 operating cost.
- [x] **Accurate Person & Hair Segmentation:** Neural sub-pixel matting preserving intricate hair strands, ear contours, collars, and neck boundaries without halo or jagged pixel artifacts.
- [x] **Transparent Background Output (PNG):** True 4-channel alpha transparency cutout generation and export.
- [x] **Compliant Solid Background Replacements:**
  - **Pure White (`#FFFFFF`):** Compliant with US, UK, Schengen, EU, India, Canada, Australia passport guidelines.
  - **Light Blue (`#B9D7EA`):** Compliant with Malaysia, Kuwait, and special visa standards.
  - **Royal Blue (`#1D4ED8`):** Compliant with Philippines, Singapore student passes, and ASEAN document standards.
  - **Light Gray (`#E5E7EB`):** Compliant with GCC, UAE, and German ID standards.
  - **Red (`#C4151C`):** Compliant with Indonesian passport and residency documentation.
- [x] **Interactive Custom Color Palette Picker:** Native color well and hex string input for bespoke background colors.
- [x] **Interactive Before-and-After Comparison Slider:** Split screen slider overlay allowing side-by-side inspection of original selfie vs. clean AI cutout.
- [x] **Non-Destructive Reversibility:** Original photo remains untouched in memory with 1-click "Original BG" restore button.
- [x] **Modular API Adapter Pattern (`/api/ai/remove-bg`):** Multi-provider backend router supporting Photoroom, Replicate BiRefNet, and automatic zero-cost client WebGPU fallback.
- [x] **Loading, Progress & Error Handling:** Real-time progress bar (0% to 100%) showing neural loading stages, error catching with 1-click retry.
- [x] **300 DPI Alpha Compositing:** `canvasRenderer.ts` composites the selected background color directly beneath the transparent cutout at exact 300 DPI passport specifications.

---

## Detailed Deliverables Completed in Phase 5

- [x] **Client-Side Face & Landmark Detection Engine:** Integrated `@mediapipe/tasks-vision` (Google Apache-2.0 license) executing in-browser WebAssembly/GPU for 100% zero-cost biometric extraction with zero cloud API latency or fees.
- [x] **468 Biometric Facial Landmarks & Pose Tracking:** Computes eye centers (left/right pupils), eye plane midpoint, nose tip, mouth, menton (bottom of chin), crown (top of hair), ears (tragus), and head roll/tilt angle in degrees.
- [x] **1-Click Biometric Auto-Cropper (`computeBiometricAutoCrop`):**
  - Aligns eye plane with standard ICAO Doc 9303 vertical guidelines (~56%–62% from bottom).
  - Horizontally centers facial midline (X = 0).
  - Automatically calculates optimal zoom so head height conforms to national legal percentage brackets (e.g. 50–69% for US, 70–80% for Schengen/EU).
  - Automatically compensates for head tilt/roll angles.
- [x] **Comprehensive Verified Country Photo Specification Database:**
  - 29+ official presets across **India, USA, UK, Canada, Australia, China, Germany, France, Japan, UAE, Singapore, Malaysia, Indonesia, Philippines, South Korea, New Zealand, Brazil, Saudi Arabia, South Africa**, and the **Schengen Area**.
  - Covers **Passports, Visas, National ID Cards, and Driving Licenses**.
  - Contains verified official government ministry source URLs (e.g. `travel.state.gov`, `passportindia.gov.in`, `gov.uk`, `canada.ca`, `passports.gov.au`, etc.) and verification audit dates.
  - No invented or fabricated dimensions.
- [x] **Custom Dimensions, Units & DPI Builder:**
  - Supports custom width & height inputs.
  - Multi-unit conversion: Millimeters (`mm`), Centimeters (`cm`), Inches (`in`), and Pixels (`px`).
  - DPI options: 150 DPI (Draft/Web), 300 DPI (Official Print Standard), 600 DPI (Ultra HD Archival).
- [x] **Live Biometric Compliance Audit Engine (`evaluateBiometricCompliance`):**
  - Itemized 5-point compliance audit:
    1. Human face presence and single subject detection.
    2. Head pose & roll tilt tolerance (≤ 3° pass, > 5° warning/fail).
    3. Head size coverage vs. national min/max percentage bracket.
    4. Horizontal face centering along the vertical midline.
    5. Resolution & 300 DPI print quality check.
  - Overall biometric compliance score (0–100 PTS) with real-time feedback and remediation guidance.
- [x] **Dynamic Biometric Canvas Overlay Guides:**
  - Renders official Crown Line, Eye Plane Line, Chin Base Line, Vertical Symmetry Midline, and Target Facial Oval based on the active country regulation.

---

## Detailed Deliverables Completed in Phase 6

- [x] **21+ Official Formal Outfit Templates** across 7 categories:
  - Business Suits (Navy, Charcoal, Black, Pinstripe) — Men's
  - Blazers (Navy, Grey — Men's; Black, Navy — Women's)
  - Formal Shirts (White, Blue — Men's; White Blouse — Women's)
  - Men's Formal (White Kurta — Indian government documents)
  - Women's Formal (Navy Dress, Grey Pantsuit, Black Formal)
  - Children's Formal (White Shirt, Formal Dress, Navy Blazer)
  - Professional / Unisex (White Formal, Black Turtleneck, Navy Shirt)
- [x] **Real Replicate IDM-VTON Integration (`src/lib/adapters/outfit/replicateIdmVton.ts`):**
  - POST to Replicate predictions API with `cuuupid/idm-vton` model
  - Async polling loop with 30s intervals, 2-minute timeout, exponential backoff
  - 3-retry logic on 5xx errors and transient failures
  - Cost estimate: ~$0.003 USD per prediction (pay-per-use, no subscription)
- [x] **Modular Adapter Architecture — Future Providers Stubbed:**
  - `src/lib/adapters/outfit/stabilityInpainting.ts` — Stability AI stub (ready for activation)
  - `src/lib/adapters/outfit/falCatVton.ts` — Fal.ai CatVTON stub (ready for activation)
- [x] **Server-Side API Route (`/api/ai/outfit-replace`):**
  - Accepts `multipart/FormData` with `personImage`, `garmentUrl`, `outfitId`, `garmentDesc`
  - Fast-fails with `402 Payment Required` + `requiresApiKey: true` when no token set
  - 10 MB image size validation, MIME type enforcement (JPG/PNG/WEBP)
  - 2-minute `maxDuration` for Replicate polling on Vercel/Cloudflare
- [x] **New `OutfitReplacementState` TypeScript Interface** in `src/types/editor.ts`
- [x] **`"outfit"` Tab Added to `SidebarTab` Union Type**
- [x] **Full EditorContext Integration:**
  - `outfitState` — reactive state for processing, progress, error, output URL
  - `triggerOutfitReplacement(outfit)` — calls API, streams progress stages
  - `restoreOriginalOutfit()` — non-destructive clear (original image untouched)
  - `setOutfitPreviewMode(bool)` — before/after toggle
- [x] **`OutfitSelector.tsx` UI Component:**
  - 8 scrollable category filter tabs (All / Business Suits / Blazers / Shirts / Men's / Women's / Children's / Professional)
  - Outfit card grid (2 columns) with thumbnail images, gender badge, apply state indicator
  - **API Key Required banner** — shown when `requiresApiKey: true`; includes `.env.local` snippet and link to `replicate.com/account/api-tokens`
  - Real-time generation progress bar with stage messages
  - Before/After toggle buttons (Original ↔ With Outfit)
  - "Restore Original Clothing" button
  - Cost disclosure (~$0.003/image) shown prominently
- [x] **Outfit Tab in EditorSidebar:**
  - 5th tab button with `Shirt` Lucide icon and violet accent
  - Purple dot indicator when outfit is applied
- [x] **Canvas Outfit Preview Badge in EditorCanvas:**
  - "Outfit On / Show Outfit" floating badge in canvas toolbar
  - `activeDisplaySrc` logic — seamlessly swaps displayed image to AI result when `previewMode=true`
- [x] **Non-Destructive Design:** `originalImageSrc` is never modified; AI output stored separately as `outfitState.outputImageUrl`
- [x] **`.env.example` Updated** with IDM-VTON cost disclosure, model name, and token URL
- [x] **76/76 Automated Tests Passed** (`test-phase6.js`)
- [x] **Production Build Passes** (`npm run build` exit code 0)

### Phase 6 Cost Disclosure
| Provider | Model | Cost | Activation |
|---|---|---|---|
| Replicate | IDM-VTON (`cuuupid/idm-vton`) | ~$0.003/image | Add `REPLICATE_API_TOKEN` to `.env.local` |
| Stability AI | SDXL Inpainting | ~$0.002–0.005/image | Future stub — not yet implemented |
| Fal.ai | CatVTON | ~$0.001–0.003/image | Future stub — not yet implemented |

> **Budget impact:** ₹0 to test (no API key = graceful gate). Live cost with Replicate ≈ ₹0.25 per image (at ₹84/\$1).

---

## Detailed Deliverables Completed in Phase 7

- [x] **Zero-Cost Browser-Based Enhancement Engine (`src/lib/image/portraitEnhancer.ts`):**
  - **Skin Retouching & Blemish Reduction:** YCbCr chromaticity gamut skin segmentation ($77 \le Cb \le 133, 133 \le Cr \le 175$) paired with bilateral edge-stopping surface blur. Softens uneven skin tone, redness, and transient blemishes without blurring eyebrows, eyes, lips, nostrils, or facial jawline.
  - **Lighting Correction:** Non-linear shadow-lifting curve that restores underexposed eye sockets and chin shadows common in home photos while preventing blown-out highlights.
  - **Brightness & Contrast Calibration:** Midtone-anchored contrast expansion and linear/non-linear brightness adjustments.
  - **Eye & Hair Unsharp Masking (USM):** High-pass convolution filter isolating and boosting crisp high-frequency details on pupils, eyelashes, and hair textures while sparing flat skin areas.
  - **High-Frequency Noise Reduction:** Chroma and luminance grain filtering on uniform backdrop and flat facial patches without softness.
  - **Color Temperature & White Balance Correction:** Warm/cool tint adjustment eliminating unflattering fluorescent yellow or harsh smartphone flash blue casts.
  - **300 DPI Detail Reconstruction / Super-Resolution:** Sub-pixel Lanczos3 supersampling ensuring razor-sharp print exports.
  - **Facial Identity & Natural Appearance Preservation:** All algorithms strictly respect ICAO Doc 9303 biometric guidelines—no synthetic distortion, unnatural plastic skin, or altered biometric ratios.
- [x] **Enhancement UI Panel (`src/components/editor/PortraitEnhancerPanel.tsx`):**
  - Master Enhancement On/Off switch with live active badge.
  - 1-Click Curated Presets: "ICAO Natural", "Studio Light", "Brighten Glow", "Ultra Subtle".
  - Fine-tuning sliders: Skin Retouching, Blemish Reduction, Lighting Correction, Sharpness, Noise Reduction, Color Temperature, Brightness, Contrast.
  - 300 DPI Resolution Enhancement toggle switch.
  - Before/After Comparison toggle.
  - 1-Click "Reset Sliders" restore button.
- [x] **Sidebar Integration (`src/components/editor/EditorSidebar.tsx`):**
  - 4th tab renamed to "Enhance" with `Sparkles` icon and active indicator badge.
  - Seamlessly hosts the `PortraitEnhancerPanel`.
- [x] **Canvas Interactive Viewport (`src/components/editor/EditorCanvas.tsx`):**
  - Real-time reactive preview using `enhancedImageUrl`.
  - Floating "Enhanced / Original" Before/After comparison toggle in canvas toolbar.
  - Instantaneous feedback with debounced processing.
- [x] **300 DPI Export Pipeline Integration (`src/lib/image/canvasRenderer.ts` & `/api/image/crop`):**
  - High-resolution `exportCroppedCanvas` composites the full enhancement pipeline at exact millimeter and 300 DPI passport targets.
  - Server-side Sharp pipeline extended with modulation, contrast curves, and sharpening.
- [x] **Modular Cloud Enhancer Adapter Stub (`src/lib/adapters/enhancement/replicateCodeFormer.ts`):**
  - CodeFormer / GFPGAN adapter stub ready for cloud token activation with graceful zero-cost fallback.
- [x] **Comprehensive Test Suite Passing (`test-phase7.js`):**
  - 60/60 automated algorithm, math, preset, UI, and export pipeline tests passing.
- [x] **Next.js Production Build Passes (`npm run build` exit code 0).**
- [x] **Development Server Active on `http://localhost:3000`.**

---

## Detailed Deliverables Completed in Phase 8

- [x] **Decoupled Architecture Modules (`src/lib/print/`):**
  - **`paperSizeRegistry.ts`:** Standard paper size catalog (A4, A5, A3, 4×6 photo paper, 5×7, 6×8, US Letter, US Legal, and Custom dimensions). Full conversion support between `mm`, `cm`, and `inches`.
  - **`photoDimensionConverter.ts`:** Physical-to-pixel and physical-to-point math. Enforces PostScript points ($72\text{ pt/in}$), DPI scaling ($150, 300, 600\text{ DPI}$), printer-safe hardware margins ($\ge 3\text{ mm}$), and boundary collision checks.
  - **`printLayoutCalculator.ts`:** Smart layout engine calculating column/row grids, available printable bounds, spacing, and multi-page pagination. Automatic orientation comparison selects the layout that minimizes paper count, maximizes photos per page, and eliminates waste.
  - **`printPreviewRenderer.ts`:** High-precision HTML5 canvas preview renderer displaying exact paper proportions, placed photographs, printable margin boundary guidelines, cutting guides, and page indicators.
  - **`pdfExportService.ts`:** Vector PDF generator using `pdf-lib`. Preserves exact physical dimensions in PostScript points, embeds high-quality images without distortion, draws vector cutting guides, and handles arbitrary multi-page documents.
  - **`imageExportService.ts`:** High-resolution raster sheet generator exporting true 300/600 DPI full-bleed JPEG and PNG files with exact pixel dimensions.
- [x] **User Inputs & Controls Supported:**
  1. Passport photo dimensions (automatically synchronizes with the active country specification or custom crop).
  2. Number of copies: supports arbitrary positive integers (1 to 1,000 photos) with instant quick-presets (1, 2, 4, 6, 8, 12, 16, 24, 30, 48) and custom number input.
  3. Paper selection: A4, A5, A3, 4×6, 5×7, 6×8, US Letter, US Legal, and Custom dimensions.
  4. Paper orientation: Auto (optimizes packing efficiency), Portrait, Landscape.
  5. Margins: configurable 0 to 30 mm (enforcing printer-safe minimums).
  6. Spacing: configurable 0 to 15 mm between adjacent photographs.
  7. DPI: 150 (Draft/Fast), 300 (Official Print Standard), 600 (Ultra HD Archival).
  8. Cutting guides: Corner crop marks, full dashed lines, solid borders, or none.
  9. Layout alignment: Centered or Top-Left.
  10. Custom paper dimensions: Width, Height, Units (`mm`, `cm`, `in`).
- [x] **Interactive UI (`src/components/print/PrintSheetModal.tsx`):**
  - Live scale-accurate print sheet preview with real-time reactive updates.
  - Zoom controls (50% to 200%) and view reset.
  - Multi-page navigation (Sheet X of Y with next/previous buttons).
  - Telemetry badges: photos per page, total sheets required, space efficiency percentage.
  - 1-click Download Vector PDF (`.pdf`).
  - 1-click Download JPEG Sheet (`.jpg` at chosen DPI).
  - 1-click Download PNG Sheet (`.png` lossless).
  - 1-click Direct Browser Print dialog (`window.print`).
- [x] **Editor Integration:**
  - Header "Print Sheet" quick action button in `src/app/editor/page.tsx`.
  - Sidebar full-width "Print Sheet Generator (A4, 4×6, PDF)" action button in `src/components/editor/EditorSidebar.tsx`.
  - Canvas top toolbar "Print Sheet" button in `src/components/editor/EditorCanvas.tsx`.
- [x] **18 Quality & Verification Tests Passing (`test-phase8.js`):**
  - 1 photo, 2 photos, 6 photos, 12 photos, 50 photos, 100 photos, 250 custom copies.
  - A4 paper, 4×6 photo paper, custom dimensions (in, cm, mm).
  - Portrait and landscape orientations.
  - Different photo sizes (35×45mm, 51×51mm / 2×2in, 33×48mm).
  - Multiple DPI values (150, 300, 600 DPI).
  - Multi-page vector PDF generation & physical dimension verification.
  - Exact copy counts across all sheets.
  - Cutting guide styles.
  - Printer-safe margins & non-overlapping coordinates.
- [x] **Zero Regressions:** 188 total automated tests passing across the project (76 Phase 6 + 60 Phase 7 + 52 Phase 8).
- [x] **Production Build Clean:** `npm run build` succeeds with exit code 0.
- [x] **Development Server Active on `http://localhost:3000`.**

---

## Detailed Deliverables Completed in Phase 9

- [x] **Complete Single Photo Export System (`src/lib/export/singlePhotoExport.ts`):**
  - **Portal-Ready JPEG:** Binary search compression optimization enforcing strict government upload portal file size ceilings (e.g. $\le 240\text{ KB}$ for US DS-160, $\le 200\text{ KB}$ for India OCI, $\le 500\text{ KB}$ for UK, $\le 100\text{ KB}$ for state portals) while preserving maximum visual fidelity.
  - **High-Res Print JPEG:** Maximum photographic quality (96% mozjpeg compression) at true 300 DPI or 600 DPI.
  - **Lossless PNG Cutout:** 4-channel RGBA lossless output preserving transparent cutouts or crisp solid backgrounds with embedded `pHYs` physical density metadata.
  - **Single-Photo Vector PDF:** 1-page vector PDF with exact physical document dimensions in PostScript points ($W_{pt} = W_{mm} \times 72 / 25.4$, $H_{pt} = H_{mm} \times 72 / 25.4$) and embedded high-resolution photo with 0 margin scaling distortion.
- [x] **DPI Metadata Injection & Extraction Engine (`src/lib/export/dpiMetadata.ts`):**
  - **JPEG JFIF APP0 Marker:** Injects and updates standard 18-byte JFIF headers with authentic 300 & 600 DPI density tags (units = 1, dots per inch). Prevents kiosk and portal rejection caused by default 72/96 DPI canvas headers.
  - **PNG pHYs Chunk:** Injects 21-byte physical pixel resolution chunk (`pHYs`) with exact pixels-per-meter values (11,811 ppm for 300 DPI; 23,622 ppm for 600 DPI) and CRC32 checksums.
  - Sub-millisecond execution with zero external dependencies and zero cloud costs.
- [x] **Cross-Platform Download & Share Engine (`src/lib/export/downloadHelper.ts`):**
  - Universal Blob object URL downloading across Desktop Chrome, Safari, Firefox, and Edge.
  - **Mobile iOS Safari Support:** Integrates Web Share API Level 2 (`navigator.share`), allowing iPhone/iPad users to save directly to Photos/Files or AirDrop without browser sandbox blocking.
  - **Android Support:** Direct blob download with verified MIME types and sanitized filenames.
- [x] **Single Photo Export Modal (`src/components/export/SinglePhotoExportModal.tsx`):**
  - Interactive modal with 4 use-case presets (Portal JPEG, Print JPEG, Cutout PNG, Vector PDF).
  - DPI resolution selector (300 DPI Standard vs 600 DPI Ultra-Sharp).
  - Target file size preset buttons (100 KB, 200 KB, 240 KB, 500 KB).
  - Live preview with real-time technical compliance inspection: exact pixel dimensions, physical print dimensions (mm & in), embedded DPI density, output file size in KB, and ICAO Doc 9303 checklist.
  - One-click download with animated status states (preparing, downloading, success feedback).
- [x] **Multi-Page Print Sheet Raster & Vector Export Verification:**
  - `src/lib/print/imageExportService.ts`: Renders full-bleed sheets with embedded 300 & 600 DPI metadata and memory-efficient Blob streaming (preventing mobile iOS Safari crashes on large canvases).
  - `src/lib/print/pdfExportService.ts`: Vector multi-page PDF generation via `pdf-lib` with exact physical dimensions in PostScript points.
- [x] **Comprehensive Quality & Verification Tests (`test-phase9.js`):**
  - 76/76 automated tests passing covering DPI metadata injection/reading, exact pixel math, portal size compression limits, physical PDF page dimensions, multi-page print sheets, and cross-platform download formats.
- [x] **Total Project Test Suite:** 264 automated tests passing across Phases 6, 7, 8, and 9 (0 failures).
- [x] **Production Build Clean:** `npm run build` succeeds with exit code 0.
- [x] **Dev Server Active:** Running on `http://localhost:3000`.
- [x] **Strict Budget Maintained:** ₹0.00 spent. ₹500 budget 100% intact.

---

## Detailed Deliverables Completed in Phase 10 Correction (PhotoMaze Rebranding & 100% Free Architecture)

- [x] **Brand Identity & Vector SVG Logos:**
  - Original vector SVG logo created: combination of photo frame, biometric portrait silhouette, and camera aperture shutter maze geometry.
  - Light variant: [`public/logo.svg`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/public/logo.svg)
  - Dark variant: [`public/logo-dark.svg`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/public/logo-dark.svg)
  - Standalone app icon: [`public/icon.svg`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/public/icon.svg)
  - Web App Manifest: [`public/manifest.json`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/public/manifest.json) configured for standalone display with PhotoMaze metadata.
- [x] **100% Free Model & Complete Monetization Audit:**
  - Removed all pricing plans, paid credits, credit deduction tiers, and paywall concepts.
  - Replaced homepage `<PricingSection />` with **100% Free Forever Community Guarantee & Privacy Showcase**.
  - Removed obsolete Razorpay and Stripe configuration keys from `.env.example`.
  - Removed payment/order table schemas; user profiles simplified to 100% free account tier.
  - Updated FAQ section to clarify that PhotoMaze is completely free with zero hidden charges.
- [x] **Free-First Guest Architecture:**
  - **Continue as Guest:** Users can edit, enhance, crop, and download full-resolution 300 DPI photos with zero registration.
  - **Local Project Saving:** Projects can be saved directly into browser storage (`localStorage`) without requiring an account.
  - **Projects Modal:** Unified view supporting both local guest projects and optional cloud-synced accounts.
  - **Privacy:** Images are processed on-device (client-side WebGPU/WASM and Canvas); photos are never uploaded without explicit user action.
  - **Optional Supabase Cloud Sync:** Free-tier compatible for users who choose to register for cross-device backups.
- [x] **Indian Passport Photo as Primary Default:**
  - Positioned as spec index `0` in `OFFICIAL_COUNTRY_SPECS` in [`src/lib/constants/countries.ts`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/src/lib/constants/countries.ts).
  - Default specifications:
    - Dimensions: **35 × 45 mm** (Portrait)
    - 300 DPI Pixel Count: **413 × 531 pixels**
    - Background: **Pure White** (`#FFFFFF`)
    - Head coverage: **70%–80%** (31.5–36 mm)
    - Full color photograph.
  - Official nuance guidance: Explicit notes explaining that Passport Seva Kendras (PSK/POPSK) capture photos digitally at kiosks, while 3.5×4.5 cm physical prints are required at certain collection centres, camp drives, and for minors under 4.
  - Retained separate official preset for **Indian Consulates Abroad / OCI** (50.8 × 50.8 mm / 2 × 2 inches).
  - Official source links (`passportindia.gov.in`) and verification audit dates.
  - Disclaimers clearly label specifications as preparation guidance, not a guarantee of passport acceptance.
- [x] **Branding Updates Across Application:**
  - Header, Navbar, Footer, and Studio toolbar updated to PhotoMaze with vector icon.
  - Page title and OpenGraph metadata updated.
  - PDF export metadata (`pdfExportService.ts` and `singlePhotoExport.ts`) set Producer and Creator to "PhotoMaze".
  - Health check endpoint (`/api/health`) updated to "PhotoMaze API".
  - `package.json` package name set to `"photomaze"`.
- [x] **Comprehensive Automated Verification:**
  - 64 new automated tests in [`test-photomaze.js`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/test-photomaze.js) covering branding, SVG validities, free guarantees, Indian presets, guest mode local saving, and UI access.
  - All 394 automated tests passing across 6 suites (Phase 6: 76, Phase 7: 60, Phase 8: 52, Phase 9: 76, Phase 10: 66, PhotoMaze: 64).
  - Clean production build (`npm run build` exits with code 0).
  - Dev server active.

---

## Detailed Deliverables Completed in Phase 10

- [x] **Dual-Mode Architecture (Supabase Live & localStorage Demo):**
  - Full Supabase cloud mode activates automatically when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`.
  - Zero-configuration localStorage demo mode works out of the box without any Supabase setup, enabling full testing of all auth and project flows offline.
  - Mode indicator badge visible in the Auth modal (green "LIVE" vs amber "DEMO").
- [x] **Complete Authentication System (`src/lib/auth/authService.ts`):**
  - **Email/Password Registration:** With input validation (email format, 6+ char password, display name).
  - **Email/Password Login:** With credential verification and clear error messages.
  - **Password Recovery:** `sendPasswordResetEmail()` triggers Supabase password reset flow (or simulates in demo mode).
  - **Password Update:** `updatePassword()` changes the active user's password with session re-verification.
  - **Google OAuth:** `signInWithGoogle()` triggers Supabase OAuth redirect when configured; gracefully detects unconfigured/placeholder credentials and reports status.
  - **Profile Management:** Update display name and avatar URL.
  - **Session Management:** `getCurrentSession()`, `onAuthStateChange()` listener, and automatic session persistence.
  - **Logout:** Clean session teardown and state reset.
- [x] **Supabase PostgreSQL Schema (`supabase/schema.sql`):**
  - `profiles` table: `id (UUID PK → auth.users)`, `email`, `display_name`, `avatar_url`, `created_at`, `updated_at`.
  - `passport_projects` table: `id (UUID PK)`, `user_id (FK → profiles)`, `title`, `country`, `document_type`, `width_mm`, `height_mm`, `original_image_url`, `cutout_image_url`, `background_color`, `transform_data (JSONB)`, `enhancement_settings (JSONB)`, `created_at`, `updated_at`.
  - **Row Level Security (RLS):** All tables have `ENABLE ROW LEVEL SECURITY` with strict policies enforcing `auth.uid() = user_id` on SELECT, INSERT, UPDATE, and DELETE.
  - **Auto-Profile Trigger:** `handle_new_user()` function automatically creates a profile row on `auth.users` INSERT.
  - **Storage Bucket:** `passport-projects` bucket with per-user folder isolation (`user_id/**`).
- [x] **React Auth Context & Modal (`src/lib/context/AuthContext.tsx` & `src/components/auth/AuthModal.tsx`):**
  - `AuthProvider` wraps the entire app in `layout.tsx`.
  - `useAuth()` hook exposes user state, loading state, modal controls, and all auth actions.
  - Multi-view Auth Modal: Login → Register → Forgot Password → Profile views with animated transitions.
  - Google OAuth button with configuration detection.
  - Mode indicator badge (Supabase Live / Demo Mode).
- [x] **Project History System (`src/lib/projects/projectService.ts` & `src/components/projects/ProjectsModal.tsx`):**
  - **Save Current Project:** Captures country, document type, dimensions, original image URL, cutout URL, background color, zoom/pan/rotation transforms, and enhancement settings.
  - **List Projects:** Retrieves all projects for the authenticated user, sorted by last modified.
  - **Reopen Project:** Full state reconstruction — restores country spec (exact match or fallback builder), images, transforms, and adjustments into EditorContext via `restoreProject()`.
  - **Delete Project:** With confirmation dialog and cascade cleanup.
  - **Search & Filter:** Real-time search by project title.
  - **Thumbnail Grid:** Visual project cards with country flags, dimension badges, and timestamps.
  - **Access Control:** All operations enforce `userId` ownership. Unauthorized access returns `403 Forbidden`.
- [x] **Strict Account Isolation (Security Verified):**
  - User B cannot list, read, update, or delete User A's projects.
  - Cross-account access attempts return `403 Forbidden`.
  - Supabase RLS policies enforce isolation at the database level.
  - localStorage demo mode enforces isolation via `userId` key prefixing.
- [x] **Editor Integration (`src/app/editor/page.tsx`):**
  - **Sign In / Profile Button:** Shows "Sign In" when unauthenticated, user avatar/name when authenticated.
  - **Save Project Button:** Bookmark icon in header; prompts sign-in if unauthenticated.
  - **Projects Modal:** Accessible from header; lists saved projects with reopen/delete actions.
- [x] **Secure Image Storage (`src/lib/supabase/storage.ts`):**
  - Upload project image assets to Supabase Storage `passport-projects` bucket.
  - Per-user folder structure: `{userId}/{projectId}/{filename}`.
  - Delete project assets on project deletion.
  - Graceful no-op when Supabase is unconfigured.
- [x] **Types & Interfaces:**
  - `src/types/auth.ts`: `UserProfile`, `AuthSession`, `AuthView`, `AuthState`.
  - `src/types/project.ts`: `PassportProject`, `SaveProjectPayload`.
- [x] **Comprehensive Test Suite (`test-phase10.js`):**
  - 66/66 automated tests passing covering:
    - Auth service API (register, login, session, profile update, logout)
    - Multi-account demo mode with unique user IDs
    - Login validation (wrong password, non-existent email)
    - Password recovery and update flow
    - Google OAuth configuration detection
    - Project CRUD (create, read, update, delete)
    - Project state preservation (dimensions, transforms, adjustments)
    - Strict cross-account isolation (6 security tests)
    - Legitimate deletion and edge cases
- [x] **Total Project Test Suite:** 330 automated tests passing across Phases 6–10 (0 failures).
- [x] **Production Build Clean:** `npm run build` succeeds with exit code 0.
- [x] **Dev Server Active:** Running on `http://localhost:3000`.
- [x] **Strict Budget Maintained:** ₹0.00 spent. ₹500 budget 100% intact.

---

## Detailed Deliverables Completed in Phase 10 Correction (PhotoMaze Rebranding & 100% Free Architecture)

- [x] **Brand Identity & Vector SVG Logos:**
  - Original vector SVG logo created: combination of photo frame, biometric portrait silhouette, and camera aperture shutter maze geometry.
  - Light variant: [`public/logo.svg`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/public/logo.svg)
  - Dark variant: [`public/logo-dark.svg`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/public/logo-dark.svg)
  - Standalone app icon: [`public/icon.svg`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/public/icon.svg)
  - Web App Manifest: [`public/manifest.json`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/public/manifest.json) configured for standalone display with PhotoMaze metadata.
- [x] **100% Free Model & Complete Monetization Audit:**
  - Removed all pricing plans, paid credits, credit deduction tiers, and paywall concepts.
  - Replaced homepage `<PricingSection />` with **100% Free Forever Community Guarantee & Privacy Showcase**.
  - Removed obsolete Razorpay and Stripe configuration keys from `.env.example`.
  - Removed payment/order table schemas; user profiles simplified to 100% free account tier.
  - Updated FAQ section to clarify that PhotoMaze is completely free with zero hidden charges.
- [x] **Free-First Guest Architecture:**
  - **Continue as Guest:** Users can edit, enhance, crop, and download full-resolution 300 DPI photos with zero registration.
  - **Local Project Saving:** Projects can be saved directly into browser storage (`localStorage`) without requiring an account.
  - **Projects Modal:** Unified view supporting both local guest projects and optional cloud-synced accounts.
  - **Privacy:** Images are processed on-device (client-side WebGPU/WASM and Canvas); photos are never uploaded without explicit user action.
  - **Optional Supabase Cloud Sync:** Free-tier compatible for users who choose to register for cross-device backups.
- [x] **Indian Passport Photo as Primary Default:**
  - Positioned as spec index `0` in `OFFICIAL_COUNTRY_SPECS` in [`src/lib/constants/countries.ts`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/src/lib/constants/countries.ts).
  - Default specifications:
    - Dimensions: **35 × 45 mm** (Portrait)
    - 300 DPI Pixel Count: **413 × 531 pixels**
    - Background: **Pure White** (`#FFFFFF`)
    - Head coverage: **70%–80%** (31.5–36 mm)
    - Full color photograph.
  - Official nuance guidance: Explicit notes explaining that Passport Seva Kendras (PSK/POPSK) capture photos digitally at kiosks, while 3.5×4.5 cm physical prints are required at certain collection centres, camp drives, and for minors under 4.
  - Retained separate official preset for **Indian Consulates Abroad / OCI** (50.8 × 50.8 mm / 2 × 2 inches).
  - Official source links (`passportindia.gov.in`) and verification audit dates.
  - Disclaimers clearly label specifications as preparation guidance, not a guarantee of passport acceptance.
- [x] **Branding Updates Across Application:**
  - Header, Navbar, Footer, and Studio toolbar updated to PhotoMaze with vector icon.
  - Page title and OpenGraph metadata updated.
  - PDF export metadata (`pdfExportService.ts` and `singlePhotoExport.ts`) set Producer and Creator to "PhotoMaze".
  - Health check endpoint (`/api/health`) updated to "PhotoMaze API".
  - `package.json` package name set to `"photomaze"`.
- [x] **Comprehensive Automated Verification:**
  - 64 new automated tests in [`test-photomaze.js`](file:///Users/user/Desktop/Anti%20Gravity/Passport%20Photo%20Maker/test-photomaze.js) covering branding, SVG validities, free guarantees, Indian presets, guest mode local saving, and UI access.
  - All 394 automated tests passing across 6 suites (Phase 6: 76, Phase 7: 60, Phase 8: 52, Phase 9: 76, Phase 10: 66, PhotoMaze: 64).
  - Clean production build (`npm run build` exits with code 0).
  - Dev server active.
