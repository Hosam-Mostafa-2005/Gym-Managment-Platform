import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllLeafKeys(obj: Record<string, any>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys = keys.concat(getAllLeafKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getValueByPath(obj: Record<string, any>, pathStr: string): any {
  return pathStr.split(".").reduce((acc, part) => acc?.[part], obj);
}

function extractVariables(text: string): string[] {
  const matches = text.match(/{{([^}]+)}}/g) || [];
  return matches.map((m) => m.replace(/[{}]/g, "").trim()).sort();
}

describe("Dashboard Localization (i18n) Parity & Integrity", () => {
  const localesDir = path.resolve(__dirname, "../../../i18n/locales");
  const enDashboardPath = path.join(localesDir, "en", "dashboard.json");
  const arDashboardPath = path.join(localesDir, "ar", "dashboard.json");

  it("both English and Arabic dashboard.json files must exist", () => {
    assert.ok(fs.existsSync(enDashboardPath), "en/dashboard.json must exist");
    assert.ok(fs.existsSync(arDashboardPath), "ar/dashboard.json must exist");
  });

  const enDashboard = JSON.parse(fs.readFileSync(enDashboardPath, "utf-8"));
  const arDashboard = JSON.parse(fs.readFileSync(arDashboardPath, "utf-8"));

  it("should have identical leaf keys between EN and AR (100% key parity)", () => {
    const enKeys = getAllLeafKeys(enDashboard).sort();
    const arKeys = getAllLeafKeys(arDashboard).sort();

    const missingInAr = enKeys.filter((k) => !arKeys.includes(k));
    const missingInEn = arKeys.filter((k) => !enKeys.includes(k));

    assert.deepEqual(
      missingInAr,
      [],
      `Keys present in EN but missing in AR:\n${missingInAr.join("\n")}`,
    );
    assert.deepEqual(
      missingInEn,
      [],
      `Keys present in AR but missing in EN:\n${missingInEn.join("\n")}`,
    );
    assert.equal(
      enKeys.length,
      arKeys.length,
      "Both dictionaries must have the exact same count of leaf keys",
    );
  });

  it("should not contain any empty or whitespace-only translation values", () => {
    const enKeys = getAllLeafKeys(enDashboard);
    const arKeys = getAllLeafKeys(arDashboard);

    for (const key of enKeys) {
      const val = getValueByPath(enDashboard, key);
      assert.ok(
        typeof val === "string" && val.trim().length > 0,
        `EN key "${key}" has an empty or invalid value: ${val}`,
      );
    }

    for (const key of arKeys) {
      const val = getValueByPath(arDashboard, key);
      assert.ok(
        typeof val === "string" && val.trim().length > 0,
        `AR key "${key}" has an empty or invalid value: ${val}`,
      );
    }
  });

  it("should match interpolation variables across corresponding keys", () => {
    const enKeys = getAllLeafKeys(enDashboard);

    for (const key of enKeys) {
      const enVal = getValueByPath(enDashboard, key);
      const arVal = getValueByPath(arDashboard, key);

      if (typeof enVal === "string" && typeof arVal === "string") {
        const enVars = extractVariables(enVal);
        const arVars = extractVariables(arVal);

        assert.deepEqual(
          enVars,
          arVars,
          `Variable mismatch for key "${key}": EN has [${enVars.join(", ")}], AR has [${arVars.join(", ")}]`,
        );
      }
    }
  });

  it("contains all critical sections for both Member and Coach dashboards", () => {
    const sections = ["nav", "states", "member", "coach"];
    for (const section of sections) {
      assert.ok(enDashboard[section], `EN dashboard.json must have section: ${section}`);
      assert.ok(arDashboard[section], `AR dashboard.json must have section: ${section}`);
    }
  });
});
