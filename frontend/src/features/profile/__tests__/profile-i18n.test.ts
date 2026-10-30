// src/features/profile/__tests__/profile-i18n.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enFilePath = path.resolve(
  __dirname,
  "../../../i18n/locales/en/profile.json",
);
const arFilePath = path.resolve(
  __dirname,
  "../../../i18n/locales/ar/profile.json",
);

function getLeafKeys(obj: any, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(result, getLeafKeys(v, fullKey));
    } else {
      result[fullKey] = String(v);
    }
  }
  return result;
}

describe("Profile i18n Localization Integrity", () => {
  const enRaw = fs.readFileSync(enFilePath, "utf8");
  const arRaw = fs.readFileSync(arFilePath, "utf8");

  const enJson = JSON.parse(enRaw);
  const arJson = JSON.parse(arRaw);

  const enLeaves = getLeafKeys(enJson);
  const arLeaves = getLeafKeys(arJson);

  it("loads valid non-empty translation dictionaries for EN and AR", () => {
    assert.ok(Object.keys(enLeaves).length > 0, "EN translation dictionary is empty");
    assert.ok(Object.keys(arLeaves).length > 0, "AR translation dictionary is empty");
  });

  it("achieves 100% key parity between English and Arabic profile.json", () => {
    const enKeys = Object.keys(enLeaves).sort();
    const arKeys = Object.keys(arLeaves).sort();

    const missingInAr = enKeys.filter((k) => !(k in arLeaves));
    const missingInEn = arKeys.filter((k) => !(k in enLeaves));

    assert.deepEqual(
      missingInAr,
      [],
      `Keys missing in Arabic dictionary: ${missingInAr.join(", ")}`,
    );
    assert.deepEqual(
      missingInEn,
      [],
      `Keys missing in English dictionary: ${missingInEn.join(", ")}`,
    );
    assert.equal(
      enKeys.length,
      arKeys.length,
      `Key count mismatch: EN has ${enKeys.length}, AR has ${arKeys.length}`,
    );
  });

  it("ensures no translation leaf key contains empty or whitespace-only values", () => {
    for (const [key, value] of Object.entries(enLeaves)) {
      assert.ok(
        value.trim().length > 0,
        `EN key '${key}' has empty or whitespace value`,
      );
    }
    for (const [key, value] of Object.entries(arLeaves)) {
      assert.ok(
        value.trim().length > 0,
        `AR key '${key}' has empty or whitespace value`,
      );
    }
  });

  it("ensures variable interpolation tokens match between EN and AR", () => {
    const extractVars = (str: string) => {
      const matches = str.match(/\{\{([^}]+)\}\}/g) || [];
      return matches.map((m) => m.trim()).sort();
    };

    for (const [key, enVal] of Object.entries(enLeaves)) {
      const arVal = arLeaves[key];
      const enVars = extractVars(enVal);
      const arVars = extractVars(arVal);

      assert.deepEqual(
        arVars,
        enVars,
        `Interpolation token mismatch in key '${key}': EN=[${enVars.join(
          ", ",
        )}], AR=[${arVars.join(", ")}]`,
      );
    }
  });

  it("verifies avatar and profile picture keys are fully specified", () => {
    const requiredAvatarKeys = [
      "avatarDialog.title",
      "avatarDialog.description",
      "avatarDialog.selected",
      "avatarDialog.currentPicture",
      "avatarDialog.noPicture",
      "avatarDialog.chooseDifferent",
      "avatarDialog.selectPhoto",
      "avatarDialog.savePicture",
      "avatarDialog.uploading",
      "avatarDialog.removePicture",
      "avatarDialog.removing",
      "avatarDialog.clickToChange",
      "avatarDialog.changePicture",
      "avatarDialog.errors.sizeExceeded",
      "avatarDialog.errors.unsupportedFormat",
      "avatarDialog.errors.uploadFailed",
      "avatarDialog.errors.deleteFailed",
      "avatarDialog.toasts.updateSuccess",
      "avatarDialog.toasts.removeSuccess",
    ];

    for (const key of requiredAvatarKeys) {
      assert.ok(key in enLeaves, `Missing avatar key in EN: ${key}`);
      assert.ok(key in arLeaves, `Missing avatar key in AR: ${key}`);
    }
  });

  it("verifies change password and security dialog keys are fully specified", () => {
    const requiredPasswordKeys = [
      "passwordDialog.titleChange",
      "passwordDialog.titleSet",
      "passwordDialog.subtitle",
      "passwordDialog.googleLinked",
      "passwordDialog.tabs.currentPassword",
      "passwordDialog.tabs.emailVerification",
      "passwordDialog.fields.currentPassword",
      "passwordDialog.fields.newPassword",
      "passwordDialog.fields.confirmNewPassword",
      "passwordDialog.fields.verificationCode",
      "passwordDialog.actions.updatePassword",
      "passwordDialog.actions.sendCode",
      "passwordDialog.actions.resendCode",
      "passwordDialog.actions.confirmAndSave",
    ];

    for (const key of requiredPasswordKeys) {
      assert.ok(key in enLeaves, `Missing password key in EN: ${key}`);
      assert.ok(key in arLeaves, `Missing password key in AR: ${key}`);
    }
  });

  it("verifies member and coach profile sections have authentic Arabic content", () => {
    const sampleKeys = [
      "header.activeAccount",
      "header.actions.editProfile",
      "member.personalInfo.fullName",
      "member.overview.totalSessions",
      "coach.overview.activeMembers",
      "coach.workoutStats.authoringMatrix",
    ];

    const arabicRegex = /[\u0600-\u06FF]/;
    for (const key of sampleKeys) {
      assert.ok(
        arabicRegex.test(arLeaves[key]),
        `Key '${key}' in Arabic does not contain Arabic letters: ${arLeaves[key]}`,
      );
    }
  });
});
