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
  console.log("Querying Cloudinary for uploaded exercise illustrations...");
  console.log("Using cloud_name:", process.env.CLOUDINARY_CLOUD_NAME);

  // Try listing folders or search API
  try {
    const foldersRes = await cloudinary.api.root_folders();
    console.log("Root folders:", foldersRes.folders);
  } catch (err: any) {
    console.log("Error listing root folders:", err.message);
  }

  // Check subfolders of stren
  try {
    const subfolders = await cloudinary.api.sub_folders("stren");
    console.log("stren subfolders:", subfolders.folders);
    for (const f of subfolders.folders) {
      try {
        const sub2 = await cloudinary.api.sub_folders(f.path);
        console.log(`Subfolders of ${f.path}:`, sub2.folders);
      } catch (e) {}
    }
  } catch (err: any) {
    console.log("Error listing subfolders of stren:", err.message);
  }

  // Search resources with prefix
  const searchPrefixes = [
    "stren/exercises/illustrations",
    "stren/exercises",
    "stren",
    "exercises/illustrations",
    "illustrations",
    "exercise-",
  ];

  for (const prefix of searchPrefixes) {
    try {
      const res = await cloudinary.api.resources({
        type: "upload",
        prefix,
        max_results: 100,
      });
      console.log(`Resources with prefix '${prefix}': count = ${res.resources?.length}`);
      if (res.resources?.length > 0) {
        console.log("Sample items:", res.resources.slice(0, 5).map((r: any) => ({
          public_id: r.public_id,
          secure_url: r.secure_url,
          format: r.format,
          bytes: r.bytes,
        })));
      }
    } catch (e: any) {
      console.log(`Error checking prefix '${prefix}':`, e.message);
    }
  }

  // Also do a search query if search API is available
  try {
    const searchRes = await cloudinary.search
      .expression("exercise")
      .max_results(100)
      .execute();
    console.log(`Cloudinary Search API found: ${searchRes.total_count} assets matching 'exercise'`);
    console.log("Sample search results:", searchRes.resources?.slice(0, 10).map((r: any) => ({
      public_id: r.public_id,
      secure_url: r.secure_url,
      created_at: r.created_at,
    })));
  } catch (e: any) {
    console.log("Search API error:", e.message);
  }
}

main().catch(console.error);
