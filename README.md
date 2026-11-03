# AI Passport Photo Maker

> Professional AI-powered Passport, Visa, and ID Photo SaaS web application inspired by Cutout.pro. Built with Next.js 14, TypeScript, Tailwind CSS, Sharp, Supabase, and modular AI provider adapters.

---

## 🌟 Overview & Key Capabilities

- **Biometric Standard Compliance:** Automatically follows ICAO Document 9303 & ISO/IEC 19794-5 standards for head-to-chin ratios, eye level alignment, and canvas margins.
- **AI Background Processing:** Instant background removal and replacement with compliant solid colors (White, Off-White, Light Blue, Red, Light Gray).
- **Global Country Presets:** 100+ standard dimension presets (e.g. US 2x2", UK/EU/IN 35x45mm, Canada 50x70mm, China 33x48mm).
- **AI Outfit Changer:** Formal suit, shirt, and uniform replacement for men, women, and children.
- **AI Image Enhancer:** Denoising, smart sharpening, and automatic 300 DPI upscaling for ultra-crisp print quality.
- **Custom Passport Sheet & Bulk Printing Engine:** Arrange any number of copies on standard paper sizes (A4, A5, 4×6, 5×7, 6×8 inches, Letter) with adjustable margins, spacing, and cutting guide lines.
- **Multi-Format Export:** High-res PNG, JPEG (online portal upload-ready under 240 KB), and print-ready PDF.
- **Credit & Billing System:** Integrated with Razorpay (primary for India) and Stripe (international).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Next.js Route Handlers & Server Actions |
| **Image Processing** | Sharp (libvips) 300 DPI engine |
| **Database & Auth** | Supabase PostgreSQL with Row Level Security (RLS) & Supabase Auth |
| **Payments** | Razorpay (India & International) + Stripe (Optional) |
| **AI Adapters** | Modular provider architecture (Photoroom, Replicate, MediaPipe, Sharp) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18.18+ or v20+
- npm v10+

### Installation

1. **Clone or open the repository:**
   ```bash
   cd "Passport Photo Maker"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys in `.env.local`.

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open the Application:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.
   Check API health at [http://localhost:3000/api/health](http://localhost:3000/api/health).

---

## 📋 Controlled Development Phases

1. [x] **Phase 1 – Research, architecture and project setup**
2. [ ] **Phase 2 – Premium website UI, homepage and navigation**
3. [ ] **Phase 3 – Image uploading, preview and basic photo editor**
4. [ ] **Phase 4 – AI background removal and background replacement**
5. [ ] **Phase 5 – Face detection, automatic cropping and country-specific passport dimensions**
6. [ ] **Phase 6 – AI outfit changing and clothing replacement**
7. [ ] **Phase 7 – AI photo enhancement and beautification**
8. [ ] **Phase 8 – Custom passport photo sheet and bulk printing system**
9. [ ] **Phase 9 – Individual and bulk image downloads, PDF export and print optimization**
10. [ ] **Phase 10 – User authentication, accounts and dashboard**
11. [ ] **Phase 11 – Credit system, subscriptions and payment integration**
12. [ ] **Phase 12 – Admin dashboard and management system**
13. [ ] **Phase 13 – Security, performance, testing and bug fixing**
14. [ ] **Phase 14 – Production deployment and final quality assurance**

---

## 📖 Documentation
- [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md): Deep-dive into architecture, algorithms, and schemas.
- [DEVELOPMENT_PROGRESS.md](./DEVELOPMENT_PROGRESS.md): Live phase tracking and changelog.

