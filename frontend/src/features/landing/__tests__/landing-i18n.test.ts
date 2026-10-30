import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, "../../../i18n/locales");
const enPath = path.join(localesDir, "en", "landing.json");
const arPath = path.join(localesDir, "ar", "landing.json");

function getLeafKeys(obj: Record<string, any>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (item && typeof item === "object") {
          keys = keys.concat(getLeafKeys(item, `${fullPath}[${idx}]`));
        } else {
          keys.push(`${fullPath}[${idx}]`);
        }
      });
    } else if (value && typeof value === "object") {
      keys = keys.concat(getLeafKeys(value, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys.sort();
}

function getInterpolationVariables(str: string): string[] {
  const matches = str.match(/{{([^{}]+)}}/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/[{}]/g, "").trim()).sort();
}

function getValueByPath(obj: any, pathStr: string): any {
  const parts = pathStr.replace(/\[(\d+)\]/g, ".$1").split(".");
  return parts.reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

describe("Landing Page Localization (i18n) Parity & Integrity", () => {
  it("both English and Arabic landing.json files must exist", () => {
    assert.ok(fs.existsSync(enPath), `Missing English locale: ${enPath}`);
    assert.ok(fs.existsSync(arPath), `Missing Arabic locale: ${arPath}`);
  });

  it("should have identical leaf keys between EN and AR (100% key parity)", () => {
    const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
    const ar = JSON.parse(fs.readFileSync(arPath, "utf-8"));

    const enKeys = getLeafKeys(en);
    const arKeys = getLeafKeys(ar);

    const missingInAr = enKeys.filter((k) => !arKeys.includes(k));
    const extraInAr = arKeys.filter((k) => !enKeys.includes(k));

    assert.deepStrictEqual(
      missingInAr,
      [],
      `Missing keys in Arabic landing.json: ${missingInAr.join(", ")}`
    );
    assert.deepStrictEqual(
      extraInAr,
      [],
      `Extra keys in Arabic landing.json: ${extraInAr.join(", ")}`
    );
    assert.strictEqual(enKeys.length, arKeys.length);
  });

  it("should not contain any empty or whitespace-only translation values", () => {
    const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
    const ar = JSON.parse(fs.readFileSync(arPath, "utf-8"));

    const enKeys = getLeafKeys(en);
    for (const key of enKeys) {
      const enVal = getValueByPath(en, key);
      const arVal = getValueByPath(ar, key);

      assert.ok(
        typeof enVal === "string" && enVal.trim().length > 0,
        `Empty or invalid English value at key: ${key}`
      );
      assert.ok(
        typeof arVal === "string" && arVal.trim().length > 0,
        `Empty or invalid Arabic value at key: ${key}`
      );
    }
  });

  it("should match interpolation variables across corresponding keys", () => {
    const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
    const ar = JSON.parse(fs.readFileSync(arPath, "utf-8"));

    const enKeys = getLeafKeys(en);
    for (const key of enKeys) {
      const enVal = getValueByPath(en, key);
      const arVal = getValueByPath(ar, key);

      if (typeof enVal === "string" && typeof arVal === "string") {
        const enVars = getInterpolationVariables(enVal);
        const arVars = getInterpolationVariables(arVal);

        assert.deepStrictEqual(
          enVars,
          arVars,
          `Interpolation variable mismatch at key: ${key} (EN: ${enVars.join(", ")}, AR: ${arVars.join(", ")})`
        );
      }
    }
  });

  it("should contain all required landing sections in dictionary", () => {
    const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
    const requiredSections = [
      "navbar",
      "hero",
      "heroPreview",
      "platform",
      "coaches",
      "members",
      "howItWorks",
      "features",
      "dualPerspective",
      "showcase",
      "cta",
      "footer",
    ];

    for (const section of requiredSections) {
      assert.ok(en[section], `Missing section '${section}' in landing.json`);
    }
  });
});
