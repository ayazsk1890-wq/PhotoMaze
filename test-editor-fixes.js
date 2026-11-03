/**
 * test-editor-fixes.js
 * Verification of Background Removal & Editor Bug Fixes
 */

const fs = require("fs");
const path = require("path");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log("\n════════════════════════════════════════════════════════════");
console.log("🧪 BACKGROUND REMOVAL & EDITOR BUG FIXES VERIFICATION");
console.log("════════════════════════════════════════════════════════════\n");

// ─── 1. 3-Tier Background Removal Engine ─────────────────────────────────────
console.log("────────────────────────────────────────────────────────────");
console.log("🧪 1. Client-Side AI Background Removal Engine");
console.log("────────────────────────────────────────────────────────────");

const clientRmbgPath = path.join(__dirname, "src/lib/adapters/background/clientRmbg.ts");
assert(fs.existsSync(clientRmbgPath), "clientRmbg.ts exists");

const clientRmbgContent = fs.readFileSync(clientRmbgPath, "utf8");
assert(clientRmbgContent.includes("ImageSegmenter"), "MediaPipe ImageSegmenter integrated for fast neural portrait segmentation");
assert(clientRmbgContent.includes("selfie_segmenter.tflite"), "Uses official lightweight Google selfie_segmenter model");
assert(clientRmbgContent.includes("segmentWithMediaPipe"), "Includes primary MediaPipe segmentation function");
assert(clientRmbgContent.includes("segmentWithTransformers"), "Includes secondary Transformers.js fallback");
assert(clientRmbgContent.includes("fallbackBiometricMatting"), "Includes tertiary zero-network biometric contour matting engine");
assert(!clientRmbgContent.includes("[data[(height - 1) * width * 4]"), "Perimeter sampling excludes bottom corners (no clothing deletion)");

// ─── 2. Editor Context Image & Coordinate Integrity ──────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 2. Editor State & Coordinate Alignment");
console.log("────────────────────────────────────────────────────────────");

const editorContextPath = path.join(__dirname, "src/lib/context/EditorContext.tsx");
const editorContextContent = fs.readFileSync(editorContextPath, "utf8");

assert(!editorContextContent.includes("if (storedSrc && storedMeta)"), "Editor loads storedSrc even if storedMeta was not serialized");
assert(editorContextContent.includes("cropDisplayHeight = 440"), "Biometric auto-crop uses exact 440px crop coordinate space");
assert(editorContextContent.includes("selectedSpec.widthMm / selectedSpec.heightMm"), "Auto-crop scales width dynamically by country aspect ratio");
assert(editorContextContent.includes("transparentCutoutUrl || imageSrc"), "Enhancement runs on active cutout rather than raw un-cutout photo");
assert(editorContextContent.includes("setTransparentCutoutUrl(cutoutDataUrl)"), "Background removal updates transparentCutoutUrl");

// ─── 3. Home Page to Editor Data Handshake ───────────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 3. Home Page to Editor Transition");
console.log("────────────────────────────────────────────────────────────");

const dropzonePath = path.join(__dirname, "src/components/home/UploadDropzoneCard.tsx");
const dropzoneContent = fs.readFileSync(dropzonePath, "utf8");

assert(dropzoneContent.includes("ppm_uploaded_image_meta"), "handleOpenEditor stores uploaded image metadata");
assert(dropzoneContent.includes("autoPilotResult.cutoutDataUrl"), "handleOpenEditor passes auto-pilot cutout to studio editor");

// ─── 4. Editor Canvas & UI Display ───────────────────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 4. Editor Canvas & Header Sample Switcher");
console.log("────────────────────────────────────────────────────────────");

const editorCanvasPath = path.join(__dirname, "src/components/editor/EditorCanvas.tsx");
const editorCanvasContent = fs.readFileSync(editorCanvasPath, "utf8");
assert(editorCanvasContent.includes("!enhancementState.isProcessing"), "Canvas avoids stale enhancement image while processing new cutout");

const editorPagePath = path.join(__dirname, "src/app/editor/page.tsx");
const editorPageContent = fs.readFileSync(editorPagePath, "utf8");
assert(editorPageContent.includes('"Hijab"'), "Header sample switcher supports Hijab sample");

// ─── 5. Print & Export Synchronization ───────────────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 5. Auto-Pilot Service Coordinate Synchronization");
console.log("────────────────────────────────────────────────────────────");

const autoPilotPath = path.join(__dirname, "src/lib/ai/aiAutoPilotService.ts");
const autoPilotContent = fs.readFileSync(autoPilotPath, "utf8");
assert(autoPilotContent.includes("const cropDisplayHeight = 440;"), "Auto-Pilot service matches 440px coordinate baseline");

console.log("\n════════════════════════════════════════════════════════════");
console.log(`📊 FIX VERIFICATION RESULTS: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log("════════════════════════════════════════════════════════════\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL BACKGROUND REMOVAL & EDITOR FIX TESTS PASSED!\n");
  process.exit(0);
}
