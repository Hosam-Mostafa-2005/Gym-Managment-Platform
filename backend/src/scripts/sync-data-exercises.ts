import fs from "fs";
import { standardNewExercises } from "./seed-standard-exercises.js";

const filePath = "./src/scripts/data/exercises.ts";
const content = fs.readFileSync(filePath, "utf8");

const existingNames = new Set<string>();
const regex = /name:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  existingNames.add(match[1]);
}

const toAdd = standardNewExercises.filter((ex) => !existingNames.has(ex.name));
console.log(`Found ${toAdd.length} exercises to add to exercises.ts`);

if (toAdd.length > 0) {
  const lastBracketIndex = content.lastIndexOf("];");
  if (lastBracketIndex === -1) {
    throw new Error("Could not find ending ]; in exercises.ts");
  }

  const lines = toAdd
    .map((ex) => {
      return (
        "  {\n" +
        `    name: ${JSON.stringify(ex.name)},\n` +
        `    description: ${JSON.stringify(ex.description)},\n` +
        `    equipment: ${JSON.stringify(ex.equipment)},\n` +
        `    difficulty: ${JSON.stringify(ex.difficulty)},\n` +
        `    primaryMuscles: ${JSON.stringify(ex.primaryMuscles)},\n` +
        `    secondaryMuscles: ${JSON.stringify(ex.secondaryMuscles)},\n` +
        `    instructions: ${JSON.stringify(ex.instructions)},\n` +
        `    tips: ${JSON.stringify(ex.tips)},\n` +
        `    imageUrl: ${JSON.stringify(ex.imageUrl)},\n` +
        "  },"
      );
    })
    .join("\n");

  const newContent =
    content.slice(0, lastBracketIndex) +
    "\n  // ==========================================\n  // ENHANCED STANDARD MOVEMENTS\n  // ==========================================\n" +
    lines +
    "\n];\n";

  fs.writeFileSync(filePath, newContent, "utf8");
  console.log(`Successfully added ${toAdd.length} exercises to ${filePath}`);
}
