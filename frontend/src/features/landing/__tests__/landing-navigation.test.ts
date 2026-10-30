import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const landingNavbarPath = path.resolve(
  __dirname,
  "../components/navigation/LandingNavbar.tsx",
);
const floatingNavPath = path.resolve(
  __dirname,
  "../components/navigation/FloatingSectionNav.tsx",
);
const headerPath = path.resolve(
  __dirname,
  "../../../components/shared/Header/Header.tsx",
);
const sidebarPath = path.resolve(
  __dirname,
  "../../../components/shared/sidebar/Sidebar.tsx",
);
const landingPagePath = path.resolve(__dirname, "../pages/LandingPage.tsx");
const enLocalePath = path.resolve(
  __dirname,
  "../../../i18n/locales/en/landing.json",
);
const arLocalePath = path.resolve(
  __dirname,
  "../../../i18n/locales/ar/landing.json",
);

describe("Landing Page Navigation & Floating Scroll Navigation", () => {
  it("LandingNavbar must NOT import or render LanguageSwitcher", () => {
    const content = fs.readFileSync(landingNavbarPath, "utf-8");
    assert.strictEqual(
      content.includes("LanguageSwitcher"),
      false,
      "LandingNavbar still references LanguageSwitcher! It must be removed.",
    );
  });

  it("Authenticated Global Header must preserve its own LanguageSwitcher", () => {
    const content = fs.readFileSync(headerPath, "utf-8");
    assert.ok(
      content.includes("LanguageSwitcher"),
      "Global Header must retain its LanguageSwitcher untouched.",
    );
  });

  it("Authenticated Sidebar must remain untouched and preserved", () => {
    const content = fs.readFileSync(sidebarPath, "utf-8");
    assert.ok(
      content.includes("export default function Sidebar"),
      "Sidebar component must remain intact.",
    );
    assert.ok(
      content.includes("start-0"),
      "Sidebar start-0 positioning for RTL/LTR must remain intact.",
    );
  });

  it("LandingNavbar STREN Logo is clickable and scrolls to top on landing without dashboard redirect", () => {
    const content = fs.readFileSync(landingNavbarPath, "utf-8");
    assert.ok(
      content.includes("handleLogoClick"),
      "LandingNavbar logo must have click handler to scroll to top.",
    );
    assert.ok(
      content.includes("scrollTo"),
      "handleLogoClick must scroll to top.",
    );
  });

  it("LandingNavbar provides smooth anchor navigation with active highlighting for all 6 sections", () => {
    const content = fs.readFileSync(landingNavbarPath, "utf-8");
    const requiredAnchors = [
      "platform",
      "coaches",
      "members",
      "how-it-works",
      "features",
      "preview",
    ];

    for (const anchor of requiredAnchors) {
      assert.ok(
        content.includes(`"#${anchor}"`) || content.includes(`'#${anchor}'`),
        `Missing anchor link for #${anchor}`,
      );
    }

    assert.ok(
      content.includes("activeSection"),
      "LandingNavbar must accept and handle activeSection prop.",
    );
    assert.ok(
      content.includes("isActive"),
      "LandingNavbar must dynamically style active section links.",
    );
  });

  it("Landing Page section components have matching IDs and scroll-mt to prevent heading occlusion", () => {
    const sections = [
      {
        file: "../components/hero/HeroSection.tsx",
        id: "hero",
      },
      {
        file: "../components/overview/PlatformOverview.tsx",
        id: "platform",
      },
      {
        file: "../components/coaches/CoachExperienceSection.tsx",
        id: "coaches",
      },
      {
        file: "../components/members/MemberExperienceSection.tsx",
        id: "members",
      },
      {
        file: "../components/how-it-works/HowItWorksSection.tsx",
        id: "how-it-works",
      },
      {
        file: "../components/features/FeaturesInContext.tsx",
        id: "features",
      },
      {
        file: "../components/comparison/DualPerspectiveSection.tsx",
        id: "perspectives",
      },
      {
        file: "../components/showcase/ProductShowcase.tsx",
        id: "preview",
      },
      {
        file: "../components/cta/FinalCTA.tsx",
        id: "cta",
      },
    ];

    for (const section of sections) {
      const fullPath = path.resolve(__dirname, section.file);
      assert.ok(fs.existsSync(fullPath), `Section file not found: ${section.file}`);
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.ok(
        content.includes(`id="${section.id}"`),
        `Section ${section.file} missing id="${section.id}"`,
      );
      assert.ok(
        content.includes("scroll-mt-"),
        `Section ${section.file} missing scroll-mt class for navbar clearance`,
      );
    }
  });

  it("FloatingSectionNav component exists and implements current section detection and back-to-top", () => {
    assert.ok(fs.existsSync(floatingNavPath), "FloatingSectionNav.tsx must exist");
    const content = fs.readFileSync(floatingNavPath, "utf-8");

    // IntersectionObserver detection
    assert.ok(
      content.includes("IntersectionObserver"),
      "FloatingSectionNav must use IntersectionObserver for section detection",
    );

    // Back to top
    assert.ok(
      content.includes("smoothScrollToTop"),
      "FloatingSectionNav must implement smoothScrollToTop",
    );
    assert.ok(
      content.includes("ArrowUp"),
      "FloatingSectionNav must render ArrowUp icon",
    );

    // Sidebar RTL avoidance
    assert.ok(
      content.includes("aside"),
      "FloatingSectionNav must query aside to avoid overlapping the Sidebar",
    );
    assert.ok(
      content.includes("sidebarRightOffset"),
      "FloatingSectionNav must dynamically offset right positioning in RTL",
    );

    // Top fade/hide
    assert.ok(
      content.includes("isAtTop"),
      "FloatingSectionNav must track isAtTop to hide/fade at top of page",
    );
  });

  it("LandingPage renders FloatingSectionNav and coordinates active section with LandingNavbar", () => {
    const content = fs.readFileSync(landingPagePath, "utf-8");
    assert.ok(
      content.includes("FloatingSectionNav"),
      "LandingPage must render FloatingSectionNav",
    );
    assert.ok(
      content.includes("LandingNavbar activeSection={activeSection}"),
      "LandingNavbar must receive activeSection from LandingPage",
    );
  });

  it("Both EN and AR landing.json include floating section navigation translation keys", () => {
    const en = JSON.parse(fs.readFileSync(enLocalePath, "utf-8"));
    const ar = JSON.parse(fs.readFileSync(arLocalePath, "utf-8"));

    assert.ok(en.navbar.floating.backToTop, "Missing English backToTop translation");
    assert.ok(ar.navbar.floating.backToTop, "Missing Arabic backToTop translation");
    assert.ok(en.navbar.floating.currentSection, "Missing English currentSection translation");
    assert.ok(ar.navbar.floating.currentSection, "Missing Arabic currentSection translation");
  });
});
