/**
 * test-autopilot.js
 * Automated Verification Suite for PhotoMaze 1-Click AI Auto-Pilot Pipeline
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
console.log("🧪 PHOTOMAZE 1-CLICK AI AUTO-PILOT TEST SUITE");
console.log("════════════════════════════════════════════════════════════\n");

// ─── 1. Persona Definitions & Rules ──────────────────────────────────────────
console.log("────────────────────────────────────────────────────────────");
console.log("🧪 1. Persona Configuration & ICAO Specifications");
console.log("────────────────────────────────────────────────────────────");

const personasFilePath = path.join(__dirname, "src/lib/constants/personas.ts");
assert(fs.existsSync(personasFilePath), "personas.ts exists");

const personasContent = fs.readFileSync(personasFilePath, "utf8");
assert(personasContent.includes('"male"'), "Adult Male persona defined");
assert(personasContent.includes('"female"'), "Adult Female persona defined");
assert(personasContent.includes('"child"'), "Child / Infant persona defined");
assert(personasContent.includes('"hijab"'), "Woman wearing Hijab persona defined");

assert(personasContent.includes("sample-man.jpg"), "Male references local sample-man.jpg");
assert(personasContent.includes("sample-woman.jpg"), "Female references local sample-woman.jpg");
assert(personasContent.includes("sample-child.jpg"), "Child references local sample-child.jpg");
assert(personasContent.includes("sample-hijab.jpg"), "Hijab references local sample-hijab.jpg");

assert(personasContent.includes("Doc 9303"), "Hijab compliance references ICAO Doc 9303");
assert(personasContent.includes("facial oval"), "Hijab compliance notes facial oval requirement");
assert(personasContent.includes("no shadows") || personasContent.includes("No shadows"), "Hijab compliance notes no shadows rule");

// ─── 2. Local Sample Files on Disk ───────────────────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 2. Local Asset Integrity on Disk");
console.log("────────────────────────────────────────────────────────────");

assert(fs.existsSync(path.join(__dirname, "public/samples/sample-man.jpg")), "sample-man.jpg exists on disk");
assert(fs.existsSync(path.join(__dirname, "public/samples/sample-woman.jpg")), "sample-woman.jpg exists on disk");
assert(fs.existsSync(path.join(__dirname, "public/samples/sample-child.jpg")), "sample-child.jpg exists on disk");
assert(fs.existsSync(path.join(__dirname, "public/samples/sample-hijab.jpg")), "sample-hijab.jpg exists on disk");

const clientValidationContent = fs.readFileSync(path.join(__dirname, "src/lib/image/clientValidation.ts"), "utf8");
assert(clientValidationContent.includes('"hijab"'), "DEMO_SAMPLE_PHOTOS includes hijab sample");

// ─── 3. AI Auto-Pilot Service Engine ─────────────────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 3. AI Auto-Pilot Orchestration Service");
console.log("────────────────────────────────────────────────────────────");

const autoPilotServicePath = path.join(__dirname, "src/lib/ai/aiAutoPilotService.ts");
assert(fs.existsSync(autoPilotServicePath), "aiAutoPilotService.ts exists");

const autoPilotContent = fs.readFileSync(autoPilotServicePath, "utf8");
assert(autoPilotContent.includes("runFullAiAutoPilot"), "runFullAiAutoPilot function exported");
assert(autoPilotContent.includes("detectFacesInImage"), "Auto-Pilot calls face detection");
assert(autoPilotContent.includes("computeBiometricAutoCrop"), "Auto-Pilot calls biometric crop calculation");
assert(autoPilotContent.includes("removeBackgroundBrowser"), "Auto-Pilot calls background isolation");
assert(autoPilotContent.includes("enhanceImageData"), "Auto-Pilot applies calibrated portrait enhancement");
assert(autoPilotContent.includes("evaluateBiometricCompliance"), "Auto-Pilot executes compliance audit");
assert(autoPilotContent.includes("calculatePrintLayout"), "Auto-Pilot calculates 4x6 print sheet");
assert(autoPilotContent.includes("renderPrintSheetToCanvas"), "Auto-Pilot renders 4x6 print sheet");
assert(autoPilotContent.includes("#FFFFFF"), "Pure white background enforced for passport compliance");

// ─── 4. Editor Context Integration ───────────────────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 4. Editor Context Auto-Pilot Integration");
console.log("────────────────────────────────────────────────────────────");

const editorContextContent = fs.readFileSync(path.join(__dirname, "src/lib/context/EditorContext.tsx"), "utf8");
assert(editorContextContent.includes("activePersona"), "EditorContext exposes activePersona");
assert(editorContextContent.includes("setActivePersona"), "EditorContext exposes setActivePersona");
assert(editorContextContent.includes("autoPilotState"), "EditorContext exposes autoPilotState");
assert(editorContextContent.includes("runAiAutoPilot"), "EditorContext exposes runAiAutoPilot");
assert(editorContextContent.includes("ppm_selected_persona"), "EditorContext preserves persona in sessionStorage");

// ─── 5. UI Integration (Dropzone Card & Sidebar) ────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 5. UI Components & 1-Click Experience");
console.log("────────────────────────────────────────────────────────────");

const dropzoneContent = fs.readFileSync(path.join(__dirname, "src/components/home/UploadDropzoneCard.tsx"), "utf8");
assert(dropzoneContent.includes("PERSONA_LIST"), "UploadDropzoneCard renders PERSONA_LIST");
assert(dropzoneContent.includes("handleTriggerAutoPilot"), "UploadDropzoneCard has 1-Click AutoPilot trigger");
assert(dropzoneContent.includes("isAutoPilotRunning"), "UploadDropzoneCard renders animated progress modal");
assert(dropzoneContent.includes("showResultModal"), "UploadDropzoneCard renders instant result modal");
assert(dropzoneContent.includes("handleDownloadSinglePhoto"), "Instant result modal has single photo download");
assert(dropzoneContent.includes("handleDownloadPrintSheet"), "Instant result modal has print sheet download");
assert(dropzoneContent.includes("handleDownloadPdf"), "Instant result modal has PDF download");

const sidebarContent = fs.readFileSync(path.join(__dirname, "src/components/editor/EditorSidebar.tsx"), "utf8");
assert(sidebarContent.includes("AI Auto-Pilot Profile:"), "EditorSidebar includes AI Auto-Pilot Profile toolbar");
assert(sidebarContent.includes("Run 1-Click AI Auto-Pilot"), "EditorSidebar includes 1-Click Auto-Pilot button");

// ─── Results ─────────────────────────────────────────────────────────────────
console.log("\n════════════════════════════════════════════════════════════");
console.log(`📊 AUTO-PILOT TEST RESULTS: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log("════════════════════════════════════════════════════════════\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL 1-CLICK AI AUTO-PILOT TESTS PASSED!\n");
  process.exit(0);
}
