import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function main() {
  console.log("Fetching all Cloudinary resources...");

  let allResources: any[] = [];
  let nextCursor: string | undefined = undefined;

  do {
    const res: any = await cloudinary.api.resources({
      type: "upload",
      max_results: 500,
      next_cursor: nextCursor,
    });
    allResources = allResources.concat(res.resources || []);
    nextCursor = res.next_cursor;
  } while (nextCursor);

  console.log(`Total upload resources in Cloudinary account: ${allResources.length}`);

  // Sort by created_at descending
  allResources.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  console.log("\nRecent 70 resources:");
  allResources.slice(0, 70).forEach((r, idx) => {
    console.log(
      `${idx + 1}. public_id: "${r.public_id}", format: ${r.format}, bytes: ${r.bytes}, created_at: ${r.created_at}`
    );
  });

  // Filter for exercise illustration candidates
  const exerciseIllustrations = allResources.filter(
    (r) =>
      r.public_id.includes("exercise") ||
      r.public_id.includes("curl") ||
      r.public_id.includes("press") ||
      r.public_id.includes("squat") ||
      r.public_id.includes("dips")
  );

  console.log(`\nTotal exercise-related resources found: ${exerciseIllustrations.length}`);

  // Write full dump to scratch
  import("fs").then((fs) => {
    fs.writeFileSync(
      "C:/Users/eman8/.gemini/antigravity/brain/39668a39-71e5-4a9d-8c86-52b91aa15143/scratch/cloudinary-all-resources.json",
      JSON.stringify(allResources, null, 2),
      "utf-8"
    );
    console.log("Saved full list to scratch/cloudinary-all-resources.json");
  });
}

main().catch(console.error);
