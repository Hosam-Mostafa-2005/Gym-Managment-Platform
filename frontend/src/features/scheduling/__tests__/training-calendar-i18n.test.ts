import { describe, it } from "node:test";
import assert from "node:assert/strict";
import i18n, { changeLanguage } from "../../../i18n/index.js";
import enCalendar from "../../../i18n/locales/en/trainingCalendar.json" with { type: "json" };
import arCalendar from "../../../i18n/locales/ar/trainingCalendar.json" with { type: "json" };

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

describe("STREN — Training Calendar Localization", () => {
  it("has 100% key parity between English and Arabic training calendar resources", () => {
    const enKeys = getObjectLeafKeys(enCalendar).sort();
    const arKeys = getObjectLeafKeys(arCalendar).sort();

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
    assert.ok(enKeys.length > 250, `Expected >250 keys, found ${enKeys.length}`);
  });

  it("ensures no Arabic translation is empty or untranslated fallback placeholder", () => {
    const arKeys = getObjectLeafKeys(arCalendar);
    for (const key of arKeys) {
      const parts = key.split(".");
      let val: any = arCalendar;
      for (const p of parts) {
        val = val?.[p];
      }
      assert.ok(
        typeof val === "string" && val.trim().length > 0,
        `Empty or invalid Arabic translation at key: ${key}`,
      );
    }
  });

  it("translates header, KPI cards, and controls correctly", async () => {
    await changeLanguage("en");
    assert.equal(i18n.t("trainingCalendar:header.pageTitle"), "Training Calendar");
    assert.equal(i18n.t("trainingCalendar:kpi.weeklyAdherence"), "Weekly Adherence");
    assert.equal(i18n.t("trainingCalendar:controls.calendar"), "Calendar");
    assert.equal(i18n.t("trainingCalendar:controls.list"), "List");
    assert.equal(i18n.t("trainingCalendar:controls.buildProgram"), "Build 4-Week Program");
    assert.equal(i18n.t("trainingCalendar:controls.scheduleWorkout"), "Schedule Workout");

    await changeLanguage("ar");
    assert.equal(i18n.t("trainingCalendar:header.pageTitle"), "جدول التدريب");
    assert.equal(i18n.t("trainingCalendar:kpi.weeklyAdherence"), "الالتزام الأسبوعي");
    assert.equal(i18n.t("trainingCalendar:controls.calendar"), "التقويم");
    assert.equal(i18n.t("trainingCalendar:controls.list"), "القائمة");
    assert.equal(i18n.t("trainingCalendar:controls.buildProgram"), "إنشاء برنامج 4 أسابيع");
    assert.equal(i18n.t("trainingCalendar:controls.scheduleWorkout"), "جدولة تمرين");
  });

  it("translates event types and statuses correctly", async () => {
    await changeLanguage("en");
    assert.equal(i18n.t("trainingCalendar:status.scheduled"), "Scheduled");
    assert.equal(i18n.t("trainingCalendar:status.completed"), "Completed");
    assert.equal(i18n.t("trainingCalendar:status.missed"), "Missed");
    assert.equal(i18n.t("trainingCalendar:status.cancelled"), "Cancelled");
    assert.equal(i18n.t("trainingCalendar:status.noShow"), "No Show");

    await changeLanguage("ar");
    assert.equal(i18n.t("trainingCalendar:status.scheduled"), "مجدول");
    assert.equal(i18n.t("trainingCalendar:status.completed"), "مكتمل");
    assert.equal(i18n.t("trainingCalendar:status.missed"), "فائت");
    assert.equal(i18n.t("trainingCalendar:status.cancelled"), "ملغي");
    assert.equal(i18n.t("trainingCalendar:status.noShow"), "لم يحضر");
  });

  it("translates appointment modal labels correctly", async () => {
    await changeLanguage("en");
    assert.equal(i18n.t("trainingCalendar:appointmentModal.date"), "Date");
    assert.equal(i18n.t("trainingCalendar:appointmentModal.timeSlot"), "Time Slot");
    assert.equal(i18n.t("trainingCalendar:appointmentModal.coachLabel"), "Coach:");
    assert.equal(i18n.t("trainingCalendar:appointmentModal.athleteLabel"), "Athlete:");
    assert.equal(i18n.t("trainingCalendar:appointmentModal.confirmCompletion"), "Confirm Completion");

    await changeLanguage("ar");
    assert.equal(i18n.t("trainingCalendar:appointmentModal.date"), "التاريخ");
    assert.equal(i18n.t("trainingCalendar:appointmentModal.timeSlot"), "الفترة الزمنية");
    assert.equal(i18n.t("trainingCalendar:appointmentModal.coachLabel"), "المدرب:");
    assert.equal(i18n.t("trainingCalendar:appointmentModal.athleteLabel"), "اللاعب:");
    assert.equal(i18n.t("trainingCalendar:appointmentModal.confirmCompletion"), "تأكيد الإكمال");
  });

  it("translates schedule and reschedule dialogs correctly", async () => {
    await changeLanguage("en");
    assert.equal(i18n.t("trainingCalendar:scheduleDialog.titleMember"), "Schedule Workout");
    assert.equal(i18n.t("trainingCalendar:rescheduleDialog.title"), "Reschedule Workout");
    assert.equal(i18n.t("trainingCalendar:rescheduleDialog.confirm"), "Confirm Reschedule");

    await changeLanguage("ar");
    assert.equal(i18n.t("trainingCalendar:scheduleDialog.titleMember"), "جدولة تمرين");
    assert.equal(i18n.t("trainingCalendar:rescheduleDialog.title"), "إعادة جدولة التمرين");
    assert.equal(i18n.t("trainingCalendar:rescheduleDialog.confirm"), "تأكيد إعادة الجدولة");
  });

  it("translates program builder dialog correctly", async () => {
    await changeLanguage("en");
    assert.equal(i18n.t("trainingCalendar:programDialog.title"), "Build Monthly Training Program");
    assert.equal(i18n.t("trainingCalendar:programDialog.quickPresetsTitle"), "Quick Split Presets");
    assert.equal(i18n.t("trainingCalendar:programDialog.weeklyScheduleTitle"), "Weekly Routine Schedule");
    assert.equal(i18n.t("trainingCalendar:programDialog.projectionTitle"), "Program Projection");

    await changeLanguage("ar");
    assert.equal(i18n.t("trainingCalendar:programDialog.title"), "إنشاء برنامج تدريبي شهري");
    assert.equal(i18n.t("trainingCalendar:programDialog.quickPresetsTitle"), "نماذج التقسيم السريعة");
    assert.equal(i18n.t("trainingCalendar:programDialog.weeklyScheduleTitle"), "الجدول الأسبوعي للروتين");
    assert.equal(i18n.t("trainingCalendar:programDialog.projectionTitle"), "توقعات البرنامج");
  });

  it("restores English as default language cleanly", async () => {
    await changeLanguage("en");
    assert.equal(i18n.language, "en");
  });
});
