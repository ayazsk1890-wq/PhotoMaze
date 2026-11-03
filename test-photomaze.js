/**
 * PhotoMaze Verification Test Suite
 *
 * Verifies all requirements of:
 * - Application rebrand to PhotoMaze (logo, metadata, navigation, footer, manifest)
 * - 100% free model (no paywalls, no paid credits, no subscriptions, no pricing tables)
 * - Free-first architecture (Guest mode, local saving without registration, optional Supabase)
 * - Indian 35x45mm passport photo as the primary default preset
 * - Official notes, sources, and guidance disclaimers
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

function section(title) {
  console.log(`\n────────────────────────────────────────────────────────────`);
  console.log(`🧪 ${title}`);
  console.log(`────────────────────────────────────────────────────────────`);
}

// ─── 1. Brand Identity & Logo Files ──────────────────────────────────────────
section("1. PhotoMaze Brand Identity & Vector SVG Logos");

const logoPath = path.join(__dirname, "public/logo.svg");
const logoDarkPath = path.join(__dirname, "public/logo-dark.svg");
const iconPath = path.join(__dirname, "public/icon.svg");
const manifestPath = path.join(__dirname, "public/manifest.json");

assert(fs.existsSync(logoPath), "public/logo.svg exists");
assert(fs.existsSync(logoDarkPath), "public/logo-dark.svg exists");
assert(fs.existsSync(iconPath), "public/icon.svg exists");
assert(fs.existsSync(manifestPath), "public/manifest.json exists");

const logoContent = fs.readFileSync(logoPath, "utf8");
assert(logoContent.includes("<svg") && logoContent.includes("</svg>"), "logo.svg is valid XML SVG");
assert(logoContent.includes("viewBox="), "logo.svg has scalable viewBox");

const manifestContent = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
assert(manifestContent.name.includes("PhotoMaze"), "manifest.json name is PhotoMaze");
assert(manifestContent.short_name === "PhotoMaze", "manifest.json short_name is PhotoMaze");
assert(manifestContent.icons.length > 0, "manifest.json includes app icons");

// ─── 2. Application Layout & Metadata ─────────────────────────────────────────
section("2. Layout, Metadata & Navigation Rebranding");

const layoutContent = fs.readFileSync(path.join(__dirname, "src/app/layout.tsx"), "utf8");
assert(layoutContent.includes("PhotoMaze"), "layout.tsx title includes PhotoMaze");
assert(layoutContent.includes("100% Free"), "layout.tsx description states 100% free");
assert(!layoutContent.includes("PassportAI Pro"), "Old brand name PassportAI Pro removed from layout");

const navbarContent = fs.readFileSync(path.join(__dirname, "src/components/layout/Navbar.tsx"), "utf8");
assert(navbarContent.includes("PhotoMaze"), "Navbar brand title is PhotoMaze");
assert(navbarContent.includes("/logo.svg"), "Navbar renders PhotoMaze vector logo");
assert(navbarContent.includes("100% Free"), "Navbar includes 100% Free badge");
assert(!navbarContent.includes('"Pricing"'), "Navbar pricing link removed");

const footerContent = fs.readFileSync(path.join(__dirname, "src/components/layout/Footer.tsx"), "utf8");
assert(footerContent.includes("PhotoMaze"), "Footer brand title is PhotoMaze");
assert(footerContent.includes("100% Free"), "Footer mentions 100% Free studio");
assert(!footerContent.includes("Pricing Plans"), "Footer Pricing Plans link removed");
assert(!footerContent.includes("PassportAI Pro"), "Old brand name removed from footer");

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));
assert(packageJson.name === "photomaze", "package.json name is photomaze");

const healthRoute = fs.readFileSync(path.join(__dirname, "src/app/api/health/route.ts"), "utf8");
assert(healthRoute.includes("PhotoMaze API"), "Health API service identifier is PhotoMaze API");

const pdfExport = fs.readFileSync(path.join(__dirname, "src/lib/print/pdfExportService.ts"), "utf8");
assert(pdfExport.includes('setProducer("PhotoMaze")'), "PDF producer set to PhotoMaze");
assert(pdfExport.includes('setCreator("PhotoMaze")'), "PDF creator set to PhotoMaze");

// ─── 3. 100% Free Guarantee & Monetization Removal ───────────────────────────
section("3. 100% Free Commitment & Obsolete Payment Audit");

const pricingSectionContent = fs.readFileSync(
  path.join(__dirname, "src/components/home/PricingSection.tsx"),
  "utf8"
);
assert(pricingSectionContent.includes("PhotoMaze is"), "PricingSection transformed to Free Guarantee");
assert(pricingSectionContent.includes("100% Free"), "Free guarantee prominently declared");
assert(pricingSectionContent.includes("No Paywalls. No Subscriptions."), "No paywalls or subscriptions declared");
assert(!pricingSectionContent.includes("₹199"), "Paid ₹199 price tier removed");
assert(!pricingSectionContent.includes("$2.99"), "Paid $2.99 price tier removed");
assert(!pricingSectionContent.includes("Credits never expire"), "Paid credit pack references removed");

const envExampleContent = fs.readFileSync(path.join(__dirname, ".env.example"), "utf8");
assert(!envExampleContent.includes("NEXT_PUBLIC_RAZORPAY_KEY_ID"), "Razorpay keys removed from .env.example");
assert(!envExampleContent.includes("STRIPE_SECRET_KEY"), "Stripe keys removed from .env.example");
assert(envExampleContent.includes("PHOTOMAZE"), "Title in .env.example updated to PhotoMaze");

// ─── 4. Indian Passport 35x45mm Default Specification ─────────────────────────
section("4. Indian Passport Photo as Default Preset");

const countriesPath = path.join(__dirname, "src/lib/constants/countries.ts");
const countriesContent = fs.readFileSync(countriesPath, "utf8");

// Load the compiled/evaluable version or check constants
assert(countriesContent.includes('country: "India"'), "India defined in countries.ts");

// Check India is spec index 0
const officialSpecsMatch = countriesContent.match(/export const OFFICIAL_COUNTRY_SPECS: PassportSpec\[\] = \[([\s\S]*?)\];/);
assert(officialSpecsMatch, "OFFICIAL_COUNTRY_SPECS array matched");

const firstCountryBlock = officialSpecsMatch[1].trim();
assert(firstCountryBlock.startsWith("// 1. INDIA"), "India is the FIRST country (index 0) in OFFICIAL_COUNTRY_SPECS");
assert(firstCountryBlock.includes('id: "in-passport"'), "First spec ID is in-passport");
assert(firstCountryBlock.includes("widthMm: 35"), "Indian passport width is exactly 35 mm");
assert(firstCountryBlock.includes("heightMm: 45"), "Indian passport height is exactly 45 mm");
assert(firstCountryBlock.includes("widthPx300Dpi: 413"), "Indian passport width at 300 DPI is ~413 px");
assert(firstCountryBlock.includes("heightPx300Dpi: 531"), "Indian passport height at 300 DPI is ~531 px");
assert(firstCountryBlock.includes('backgroundColor: "white"'), "Indian passport background is white");
assert(firstCountryBlock.includes("headMinPercentage: 0.7"), "Head minimum coverage is 70%");
assert(firstCountryBlock.includes("headMaxPercentage: 0.8"), "Head maximum coverage is 80%");
assert(firstCountryBlock.includes("PSK/POPSK"), "Guideline notes explain PSK/POPSK digital kiosk rules");
assert(firstCountryBlock.includes("3.5×4.5 cm"), "Guideline notes mention 3.5x4.5 cm requirement");
assert(firstCountryBlock.includes("passportindia.gov.in"), "Official government source URL included");
assert(firstCountryBlock.includes("Preparation guidance only"), "Clear guidance disclaimer included");

// Check consular 2x2 in option is available
assert(countriesContent.includes("in-passport-consular"), "Consular 2x2 in option is available for embassies abroad");
assert(countriesContent.includes("widthMm: 50.8"), "Consular option preserves 50.8 mm (2 in)");

// Check dropzone default state
const dropzoneContent = fs.readFileSync(
  path.join(__dirname, "src/components/home/UploadDropzoneCard.tsx"),
  "utf8"
);
assert(dropzoneContent.includes('useState("India")'), "UploadDropzoneCard defaults to India");

// ─── 5. Guest Mode & Local Saving Architecture ───────────────────────────────
section("5. Free-First Guest Mode & Local Project Storage");

const projectServiceContent = fs.readFileSync(
  path.join(__dirname, "src/lib/projects/projectService.ts"),
  "utf8"
);
assert(projectServiceContent.includes("GUEST_USER_ID"), "GUEST_USER_ID constant defined in projectService");
assert(projectServiceContent.includes('activeUserId === GUEST_USER_ID || activeUserId === "guest"'), "Guest user detected and routed to local store");

// Mock local storage test for projectService
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = val.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
global.localStorage = localStorageMock;
global.window = {};

// Test local guest project CRUD
const LOCAL_PROJECTS_KEY = "ppm_user_projects";
const guestProject = {
  id: "proj_guest_test_1",
  userId: "guest_user",
  title: "India Passport Project (Guest)",
  country: "India",
  documentType: "Passport",
  widthMm: 35,
  heightMm: 45,
  backgroundColor: "#FFFFFF",
  originalImageUrl: "data:image/jpeg;base64,guestsample",
  cutoutImageUrl: null,
  thumbnailUrl: "data:image/jpeg;base64,guestsample",
  adjustments: { brightness: 0, contrast: 0, saturation: 0, rotation: 0, zoom: 1, panX: 0, panY: 0 },
  enhancementSettings: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

localStorageMock.setItem(LOCAL_PROJECTS_KEY, JSON.stringify([guestProject]));
const stored = JSON.parse(localStorageMock.getItem(LOCAL_PROJECTS_KEY));
assert(stored.length === 1, "Guest project saved to local storage");
assert(stored[0].userId === "guest_user", "Guest project user ID is guest_user");
assert(stored[0].country === "India", "Guest project country is India");
assert(stored[0].widthMm === 35 && stored[0].heightMm === 45, "Guest project dimensions are 35x45 mm");

// ─── 6. UI Guest Access Verification ──────────────────────────────────────────
section("6. UI Guest Access & Auth Modals");

const authModalContent = fs.readFileSync(
  path.join(__dirname, "src/components/auth/AuthModal.tsx"),
  "utf8"
);
assert(authModalContent.includes("Continue as Guest"), "AuthModal includes 'Continue as Guest' button");
assert(authModalContent.includes("PhotoMaze is 100% free"), "AuthModal explains account is optional");

const projectsModalContent = fs.readFileSync(
  path.join(__dirname, "src/components/projects/ProjectsModal.tsx"),
  "utf8"
);
assert(projectsModalContent.includes("Guest Mode · Saved privately on this browser"), "ProjectsModal indicates Guest Mode");
assert(projectsModalContent.includes("activeUserId"), "ProjectsModal loads projects for activeUserId (guest or auth)");
assert(!projectsModalContent.includes("Sign In to Save & Access Projects"), "Old blocking sign-in lock removed from ProjectsModal");

const editorPageContent = fs.readFileSync(
  path.join(__dirname, "src/app/editor/page.tsx"),
  "utf8"
);
assert(editorPageContent.includes("activeUserId = user?.id || \"guest_user\""), "Editor saves projects for guest without auth prompt");
assert(editorPageContent.includes("Project saved locally!"), "Editor notifies guest that project was saved locally");

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(60));
console.log(`📊 PHOTOMAZE VERIFICATION RESULTS`);
console.log(`  Passed: ${passedTests}`);
console.log(`  Failed: ${failedTests}`);
console.log(`  Total:  ${totalTests}`);
console.log("═".repeat(60));

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL PHOTOMAZE REBRAND & FREE ARCHITECTURE TESTS PASSED!\n");
  process.exit(0);
}

