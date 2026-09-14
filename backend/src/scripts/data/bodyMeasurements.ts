export interface RawBodyMeasurement {
  member: any; // ObjectId
  trainer: any; // ObjectId
  weight: number;
  height: number;
  bodyFat?: number;
  circumferences?: {
    chest?: number;
    waist?: number;
    hips?: number;
    shoulders?: number;
    neck?: number;
    leftArm?: number;
    rightArm?: number;
    leftThigh?: number;
    rightThigh?: number;
    leftCalf?: number;
    rightCalf?: number;
  };
  notes?: string;
  measuredAt: Date;
  isActive: boolean;
}

const NOTE_VARIATIONS = [
  "Excellent progress.",
  "Body fat reduced.",
  "Strength improving.",
  "Weight plateau.",
  "Focus on nutrition.",
  "Great muscle tone development.",
  "Consistency is paying off.",
  "Slight fatigue noted this week.",
];

export const generateBodyMeasurementsData = (
  assignments: any[],
): RawBodyMeasurement[] => {
  const measurements: RawBodyMeasurement[] = [];
  const now = new Date();

  // Filter for ACTIVE assignments only
  const activeAssignments = assignments.filter(
    (a) => a.status === "ACTIVE" || a.isActive === true,
  );

  activeAssignments.forEach((assignment, index) => {
    const memberId = assignment.member;
    const trainerId = assignment.trainer;

    // Determine journey type based on index
    // 0: Fat loss, 1: Muscle gain, 2: Maintenance, 3: Regression then recovery
    const journeyType = index % 4;

    // Number of measurements between 5 and 8
    const measurementCount = 5 + (index % 4);

    // Spread across previous 6 months (~180 days)
    const totalDaysSpan = 180;
    const intervalDays = totalDaysSpan / (measurementCount - 1);

    // Base initial metrics
    let currentWeight = 70 + ((index * 5) % 25); // Baseline between 70kg and 95kg
    let currentBodyFat = 15 + ((index * 3) % 15); // Baseline between 15% and 30%
    const height = 165 + ((index * 4) % 20); // Constant height between 165cm and 185cm

    // Baseline circumferences proportional to weight
    let chest = 95 + currentWeight * 0.2;
    let waist = 80 + currentWeight * 0.3;
    let hips = 95 + currentWeight * 0.25;
    let shoulders = 110 + currentWeight * 0.2;
    let neck = 36 + currentWeight * 0.05;
    let leftArm = 30 + currentWeight * 0.08;
    let rightArm = leftArm;
    let leftThigh = 55 + currentWeight * 0.15;
    let rightThigh = leftThigh;
    let leftCalf = 35 + currentWeight * 0.05;
    let rightCalf = leftCalf;

    for (let mIndex = 0; mIndex < measurementCount; mIndex++) {
      // Calculate measuredAt chronologically from past to present (~6 months ago up to now)
      const daysAgo = Math.round(totalDaysSpan - mIndex * intervalDays);
      const measuredAt = new Date(now);
      measuredAt.setDate(now.getDate() - daysAgo);

      if (mIndex > 0) {
        // Apply journey progression rules
        if (journeyType === 0) {
          // Fat loss: gradual weight & waist reduction, slight muscle retention
          currentWeight = Math.max(55, currentWeight - (0.8 + (mIndex % 0.5)));
          currentBodyFat = Math.max(8, currentBodyFat - 0.6);
          waist = Math.max(65, waist - 1.2);
          chest = Math.max(85, chest - 0.4);
          leftArm = Math.max(28, leftArm - 0.1);
          rightArm = leftArm;
        } else if (journeyType === 1) {
          // Muscle gain: gradual weight, shoulders, arms increase, body fat stable/slight drop
          currentWeight += 0.6 + (mIndex % 0.4);
          currentBodyFat = Math.max(10, currentBodyFat - 0.1);
          shoulders += 0.8;
          chest += 0.7;
          leftArm += 0.5;
          rightArm = leftArm;
          leftThigh += 0.6;
          rightThigh = leftThigh;
        } else if (journeyType === 2) {
          // Maintenance: almost unchanged with tiny natural fluctuations
          currentWeight += mIndex % 2 === 0 ? 0.2 : -0.2;
          waist += mIndex % 2 === 0 ? 0.1 : -0.1;
        } else {
          // Small regression then recovery (dip in middle indices)
          if (mIndex === 2 || mIndex === 3) {
            currentWeight += 1.2; // regression (weight up, fat up)
            currentBodyFat += 0.8;
            waist += 1.0;
          } else {
            currentWeight -= 0.7; // recovery
            currentBodyFat -= 0.5;
            waist -= 0.8;
          }
        }
      }

      // Round values for realism
      const weight = Math.round(currentWeight * 10) / 10;
      const bodyFat = Math.round(currentBodyFat * 10) / 10;

      const circumferences = {
        chest: Math.round(chest * 10) / 10,
        waist: Math.round(waist * 10) / 10,
        hips: Math.round(hips * 10) / 10,
        shoulders: Math.round(shoulders * 10) / 10,
        neck: Math.round(neck * 10) / 10,
        leftArm: Math.round(leftArm * 10) / 10,
        rightArm: Math.round(rightArm * 10) / 10,
        leftThigh: Math.round(leftThigh * 10) / 10,
        rightThigh: Math.round(rightThigh * 10) / 10,
        leftCalf: Math.round(leftCalf * 10) / 10,
        rightCalf: Math.round(rightCalf * 10) / 10,
      };

      const note = NOTE_VARIATIONS[(index + mIndex) % NOTE_VARIATIONS.length];

      measurements.push({
        member: memberId,
        trainer: trainerId,
        weight,
        height,
        bodyFat,
        circumferences,
        notes: note,
        measuredAt,
        isActive: true,
      });
    }
  });

  return measurements;
};
