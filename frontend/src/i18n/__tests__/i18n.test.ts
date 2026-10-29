import { describe, it } from "node:test";
import assert from "node:assert/strict";
import i18n, {
  getDirectionForLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  changeLanguage,
  getCurrentLanguage,
  isRTL,
} from "../index.js";

describe("STREN — i18n Core Infrastructure", () => {
  it("initializes with supported languages and default english", () => {
    assert.deepEqual(SUPPORTED_LANGUAGES, ["en", "ar"]);
    assert.equal(DEFAULT_LANGUAGE, "en");
  });

  it("maps text directions correctly for en and ar", () => {
    assert.equal(getDirectionForLanguage("en"), "ltr");
    assert.equal(getDirectionForLanguage("ar"), "rtl");
  });

  it("translates common demonstration keys in English", async () => {
    await changeLanguage("en");
    assert.equal(getCurrentLanguage(), "en");
    assert.equal(isRTL(), false);
    assert.equal(i18n.t("actions.startWorkout"), "Start Workout");
    assert.equal(i18n.t("actions.myWorkouts"), "My Workouts");
    assert.equal(i18n.t("actions.saveChanges"), "Save Changes");
    assert.equal(i18n.t("actions.cancel"), "Cancel");
  });

  it("translates common demonstration keys in Arabic", async () => {
    await changeLanguage("ar");
    assert.equal(getCurrentLanguage(), "ar");
    assert.equal(isRTL(), true);
    assert.equal(i18n.t("actions.startWorkout"), "ابدأ التمرين");
    assert.equal(i18n.t("actions.myWorkouts"), "تماريني");
    assert.equal(i18n.t("actions.saveChanges"), "حفظ التغييرات");
    assert.equal(i18n.t("actions.cancel"), "إلغاء");
  });

  it("restores English cleanly", async () => {
    await changeLanguage("en");
    assert.equal(getCurrentLanguage(), "en");
    assert.equal(isRTL(), false);
  });
});
