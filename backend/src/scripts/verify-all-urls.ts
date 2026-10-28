import fs from "fs";
import path from "path";
import https from "https";

const MANIFEST_PATH = path.resolve(
  process.cwd(),
  "../Docs/assets/exercise-illustrations-refresh/exercise-image-manifest.json"
);

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
const mapped = manifest.exercises.filter((e: any) => e.status === "MAPPED");

console.log(`Checking ${mapped.length} mapped exercise delivery URLs...`);

async function checkUrl(url: string, name: string): Promise<{ ok: boolean; status: number; contentType: string; name: string; url: string; error?: string }> {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        resolve({
          ok: res.statusCode === 200,
          status: res.statusCode || 0,
          contentType: res.headers["content-type"] || "",
          name,
          url,
        });
      })
      .on("error", (err) => {
        resolve({
          ok: false,
          status: 0,
          contentType: "",
          error: err.message,
          name,
          url,
        });
      });
  });
}

async function main() {
  const results: any[] = [];
  // Run with concurrency of 5
  for (let i = 0; i < mapped.length; i += 5) {
    const chunk = mapped.slice(i, i + 5);
    const chunkResults = await Promise.all(
      chunk.map((e: any) => checkUrl(e.deliveryUrl, e.exerciseName))
    );
    results.push(...chunkResults);
  }

  let success = 0;
  let failed = 0;

  for (const r of results) {
    if (r.ok) {
      success++;
      console.log(`✅ [200 OK] ${r.name} (${r.contentType})`);
    } else {
      failed++;
      console.error(`❌ [FAILED: ${r.status}] ${r.name} -> ${r.url} (Error: ${r.error})`);
    }
  }

  console.log("\n====================================");
  console.log(`Verification Complete: ${success} passed, ${failed} failed.`);
  console.log("====================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
