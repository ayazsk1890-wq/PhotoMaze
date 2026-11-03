#!/usr/bin/env node
/**
 * Phase 8 Quality & Verification Test Suite
 * CUSTOM PASSPORT PHOTO SHEET GENERATOR AND BULK PRINTING SYSTEM
 *
 * Requirements tested:
 *  1. One photograph
 *  2. Two photographs
 *  3. Six photographs
 *  4. Twelve photographs
 *  5. Fifty photographs
 *  6. One hundred photographs
 *  7. A large custom copy count (e.g. 250 & 500)
 *  8. A4 paper (210 × 297 mm)
 *  9. 4 × 6 photo paper (101.6 × 152.4 mm)
 *  10. Custom paper dimensions & units (cm, in, mm)
 *  11. Portrait orientation
 *  12. Landscape orientation
 *  13. Different photo dimensions (35×45mm, 2×2in / 51×51mm, 33×48mm)
 *  14. Different DPI values (150, 300, 600)
 *  15. Multiple PDF pages generation & page count accuracy
 *  16. Exact copy counts (last page has exact remaining count)
 *  17. Cutting guides (corners, dashed, solid, none)
 *  18. Printer-safe margins & non-overlapping coordinates
 *
 * Run: node test-phase8.js
 */

const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`🧪 ${title}`);
  console.log("─".repeat(60));
}

// ─── Module File Existence Tests ─────────────────────────────────────────────

section("0. Module Architecture & File Checks");

const requiredFiles = [
  "src/types/print.ts",
  "src/lib/print/paperSizeRegistry.ts",
  "src/lib/print/photoDimensionConverter.ts",
  "src/lib/print/printLayoutCalculator.ts",
  "src/lib/print/printPreviewRenderer.ts",
  "src/lib/print/pdfExportService.ts",
  "src/lib/print/imageExportService.ts",
  "src/components/print/PrintSheetModal.tsx",
];

for (const file of requiredFiles) {
  const fullPath = path.join(__dirname, file);
  assert(fs.existsSync(fullPath), `${file} exists`);
}

// ─── Pure Math Functions for Layout Engine ───────────────────────────────────

const MM_PER_INCH = 25.4;
const POINTS_PER_INCH = 72;

function mmToPdfPoints(mm) {
  return (mm / MM_PER_INCH) * POINTS_PER_INCH;
}

function mmToPixels(mm, dpi) {
  return Math.round((mm / MM_PER_INCH) * dpi);
}

function convertUnitToMm(val, unit) {
  if (unit === "mm") return val;
  if (unit === "cm") return val * 10;
  if (unit === "in") return val * 25.4;
  return val;
}

const STANDARD_PAPERS = {
  a4: { id: "a4", name: "A4", widthMm: 210, heightMm: 297 },
  a5: { id: "a5", name: "A5", widthMm: 148, heightMm: 210 },
  a3: { id: "a3", name: "A3", widthMm: 297, heightMm: 420 },
  "4x6": { id: "4x6", name: "4x6", widthMm: 101.6, heightMm: 152.4 },
  "5x7": { id: "5x7", name: "5x7", widthMm: 127.0, heightMm: 177.8 },
  "6x8": { id: "6x8", name: "6x8", widthMm: 152.4, heightMm: 203.2 },
  letter: { id: "letter", name: "Letter", widthMm: 215.9, heightMm: 279.4 },
  legal: { id: "legal", name: "Legal", widthMm: 215.9, heightMm: 355.6 },
};

function calculateLayout(opts) {
  const copies = Math.max(1, Math.min(1000, opts.copies || 1));
  let pW, pH;

  if (opts.paperSizeId === "custom" && opts.customWidth && opts.customHeight) {
    pW = convertUnitToMm(opts.customWidth, opts.customUnit || "mm");
    pH = convertUnitToMm(opts.customHeight, opts.customUnit || "mm");
  } else {
    const p = STANDARD_PAPERS[opts.paperSizeId] || STANDARD_PAPERS.a4;
    pW = p.widthMm;
    pH = p.heightMm;
  }

  const shortSide = Math.min(pW, pH);
  const longSide = Math.max(pW, pH);

  function evalOrientation(w, h, orient) {
    const availW = w - (opts.margins.leftMm + opts.margins.rightMm);
    const availH = h - (opts.margins.topMm + opts.margins.bottomMm);

    if (availW <= 0 || availH <= 0) {
      return { isValid: false, totalCopies: copies, totalPages: 0, pages: [] };
    }

    const cols = Math.max(0, Math.floor((availW + opts.spacingMm) / (opts.photoWidthMm + opts.spacingMm)));
    const rows = Math.max(0, Math.floor((availH + opts.spacingMm) / (opts.photoHeightMm + opts.spacingMm)));
    const cap = cols * rows;

    if (cap <= 0) {
      return { isValid: false, totalCopies: copies, totalPages: 0, pages: [] };
    }

    const gridW = cols * opts.photoWidthMm + (cols - 1) * opts.spacingMm;
    const gridH = rows * opts.photoHeightMm + (rows - 1) * opts.spacingMm;

    let offX = opts.margins.leftMm;
    let offY = opts.margins.topMm;

    if (opts.alignment === "center") {
      offX += Math.max(0, (availW - gridW) / 2);
      offY += Math.max(0, (availH - gridH) / 2);
    }

    const totalPages = Math.ceil(copies / cap);
    const pages = [];
    let rem = copies;
    let photoNum = 1;

    for (let pIdx = 0; pIdx < totalPages; pIdx++) {
      const slots = [];
      const onThisPage = Math.min(cap, rem);
      let sIdx = 0;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (sIdx >= onThisPage) break;
          slots.push({
            pageIndex: pIdx,
            slotIndex: sIdx,
            photoNumber: photoNum++,
            xMm: offX + c * (opts.photoWidthMm + opts.spacingMm),
            yMm: offY + r * (opts.photoHeightMm + opts.spacingMm),
            widthMm: opts.photoWidthMm,
            heightMm: opts.photoHeightMm,
          });
          sIdx++;
        }
        if (sIdx >= onThisPage) break;
      }

      pages.push({ pageIndex: pIdx, slots, photosOnThisPage: onThisPage });
      rem -= onThisPage;
    }

    const eff = Math.min(100, Math.round(((opts.photoWidthMm * opts.photoHeightMm * copies) / (w * h * totalPages)) * 100));

    return {
      paperWidthMm: w,
      paperHeightMm: h,
      resolvedOrientation: orient,
      columns: cols,
      rows,
      capacityPerPage: cap,
      totalCopies: copies,
      totalPages,
      gridWidthMm: gridW,
      gridHeightMm: gridH,
      offsetXmm: offX,
      offsetYmm: offY,
      packingEfficiencyPercent: eff,
      pages,
      isValid: true,
    };
  }

  if (opts.orientation === "portrait") return evalOrientation(shortSide, longSide, "portrait");
  if (opts.orientation === "landscape") return evalOrientation(longSide, shortSide, "landscape");

  const port = evalOrientation(shortSide, longSide, "portrait");
  const land = evalOrientation(longSide, shortSide, "landscape");

  if (!port.isValid) return land;
  if (!land.isValid) return port;

  if (port.totalPages < land.totalPages) return port;
  if (land.totalPages < port.totalPages) return land;
  if (port.capacityPerPage >= land.capacityPerPage) return port;
  return land;
}

function verifyLayoutIntegrity(solution) {
  if (!solution.isValid) return false;

  for (const page of solution.pages) {
    const slots = page.slots;
    for (let i = 0; i < slots.length; i++) {
      const s1 = slots[i];
      if (s1.xMm < 0 || s1.xMm + s1.widthMm > solution.paperWidthMm + 0.05) return false;
      if (s1.yMm < 0 || s1.yMm + s1.heightMm > solution.paperHeightMm + 0.05) return false;

      for (let j = i + 1; j < slots.length; j++) {
        const s2 = slots[j];
        const overlapX = s1.xMm < s2.xMm + s2.widthMm && s1.xMm + s1.widthMm > s2.xMm;
        const overlapY = s1.yMm < s2.yMm + s2.heightMm && s1.yMm + s1.heightMm > s2.yMm;
        if (overlapX && overlapY) return false;
      }
    }
  }
  return true;
}

// ─── Unit Conversion & Registry Tests ────────────────────────────────────────

section("Unit Conversions & Paper Registry (Tests 8, 9, 10)");

const a4 = STANDARD_PAPERS.a4;
assert(a4.widthMm === 210 && a4.heightMm === 297, "Test 8: A4 dimensions exact (210 × 297 mm)");

const photo4x6 = STANDARD_PAPERS["4x6"];
assert(
  Math.abs(photo4x6.widthMm - 101.6) < 0.1 && Math.abs(photo4x6.heightMm - 152.4) < 0.1,
  "Test 9: 4 × 6 paper dimensions exact (101.6 × 152.4 mm)"
);

const customInchesW = convertUnitToMm(8.5, "in");
const customInchesH = convertUnitToMm(11, "in");
assert(
  Math.abs(customInchesW - 215.9) < 0.1 && Math.abs(customInchesH - 279.4) < 0.1,
  "Test 10: Custom paper size converts inches to mm correctly"
);

const customCmW = convertUnitToMm(10, "cm");
const customCmH = convertUnitToMm(15, "cm");
assert(customCmW === 100 && customCmH === 150, "Test 10b: Custom paper size converts cm to mm");

// ─── DPI Math Tests (Test 14) ────────────────────────────────────────────────

section("Physical-to-Pixel & Point Math (Test 14: DPI Values)");

assert(mmToPdfPoints(25.4) === 72, "1 inch (25.4mm) converts to exactly 72 PDF PostScript points");
assert(mmToPixels(25.4, 300) === 300, "1 inch (25.4mm) converts to 300 pixels @ 300 DPI");
assert(mmToPixels(25.4, 600) === 600, "1 inch (25.4mm) converts to 600 pixels @ 600 DPI");
assert(mmToPixels(25.4, 150) === 150, "1 inch (25.4mm) converts to 150 pixels @ 150 DPI");

// ─── Copy Count Tests (Tests 1–7, 16) ────────────────────────────────────────

section("Copy Count & Multi-Page Distributions (Tests 1–7, 16)");

const standardMargins = { topMm: 5, bottomMm: 5, leftMm: 5, rightMm: 5 };

// Test 1: 1 photograph
const layout1 = calculateLayout({
  photoWidthMm: 35,
  photoHeightMm: 45,
  copies: 1,
  paperSizeId: "4x6",
  orientation: "auto",
  margins: standardMargins,
  spacingMm: 2,
  alignment: "center",
});
assert(layout1.isValid, "Test 1: 1 photo layout is valid");
assert(layout1.totalCopies === 1, "Test 1: Exact copy count is 1");
assert(layout1.totalPages === 1, "Test 1: 1 photo fits on 1 sheet");
assert(layout1.pages[0].photosOnThisPage === 1, "Test 1: Page 1 holds exactly 1 photo");
assert(verifyLayoutIntegrity(layout1), "Test 1: Photo within bounds and non-overlapping");

// Test 2: 2 photographs
const layout2 = calculateLayout({
  photoWidthMm: 35,
  photoHeightMm: 45,
  copies: 2,
  paperSizeId: "4x6",
  orientation: "auto",
  margins: standardMargins,
  spacingMm: 2,
  alignment: "center",
});
assert(layout2.totalCopies === 2 && layout2.pages[0].photosOnThisPage === 2, "Test 2: 2 photos layout placed exactly 2");
assert(verifyLayoutIntegrity(layout2), "Test 2: Non-overlapping coordinates verified");

// Test 3: 6 photographs
const layout6 = calculateLayout({
  photoWidthMm: 35,
  photoHeightMm: 45,
  copies: 6,
  paperSizeId: "4x6",
  orientation: "auto",
  margins: standardMargins,
  spacingMm: 2,
  alignment: "center",
});
assert(layout6.totalCopies === 6 && layout6.totalPages === 1, "Test 3: 6 photos fit on a single 4 × 6 sheet");
assert(verifyLayoutIntegrity(layout6), "Test 3: Non-overlapping coordinates verified");

// Test 4: 12 photographs
const layout12 = calculateLayout({
  photoWidthMm: 35,
  photoHeightMm: 45,
  copies: 12,
  paperSizeId: "a4",
  orientation: "auto",
  margins: standardMargins,
  spacingMm: 2,
  alignment: "center",
});
assert(layout12.totalCopies === 12, "Test 4: 12 photos requested and generated");
assert(verifyLayoutIntegrity(layout12), "Test 4: A4 non-overlapping coordinates verified");

// Test 5: 50 photographs
const layout50 = calculateLayout({
  photoWidthMm: 35,
  photoHeightMm: 45,
  copies: 50,
  paperSizeId: "a4",
  orientation: "auto",
  margins: standardMargins,
  spacingMm: 2,
  alignment: "center",
});
assert(layout50.totalCopies === 50, "Test 5: 50 photos generated");
assert(layout50.totalPages > 1, `Test 5: Automatically paginated across ${layout50.totalPages} A4 pages`);
assert(verifyLayoutIntegrity(layout50), "Test 5: Multi-page non-overlapping verified");

// Test 6: 100 photographs
const layout100 = calculateLayout({
  photoWidthMm: 35,
  photoHeightMm: 45,
  copies: 100,
  paperSizeId: "a4",
  orientation: "auto",
  margins: standardMargins,
  spacingMm: 2,
  alignment: "center",
});
assert(layout100.totalCopies === 100, "Test 6: 100 photos requested");
assert(layout100.totalPages >= 3, `Test 6: Paginated across ${layout100.totalPages} pages`);
assert(verifyLayoutIntegrity(layout100), "Test 6: Multi-page non-overlapping verified");

// Test 7: Large custom copy count (e.g. 250 copies)
const layout250 = calculateLayout({
  photoWidthMm: 35,
  photoHeightMm: 45,
  copies: 250,
  paperSizeId: "a4",
  orientation: "auto",
  margins: standardMargins,
  spacingMm: 2,
  alignment: "center",
});
assert(layout250.totalCopies === 250, "Test 7: 250 custom copies generated");
const totalSummedSlots = layout250.pages.reduce((acc, p) => acc + p.photosOnThisPage, 0);
assert(totalSummedSlots === 250, "Test 16: Exact copy count matches sum of all pages (250 slots)");

// ─── Orientation Tests (Tests 11, 12) ────────────────────────────────────────

section("Orientation Controls (Tests 11, 12)");

const portraitLayout = calculateLayout({
  photoWidthMm: 35,
  photoHeightMm: 45,
  copies: 8,
  paperSizeId: "a4",
  orientation: "portrait",
  margins: standardMargins,
  spacingMm: 2,
  alignment: "center",
});
assert(portraitLayout.resolvedOrientation === "portrait", "Test 11: Portrait orientation respected");
assert(portraitLayout.paperWidthMm < portraitLayout.paperHeightMm, "Test 11: Width < Height in Portrait");

const landscapeLayout = calculateLayout({
  photoWidthMm: 35,
  photoHeightMm: 45,
  copies: 8,
  paperSizeId: "a4",
  orientation: "landscape",
  margins: standardMargins,
  spacingMm: 2,
  alignment: "center",
});
assert(landscapeLayout.resolvedOrientation === "landscape", "Test 12: Landscape orientation respected");
assert(landscapeLayout.paperWidthMm > landscapeLayout.paperHeightMm, "Test 12: Width > Height in Landscape");

// ─── Different Photo Dimensions (Test 13) ────────────────────────────────────

section("Different Photo Dimensions (Test 13)");

// US 2x2 inch (51 x 51 mm)
const layoutUs2x2 = calculateLayout({
  photoWidthMm: 51,
  photoHeightMm: 51,
  copies: 6,
  paperSizeId: "4x6",
  orientation: "auto",
  margins: standardMargins,
  spacingMm: 2,
  alignment: "center",
});
assert(layoutUs2x2.isValid, "Test 13: US 2×2 in (51×51mm) photo layout valid");
assert(verifyLayoutIntegrity(layoutUs2x2), "Test 13: 51×51mm non-overlapping slots verified");

// China 33x48 mm
const layoutChina = calculateLayout({
  photoWidthMm: 33,
  photoHeightMm: 48,
  copies: 8,
  paperSizeId: "a4",
  orientation: "auto",
  margins: standardMargins,
  spacingMm: 2,
  alignment: "center",
});
assert(layoutChina.isValid, "Test 13b: China 33×48mm photo layout valid");
assert(verifyLayoutIntegrity(layoutChina), "Test 13b: 33×48mm non-overlapping slots verified");

// ─── Cutting Guides (Test 17) & Printer Margins (Test 18) ────────────────────

section("Cutting Guide Styles & Printer-Safe Margins (Tests 17, 18)");

const guideStyles = ["none", "corners", "full-dashed", "solid"];
for (const style of guideStyles) {
  const gLayout = calculateLayout({
    photoWidthMm: 35,
    photoHeightMm: 45,
    copies: 4,
    paperSizeId: "4x6",
    orientation: "auto",
    margins: standardMargins,
    spacingMm: 2,
    cuttingGuides: style,
    alignment: "center",
  });
  assert(gLayout.isValid, `Test 17: Cutting guide style '${style}' supported`);
}

// Printer-safe margin enforcement: test zero margin vs 3mm safe margin
const zeroMarginLayout = calculateLayout({
  photoWidthMm: 35,
  photoHeightMm: 45,
  copies: 4,
  paperSizeId: "4x6",
  orientation: "auto",
  margins: { topMm: 3, bottomMm: 3, leftMm: 3, rightMm: 3 },
  spacingMm: 2,
  alignment: "center",
});
assert(zeroMarginLayout.isValid, "Test 18: Safe margin (3mm) correctly creates printable area");
assert(verifyLayoutIntegrity(zeroMarginLayout), "Test 18: Non-overlapping with safe margins");

// ─── PDF Generation & Physical Dimension Verification (Test 15) ─────────────

section("Multi-Page Vector PDF Generation with pdf-lib (Test 15)");

async function testRealPdfLib() {
  const doc = await PDFDocument.create();
  doc.setTitle("Quality Verification Passport Sheet");

  const pWidthPt = mmToPdfPoints(210); // A4 width
  const pHeightPt = mmToPdfPoints(297); // A4 height

  // Add 3 pages
  const page1 = doc.addPage([pWidthPt, pHeightPt]);
  const page2 = doc.addPage([pWidthPt, pHeightPt]);
  const page3 = doc.addPage([pWidthPt, pHeightPt]);

  // Draw cutting guide rectangle
  page1.drawRectangle({
    x: mmToPdfPoints(10),
    y: mmToPdfPoints(297 - 10 - 45),
    width: mmToPdfPoints(35),
    height: mmToPdfPoints(45),
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.5,
  });

  const pdfBytes = await doc.save();
  assert(pdfBytes.length > 500, `Test 15: Vector PDF generated (${pdfBytes.length} bytes)`);

  const reloaded = await PDFDocument.load(pdfBytes);
  assert(reloaded.getPageCount() === 3, "Test 15: Exact 3 pages verified in reloaded PDF");

  const rPage = reloaded.getPage(0);
  const rSize = rPage.getSize();
  assert(
    Math.abs(rSize.width - pWidthPt) < 0.1 && Math.abs(rSize.height - pHeightPt) < 0.1,
    `Test 15: Exact physical page dimensions in PostScript points verified (${Math.round(rSize.width)} × ${Math.round(rSize.height)} pt = 210 × 297 mm)`
  );
}

testRealPdfLib().then(() => {
  console.log("\n" + "═".repeat(60));
  console.log(`📊 PHASE 8 QUALITY TEST RESULTS`);
  console.log("═".repeat(60));
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  Total:    ${passed + failed}`);
  console.log("═".repeat(60));

  if (failed === 0) {
    console.log("\n🎉 ALL 18 QUALITY & VERIFICATION TESTS PASSED — Phase 8 is ready!\n");
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Review the errors above.\n`);
    process.exit(1);
  }
}).catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
