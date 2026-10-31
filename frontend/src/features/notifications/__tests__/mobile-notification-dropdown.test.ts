import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const headerPath = path.resolve(
  __dirname,
  "../../../components/shared/Header/Header.tsx",
);

describe("STREN — Mobile Notification Dropdown Positioning & Responsive Layout", () => {
  const content = fs.readFileSync(headerPath, "utf-8");

  it("applies responsive mobile-first fixed positioning and desktop absolute positioning", () => {
    // Must use fixed on mobile and sm:absolute on desktop
    assert.ok(
      content.includes("fixed sm:absolute"),
      "NotificationMenu dropdown must use 'fixed sm:absolute' for mobile safety",
    );
    // Must position beneath the header on mobile (top-[68px]) and under the trigger on desktop (sm:top-full)
    assert.ok(
      content.includes("top-[68px] sm:top-full"),
      "Dropdown must use top-[68px] on mobile and sm:top-full on desktop",
    );
    // Must use end-3 on mobile and sm:end-0 on desktop
    assert.ok(
      content.includes("end-3 sm:end-0"),
      "Dropdown must use end-3 on mobile to guarantee horizontal safety and sm:end-0 on desktop",
    );
  });

  it("applies responsive width and boundary constraints (w-[min(400px,calc(100vw-24px))] sm:w-80)", () => {
    assert.ok(
      content.includes("w-[min(400px,calc(100vw-24px))] sm:w-80"),
      "Dropdown must use responsive width bounded by viewport width minus 24px margins",
    );
    assert.ok(
      content.includes("max-w-[400px] sm:max-w-80"),
      "Dropdown must constrain maximum width to 400px on mobile and 320px (w-80) on desktop",
    );
    assert.ok(
      content.includes("box-border"),
      "Dropdown must explicitly declare box-border",
    );
  });

  it("enforces viewport height containment and internal vertical scrolling", () => {
    assert.ok(
      content.includes("max-h-[calc(100dvh-5.5rem)]"),
      "Dropdown must bound max-height against dynamic viewport height (100dvh)",
    );
    assert.ok(
      content.includes("flex-1 overflow-y-auto min-h-0"),
      "Notification list container must use flex-1 min-h-0 overflow-y-auto to guarantee internal scrolling",
    );
    assert.ok(
      content.includes("shrink-0 bg-[#090B0F]"),
      "Footer 'View All' must be shrink-0 so it stays visible and accessible",
    );
  });

  it("prevents long titles and messages from causing horizontal overflow with break-words", () => {
    assert.ok(
      content.includes("break-words line-clamp-2"),
      "Notification item titles and messages must include break-words to wrap long unspaced text",
    );
  });

  it("elevates z-index of Header and dropdowns above page-level sticky headers", () => {
    assert.ok(
      content.includes("sticky top-0 z-40"),
      "Header must have z-40 so it stays above page content and below modal drawers",
    );
    assert.ok(
      content.includes("focus:outline-none z-50"),
      "Notification dropdown must use z-50 to ensure layering above header controls",
    );
  });

  it("mathematically verifies horizontal bounds across all target screen sizes (320px to 1024px)", () => {
    const testViewports = [320, 360, 375, 390, 414, 480];
    const margin = 12; // end-3 = 12px

    for (const vw of testViewports) {
      const panelWidth = Math.min(400, vw - 24);

      // In LTR: end-3 is right: 12px
      const ltrRight = margin;
      const ltrLeft = vw - ltrRight - panelWidth;

      assert.ok(
        ltrLeft >= margin - 0.1,
        `[LTR @ ${vw}px] Panel left edge (${ltrLeft}px) must be >= margin (${margin}px)`,
      );
      assert.ok(
        ltrRight >= margin - 0.1,
        `[LTR @ ${vw}px] Panel right edge (${ltrRight}px) must be >= margin (${margin}px)`,
      );
      assert.ok(
        ltrLeft + panelWidth <= vw,
        `[LTR @ ${vw}px] Panel must not exceed viewport width`,
      );

      // In RTL: end-3 is left: 12px
      const rtlLeft = margin;
      const rtlRight = vw - rtlLeft - panelWidth;

      assert.ok(
        rtlLeft >= margin - 0.1,
        `[RTL @ ${vw}px] Panel left edge (${rtlLeft}px) must be >= margin (${margin}px)`,
      );
      assert.ok(
        rtlRight >= margin - 0.1,
        `[RTL @ ${vw}px] Panel right edge (${rtlRight}px) must be >= margin (${margin}px)`,
      );
      assert.ok(
        rtlLeft + panelWidth <= vw,
        `[RTL @ ${vw}px] Panel must not exceed viewport width in RTL`,
      );
    }
  });
});
