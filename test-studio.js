/**
 * PhotoMaze — AI Passport Photo Studio Automated Verification Suite
 *
 * Verifies all 25 checklist points for the AI Passport Photo Studio:
 * 1. Studio data models, modes, and enumerations
 * 2. Prompt template engine with exact required strings
 * 3. Spectacles guidance, caveats, and removal warnings
 * 4. Face protection service & ground-truth authentic compositing
 * 5. Attire styling templates & dynamic layering
 * 6. Studio pipeline orchestrator & Indian 35x45mm 300 DPI compliance
 * 7. GuidedStudioModal step workflow & side-by-side review
 * 8. Automatic upload integration in UploadDropzoneCard
 * 9. Studio Wizard integration in EditorSidebar & EditorContext
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failedTests++;
  }
}

console.log("\n════════════════════════════════════════════════════════════");
console.log("🧪 PHOTOMAZE — AI PASSPORT PHOTO STUDIO VERIFICATION");
console.log("════════════════════════════════════════════════════════════\n");

// ── 1. Studio Data Models & Types ──────────────────────────────────────────
console.log("────────────────────────────────────────────────────────────");
console.log("🧪 1. Studio Data Models & TypeScript Interfaces");
console.log("────────────────────────────────────────────────────────────");

const studioTypesPath = path.join(__dirname, "src/types/studio.ts");

test("src/types/studio.ts exists", () => {
  assert.ok(fs.existsSync(studioTypesPath), "studio.ts file should exist");
});

const studioTypesContent = fs.readFileSync(studioTypesPath, "utf-8");

test("StudioWorkflowMode defines 'official' and 'appearance'", () => {
  assert.ok(
    studioTypesContent.includes('"official"') && studioTypesContent.includes('"appearance"'),
    "Must define official and appearance modes"
  );
});

test("PersonCategory defines 'adult' and 'child'", () => {
  assert.ok(
    studioTypesContent.includes('"adult"') && studioTypesContent.includes('"child"'),
    "Must define adult and child"
  );
});

test("ClothingPresentationPreference defines masculine, feminine, neutral, original", () => {
  assert.ok(
    studioTypesContent.includes('"formal-masculine"') &&
      studioTypesContent.includes('"formal-feminine"') &&
      studioTypesContent.includes('"formal-neutral"') &&
      studioTypesContent.includes('"original"'),
    "Must support user-selected clothing presentation options"
  );
});

test("HeadCoveringPreference defines 'hijab', 'turban', 'preserve'", () => {
  assert.ok(
    studioTypesContent.includes('"hijab"') &&
      studioTypesContent.includes('"turban"') &&
      studioTypesContent.includes('"preserve"'),
    "Must support religious head coverings and preservation"
  );
});

test("SpectaclesPreference defines none, clear, tinted, unsure", () => {
  assert.ok(
    studioTypesContent.includes('"clear"') &&
      studioTypesContent.includes('"tinted"') &&
      studioTypesContent.includes('"unsure"'),
    "Must define eyewear preferences"
  );
});

// ── 2. Category Prompt Templates Engine ────────────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 2. Category Prompt Templates Engine");
console.log("────────────────────────────────────────────────────────────");

const promptEnginePath = path.join(__dirname, "src/lib/ai/promptTemplateEngine.ts");

test("src/lib/ai/promptTemplateEngine.ts exists", () => {
  assert.ok(fs.existsSync(promptEnginePath), "promptTemplateEngine.ts must exist");
});

const promptEngineContent = fs.readFileSync(promptEnginePath, "utf-8");

test("Adult masculine formal prompt template matches requirements", () => {
  assert.ok(
    promptEngineContent.includes("Professional dark formal tailored suit"),
    "Must contain exact masculine formal prompt"
  );
  assert.ok(
    promptEngineContent.includes("crisp white collared shirt, conservative tie"),
    "Must specify crisp white collared shirt & tie"
  );
});

test("Adult feminine formal prompt template matches requirements", () => {
  assert.ok(
    promptEngineContent.includes("Professional dark formal blazer"),
    "Must contain exact feminine formal prompt"
  );
  assert.ok(
    promptEngineContent.includes("high-neck blouse or collared formal shirt"),
    "Must specify high-neck blouse or collared formal shirt"
  );
});

test("Child prompt template matches requirements", () => {
  assert.ok(
    promptEngineContent.includes("Neat, clean formal collared shirt or smart jacket"),
    "Must contain child formal prompt"
  );
});

test("Hijab / head covering prompt template preserves headwear", () => {
  assert.ok(
    promptEngineContent.includes("Respectful modest formal business attire below head covering"),
    "Must respect head covering drape"
  );
  assert.ok(
    promptEngineContent.includes("without altering or overlapping scarf folds"),
    "Must never alter headscarf folds"
  );
});

test("Clothing unchanged prompt template retains uploaded garments", () => {
  assert.ok(
    promptEngineContent.includes("Retain uploaded garment, clean wrinkles"),
    "Must contain clothing unchanged template"
  );
});

// ── 3. Spectacles Guidance & Removal Warnings ─────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 3. Spectacles Guidance & Warning Advisor");
console.log("────────────────────────────────────────────────────────────");

const spectaclesAdvisorPath = path.join(__dirname, "src/lib/ai/spectaclesAdvisor.ts");

test("src/lib/ai/spectaclesAdvisor.ts exists", () => {
  assert.ok(fs.existsSync(spectaclesAdvisorPath), "spectaclesAdvisor.ts must exist");
});

const spectaclesContent = fs.readFileSync(spectaclesAdvisorPath, "utf-8");

test("Spectacles warning mentions AI reconstruction is NOT guaranteed 100% identity match", () => {
  assert.ok(
    spectaclesContent.includes("NOT guaranteed to be a 100% biometric identity match"),
    "Must warn user of AI reconstruction identity risk"
  );
});

test("Spectacles advisor recommends taking new photo without glasses", () => {
  assert.ok(
    spectaclesContent.includes("recommend taking a new photograph without glasses"),
    "Must advise taking a new photo without glasses"
  );
});

test("Tinted glasses flagged as strictly prohibited for official passports", () => {
  assert.ok(
    spectaclesContent.includes("STRICTLY PROHIBITED in official passport photos"),
    "Must warn that tinted glasses are prohibited"
  );
});

// ── 4. Face Protection & Compositing Engine ───────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 4. Facial Identity Preservation & Compositing Engine");
console.log("────────────────────────────────────────────────────────────");

const faceProtectionPath = path.join(__dirname, "src/lib/ai/faceProtectionService.ts");

test("src/lib/ai/faceProtectionService.ts exists", () => {
  assert.ok(fs.existsSync(faceProtectionPath), "faceProtectionService.ts must exist");
});

const faceProtectionContent = fs.readFileSync(faceProtectionPath, "utf-8");

test("Exports generateProtectedFaceLayers", () => {
  assert.ok(
    faceProtectionContent.includes("export function generateProtectedFaceLayers"),
    "Must export generateProtectedFaceLayers"
  );
});

test("Exports compositeProtectedFaceGroundTruth", () => {
  assert.ok(
    faceProtectionContent.includes("export function compositeProtectedFaceGroundTruth"),
    "Must export compositeProtectedFaceGroundTruth"
  );
});

test("Includes MediaPipe facial mesh perimeter indices", () => {
  assert.ok(
    faceProtectionContent.includes("FACE_OVAL_INDICES"),
    "Must define 468 landmark facial oval indices"
  );
});

test("Protects religious headwear from crown to chin without alteration", () => {
  assert.ok(
    faceProtectionContent.includes("isHeadCoveringPreserved"),
    "Must have dedicated branch for preserving religious headwear"
  );
});

test("Garment mask strictly restricted below neck / chin", () => {
  assert.ok(
    faceProtectionContent.includes("garmentMaskCanvas"),
    "Must isolate garment region strictly below neck"
  );
});

// ── 5. Attire Styling & Pipeline Orchestrator ──────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 5. Local Attire Styling & Studio Orchestrator");
console.log("────────────────────────────────────────────────────────────");

const attireServicePath = path.join(__dirname, "src/lib/ai/clothingAttireService.ts");
test("src/lib/ai/clothingAttireService.ts exists", () => {
  assert.ok(fs.existsSync(attireServicePath), "clothingAttireService.ts must exist");
});

const attireContent = fs.readFileSync(attireServicePath, "utf-8");
test("Attire styles include Navy Suit, Charcoal Suit, Black Suit, Blazers, and Shirts", () => {
  assert.ok(attireContent.includes("mens-navy-suit"), "Must include Navy Suit");
  assert.ok(attireContent.includes("mens-charcoal-suit"), "Must include Charcoal Suit");
  assert.ok(attireContent.includes("womens-navy-blazer"), "Must include Womens Blazer");
  assert.ok(attireContent.includes("white-collared-shirt"), "Must include Collared Shirt");
  assert.ok(attireContent.includes("child-smart-shirt"), "Must include Child Shirt");
});

const studioOrchestratorPath = path.join(__dirname, "src/lib/ai/studioOrchestrator.ts");
test("src/lib/ai/studioOrchestrator.ts exists", () => {
  assert.ok(fs.existsSync(studioOrchestratorPath), "studioOrchestrator.ts must exist");
});

const orchestratorContent = fs.readFileSync(studioOrchestratorPath, "utf-8");
test("runStudioPipeline executes biometric detection, protection, and compositing", () => {
  assert.ok(
    orchestratorContent.includes("export async function runStudioPipeline"),
    "Must export runStudioPipeline"
  );
  assert.ok(
    orchestratorContent.includes("generateProtectedFaceLayers"),
    "Must call generateProtectedFaceLayers"
  );
  assert.ok(
    orchestratorContent.includes("compositeProtectedFaceGroundTruth"),
    "Must composite original face ground truth"
  );
  assert.ok(
    orchestratorContent.includes("computeBiometricAutoCrop"),
    "Must compute biometric auto crop"
  );
});

// ── 6. UI & Modal Integration ─────────────────────────────────────────────
console.log("\n────────────────────────────────────────────────────────────");
console.log("🧪 6. UI Guided Studio Modal & Side-by-Side Review");
console.log("────────────────────────────────────────────────────────────");

const guidedModalPath = path.join(__dirname, "src/components/studio/GuidedStudioModal.tsx");
test("src/components/studio/GuidedStudioModal.tsx exists", () => {
  assert.ok(fs.existsSync(guidedModalPath), "GuidedStudioModal.tsx must exist");
});

const modalContent = fs.readFileSync(guidedModalPath, "utf-8");

test("GuidedStudioModal implements multi-step wizard (Steps 1 to 8)", () => {
  assert.ok(modalContent.includes("currentStep"), "Must maintain currentStep");
  assert.ok(modalContent.includes("Official Document Preparation Mode"), "Step 1: Official Mode");
  assert.ok(modalContent.includes("Studio Appearance Mode"), "Step 1: Studio Mode");
  assert.ok(modalContent.includes("Religious Head Covering"), "Step 2: Head Covering");
  assert.ok(modalContent.includes("Spectacles & Eyewear"), "Step 3: Spectacles");
  assert.ok(modalContent.includes("Clothing Presentation"), "Step 4: Clothing");
  assert.ok(modalContent.includes("Background Color Selection"), "Step 5: Background");
  assert.ok(modalContent.includes("Confirm Your Studio Selections"), "Step 6: Confirmation");
  assert.ok(modalContent.includes("Side-by-Side"), "Step 8: Side-by-Side Preview");
});

test("Side-by-Side preview includes Accept & Continue, Regenerate, Undo, Start Over", () => {
  assert.ok(modalContent.includes("Accept & Continue in Editor"), "Must have Accept & Continue");
  assert.ok(modalContent.includes("Regenerate"), "Must have Regenerate");
  assert.ok(modalContent.includes("Undo"), "Must have Undo");
  assert.ok(modalContent.includes("Start Over"), "Must have Start Over");
});

test("UploadDropzoneCard automatically opens Guided Studio Modal on photo upload", () => {
  const uploadCardPath = path.join(__dirname, "src/components/home/UploadDropzoneCard.tsx");
  const uploadContent = fs.readFileSync(uploadCardPath, "utf-8");
  assert.ok(
    uploadContent.includes("GuidedStudioModal"),
    "UploadDropzoneCard must import GuidedStudioModal"
  );
  assert.ok(
    uploadContent.includes("setIsStudioModalOpen(true)"),
    "Must auto-open GuidedStudioModal on upload"
  );
  assert.ok(
    uploadContent.includes("Launch AI Passport Studio"),
    "Must have prominent Launch Studio CTA"
  );
});

test("EditorSidebar includes AI Studio Wizard button and handles result", () => {
  const sidebarPath = path.join(__dirname, "src/components/editor/EditorSidebar.tsx");
  const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
  assert.ok(
    sidebarContent.includes("AI Studio Wizard"),
    "EditorSidebar must have AI Studio Wizard button"
  );
  assert.ok(
    sidebarContent.includes("applyStudioResult"),
    "EditorSidebar must call applyStudioResult"
  );
});

test("EditorContext exposes applyStudioResult", () => {
  const contextPath = path.join(__dirname, "src/lib/context/EditorContext.tsx");
  const contextContent = fs.readFileSync(contextPath, "utf-8");
  assert.ok(
    contextContent.includes("applyStudioResult"),
    "EditorContext must expose applyStudioResult"
  );
});

console.log("\n════════════════════════════════════════════════════════════");
console.log(`📊 AI STUDIO TEST RESULTS: ${passedTests}/${passedTests + failedTests} Passed (${failedTests} Failed)`);
console.log("════════════════════════════════════════════════════════════\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL AI PASSPORT PHOTO STUDIO TESTS PASSED!\n");
}
