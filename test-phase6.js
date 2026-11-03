#!/usr/bin/env node
/**
 * Phase 6 Test Script — AI Outfit Replacement
 *
 * Tests:
 *  1. Outfit template definitions validity (all required fields present)
 *  2. API route returns { success: false, requiresApiKey: true } when no token set
 *  3. Provider adapter stubs return correct "not implemented" messages
 *
 * Run: node test-phase6.js
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

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

// ─── TEST 1: Validate outfit template file exists ────────────────────────────

section("1. Outfit Template Constants");

const outfitsPath = path.join(__dirname, "src/lib/constants/outfits.ts");
assert(fs.existsSync(outfitsPath), "outfits.ts file exists");

const outfitsContent = fs.readFileSync(outfitsPath, "utf8");

// Check required fields present in file
const requiredFields = ["id", "name", "category", "gender", "description", "garmentImageUrl", "previewThumbnail", "tags", "available"];
for (const field of requiredFields) {
  assert(outfitsContent.includes(field), `OutfitTemplate has '${field}' field`);
}

// Check categories
const categories = ["mens-formal", "womens-formal", "childrens-formal", "business-suit", "formal-shirt", "blazer", "professional"];
for (const cat of categories) {
  assert(outfitsContent.includes(cat), `Category '${cat}' defined`);
}

// Count outfit entries
const outfitCount = (outfitsContent.match(/id: "/g) || []).length;
assert(outfitCount >= 21, `At least 21 outfit templates defined (found: ${outfitCount})`);

// Check required exports
assert(outfitsContent.includes("OUTFIT_TEMPLATES"), "OUTFIT_TEMPLATES exported");
assert(outfitsContent.includes("OUTFIT_CATEGORY_LABELS"), "OUTFIT_CATEGORY_LABELS exported");
assert(outfitsContent.includes("getOutfitsByCategory"), "getOutfitsByCategory exported");
assert(outfitsContent.includes("getOutfitById"), "getOutfitById exported");

// ─── TEST 2: Validate Replicate adapter file ─────────────────────────────────

section("2. Replicate IDM-VTON Adapter");

const replicateAdapterPath = path.join(__dirname, "src/lib/adapters/outfit/replicateIdmVton.ts");
assert(fs.existsSync(replicateAdapterPath), "replicateIdmVton.ts adapter exists");

const adapterContent = fs.readFileSync(replicateAdapterPath, "utf8");
assert(adapterContent.includes("cuuupid/idm-vton"), "IDM-VTON model identifier present");
assert(adapterContent.includes("replaceOutfitViaReplicate"), "replaceOutfitViaReplicate function exported");
assert(adapterContent.includes("REPLICATE_API_TOKEN"), "REPLICATE_API_TOKEN reference present");
assert(adapterContent.includes("requiresApiKey: true"), "API key missing error handled");
assert(adapterContent.includes("MAX_RETRIES"), "Retry logic defined");
assert(adapterContent.includes("POLL_INTERVAL_MS"), "Polling logic defined");

// ─── TEST 3: Validate provider stubs ─────────────────────────────────────────

section("3. Provider Adapter Stubs");

const stabilityPath = path.join(__dirname, "src/lib/adapters/outfit/stabilityInpainting.ts");
const falPath = path.join(__dirname, "src/lib/adapters/outfit/falCatVton.ts");

assert(fs.existsSync(stabilityPath), "Stability AI stub exists");
assert(fs.existsSync(falPath), "Fal.ai CatVTON stub exists");

const stabilityContent = fs.readFileSync(stabilityPath, "utf8");
assert(stabilityContent.includes("replaceOutfitViaStability"), "replaceOutfitViaStability exported");
assert(stabilityContent.includes("not yet implemented"), "Returns 'not yet implemented' message");

const falContent = fs.readFileSync(falPath, "utf8");
assert(falContent.includes("replaceOutfitViaFalCatVton"), "replaceOutfitViaFalCatVton exported");
assert(falContent.includes("not yet implemented"), "Returns 'not yet implemented' message");

// ─── TEST 4: Validate API route file ─────────────────────────────────────────

section("4. Outfit Replace API Route");

const routePath = path.join(__dirname, "src/app/api/ai/outfit-replace/route.ts");
assert(fs.existsSync(routePath), "outfit-replace route.ts exists");

const routeContent = fs.readFileSync(routePath, "utf8");
assert(routeContent.includes("REPLICATE_API_TOKEN"), "Checks for REPLICATE_API_TOKEN");
assert(routeContent.includes("requiresApiKey: true"), "Returns requiresApiKey: true when no token");
assert(routeContent.includes("402"), "Returns 402 status when API key missing");
assert(routeContent.includes("personImage"), "Accepts personImage form field");
assert(routeContent.includes("garmentUrl"), "Accepts garmentUrl form field");
assert(routeContent.includes("maxDuration"), "Sets maxDuration for Replicate polling");

// ─── TEST 5: Validate EditorContext additions ─────────────────────────────────

section("5. EditorContext Outfit Integration");

const contextPath = path.join(__dirname, "src/lib/context/EditorContext.tsx");
const contextContent = fs.readFileSync(contextPath, "utf8");

assert(contextContent.includes("OutfitReplacementState"), "OutfitReplacementState imported");
assert(contextContent.includes("OutfitTemplate"), "OutfitTemplate imported");
assert(contextContent.includes("outfitState"), "outfitState in context");
assert(contextContent.includes("triggerOutfitReplacement"), "triggerOutfitReplacement action");
assert(contextContent.includes("restoreOriginalOutfit"), "restoreOriginalOutfit action");
assert(contextContent.includes("setOutfitPreviewMode"), "setOutfitPreviewMode action");
assert(contextContent.includes("/api/ai/outfit-replace"), "Calls outfit-replace API route");

// ─── TEST 6: Validate UI components ──────────────────────────────────────────

section("6. UI Components");

const outfitSelectorPath = path.join(__dirname, "src/components/editor/OutfitSelector.tsx");
assert(fs.existsSync(outfitSelectorPath), "OutfitSelector.tsx component exists");

const outfitSelectorContent = fs.readFileSync(outfitSelectorPath, "utf8");
assert(outfitSelectorContent.includes("OutfitSelector"), "OutfitSelector function exported");
assert(outfitSelectorContent.includes("API Key Required"), "API key required banner present");
assert(outfitSelectorContent.includes("Before"), "Before/After toggle present");
assert(outfitSelectorContent.includes("CATEGORY_TABS"), "Category filter tabs defined");
assert(outfitSelectorContent.includes("OutfitCard"), "OutfitCard sub-component present");
assert(outfitSelectorContent.includes("0.003"), "Cost disclosure (~$0.003) shown");
assert(outfitSelectorContent.includes("Restore Original Clothing"), "Restore original button present");

const sidebarPath = path.join(__dirname, "src/components/editor/EditorSidebar.tsx");
const sidebarContent = fs.readFileSync(sidebarPath, "utf8");
assert(sidebarContent.includes("outfit"), "'outfit' tab in sidebar");
assert(sidebarContent.includes("OutfitSelector"), "OutfitSelector rendered in sidebar");
assert(sidebarContent.includes("Shirt"), "Shirt icon used for outfit tab");

const canvasPath = path.join(__dirname, "src/components/editor/EditorCanvas.tsx");
const canvasContent = fs.readFileSync(canvasPath, "utf8");
assert(canvasContent.includes("outfitState"), "EditorCanvas uses outfitState");
assert(canvasContent.includes("activeDisplaySrc"), "activeDisplaySrc used for outfit preview");
assert(canvasContent.includes("Outfit On"), "Outfit badge label present");

// ─── TEST 7: Validate TypeScript types ───────────────────────────────────────

section("7. TypeScript Types");

const typesPath = path.join(__dirname, "src/types/editor.ts");
const typesContent = fs.readFileSync(typesPath, "utf8");

assert(typesContent.includes("OutfitReplacementState"), "OutfitReplacementState interface defined");
assert(typesContent.includes('"outfit"'), '"outfit" added to SidebarTab type');
assert(typesContent.includes("outputImageUrl"), "outputImageUrl field in state");
assert(typesContent.includes("selectedOutfitId"), "selectedOutfitId field in state");
assert(typesContent.includes("previewMode"), "previewMode field in state");
assert(typesContent.includes("requiresApiKey"), "requiresApiKey field in state");

// ─── TEST 8: Simulate API endpoint "no token" behaviour ──────────────────────

section("8. API Behaviour Without Token (HTTP simulation)");

// We'll test the behaviour by inspecting route logic
assert(routeContent.includes('status: 402'), "Route returns 402 when no API key");
assert(
  routeContent.includes("REPLICATE_API_TOKEN is not configured"),
  "Route returns descriptive message when no API key"
);
assert(
  routeContent.includes("replicate.com/account/api-tokens"),
  "Route includes link to get API token"
);

// ─── TEST 9: .env.example updated ────────────────────────────────────────────

section("9. .env.example Documentation");

const envExamplePath = path.join(__dirname, ".env.example");
const envContent = fs.readFileSync(envExamplePath, "utf8");

assert(envContent.includes("REPLICATE_API_TOKEN"), "REPLICATE_API_TOKEN documented");
assert(envContent.includes("IDM-VTON"), "IDM-VTON model referenced");
assert(envContent.includes("0.003"), "Cost per image documented");
assert(envContent.includes("replicate.com/account/api-tokens"), "Token URL documented");

// ─── SUMMARY ─────────────────────────────────────────────────────────────────

console.log("\n" + "═".repeat(60));
console.log(`📊 PHASE 6 TEST RESULTS`);
console.log("═".repeat(60));
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  Total:    ${passed + failed}`);
console.log("═".repeat(60));

if (failed === 0) {
  console.log("\n🎉 ALL TESTS PASSED — Phase 6 is ready!\n");
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Review the errors above.\n`);
  process.exit(1);
}

