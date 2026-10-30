import { describe, it } from "node:test";
import assert from "node:assert/strict";
import i18n, { changeLanguage } from "../../../i18n/index.js";
import enMeasurements from "../../../i18n/locales/en/bodyMeasurements.json" with { type: "json" };
import arMeasurements from "../../../i18n/locales/ar/bodyMeasurements.json" with { type: "json" };

function getObjectLeafKeys(obj: Record<string, any>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...getObjectLeafKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("STREN — Body Measurements Localization", () => {
  it("has 100% key parity between English and Arabic resource files", () => {
    const enKeys = getObjectLeafKeys(enMeasurements).sort();
    const arKeys = getObjectLeafKeys(arMeasurements).sort();

    const missingInAr = enKeys.filter((k) => !arKeys.includes(k));
    const missingInEn = arKeys.filter((k) => !enKeys.includes(k));

    assert.deepEqual(
      missingInAr,
      [],
      `Keys present in English but missing in Arabic: ${missingInAr.join(", ")}`,
    );
    assert.deepEqual(
      missingInEn,
      [],
      `Keys present in Arabic but missing in English: ${missingInEn.join(", ")}`,
    );
    assert.equal(enKeys.length, arKeys.length);
  });

  it("translates header and actions correctly in English and Arabic", async () => {
    await changeLanguage("en");
    assert.equal(i18n.t("bodyMeasurements:header.title"), "Body Measurements");
    assert.equal(
      i18n.t("bodyMeasurements:header.backToMember"),
      "Back to Member",
    );
    assert.equal(
      i18n.t("bodyMeasurements:header.addMeasurement"),
      "Add Measurement",
    );

    await changeLanguage("ar");
    assert.equal(i18n.t("bodyMeasurements:header.title"), "قياسات الجسم");
    assert.equal(
      i18n.t("bodyMeasurements:header.backToMember"),
      "العودة إلى العضو",
    );
    assert.equal(
      i18n.t("bodyMeasurements:header.addMeasurement"),
      "إضافة قياس",
    );
  });

  it("translates measurement overview and circumference labels accurately", async () => {
    await changeLanguage("en");
    assert.equal(i18n.t("bodyMeasurements:overview.weight"), "Weight");
    assert.equal(i18n.t("bodyMeasurements:overview.height"), "Height");
    assert.equal(i18n.t("bodyMeasurements:overview.bodyFat"), "Body Fat");
    assert.equal(i18n.t("bodyMeasurements:circumferences.chest"), "Chest");
    assert.equal(i18n.t("bodyMeasurements:circumferences.waist"), "Waist");
    assert.equal(i18n.t("bodyMeasurements:circumferences.hips"), "Hips");

    await changeLanguage("ar");
    assert.equal(i18n.t("bodyMeasurements:overview.weight"), "الوزن");
    assert.equal(i18n.t("bodyMeasurements:overview.height"), "الطول");
    assert.equal(i18n.t("bodyMeasurements:overview.bodyFat"), "نسبة الدهون");
    assert.equal(i18n.t("bodyMeasurements:circumferences.chest"), "الصدر");
    assert.equal(i18n.t("bodyMeasurements:circumferences.waist"), "الخصر");
    assert.equal(i18n.t("bodyMeasurements:circumferences.hips"), "الأرداف");
  });

  it("translates history table and actions correctly", async () => {
    await changeLanguage("en");
    assert.equal(
      i18n.t("bodyMeasurements:history.title"),
      "Measurement History",
    );
    assert.equal(i18n.t("bodyMeasurements:history.colDate"), "Date");
    assert.equal(
      i18n.t("bodyMeasurements:history.editAria"),
      "Edit Measurement",
    );
    assert.equal(
      i18n.t("bodyMeasurements:history.deleteAria"),
      "Delete Measurement",
    );

    await changeLanguage("ar");
    assert.equal(
      i18n.t("bodyMeasurements:history.title"),
      "سجل القياسات",
    );
    assert.equal(i18n.t("bodyMeasurements:history.colDate"), "التاريخ");
    assert.equal(
      i18n.t("bodyMeasurements:history.editAria"),
      "تعديل القياس",
    );
    assert.equal(
      i18n.t("bodyMeasurements:history.deleteAria"),
      "حذف القياس",
    );
  });

  it("translates dialogs and confirmation text correctly", async () => {
    await changeLanguage("en");
    assert.equal(
      i18n.t("bodyMeasurements:dialogs.create.title"),
      "Add Body Measurement",
    );
    assert.equal(
      i18n.t("bodyMeasurements:dialogs.edit.title"),
      "Edit Body Measurement",
    );
    assert.equal(
      i18n.t("bodyMeasurements:dialogs.delete.title"),
      "Delete measurement?",
    );
    assert.equal(
      i18n.t("bodyMeasurements:dialogs.delete.confirm"),
      "Delete Measurement",
    );

    await changeLanguage("ar");
    assert.equal(
      i18n.t("bodyMeasurements:dialogs.create.title"),
      "إضافة قياس للجسم",
    );
    assert.equal(
      i18n.t("bodyMeasurements:dialogs.edit.title"),
      "تعديل قياس الجسم",
    );
    assert.equal(
      i18n.t("bodyMeasurements:dialogs.delete.title"),
      "حذف القياس؟",
    );
    assert.equal(
      i18n.t("bodyMeasurements:dialogs.delete.confirm"),
      "حذف القياس",
    );
  });

  it("translates notifications and form buttons correctly", async () => {
    await changeLanguage("en");
    assert.equal(
      i18n.t("bodyMeasurements:notifications.createSuccess"),
      "Measurement added successfully.",
    );
    assert.equal(i18n.t("bodyMeasurements:form.save"), "Save Measurement");
    assert.equal(i18n.t("bodyMeasurements:form.cancel"), "Cancel");

    await changeLanguage("ar");
    assert.equal(
      i18n.t("bodyMeasurements:notifications.createSuccess"),
      "تمت إضافة القياس بنجاح.",
    );
    assert.equal(i18n.t("bodyMeasurements:form.save"), "حفظ القياس");
    assert.equal(i18n.t("bodyMeasurements:form.cancel"), "إلغاء");

    // Cleanly restore default
    await changeLanguage("en");
  });
});
