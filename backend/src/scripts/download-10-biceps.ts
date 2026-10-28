import fs from "fs";
import path from "path";
import https from "https";

const scratchDir =
  "C:/Users/eman8/.gemini/antigravity/brain/39668a39-71e5-4a9d-8c86-52b91aa15143/scratch/biceps-downloads";

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

const imagesToDownload = [
  {
    name: "1-Cable_Machine_Biceps_Curl_Illustration.png",
    url: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213811/Cable_Machine_Biceps_Curl_Illustration.png",
  },
  {
    name: "2-Cable_Curl_Exercise_Illustration.png",
    url: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213809/Cable_Curl_Exercise_Illustration.png",
  },
  {
    name: "3-Faceless_Muscular_Man_Performing_Dumbbell_Curl.png",
    url: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213807/Faceless_Muscular_Man_Performing_Dumbbell_Curl.png",
  },
  {
    name: "4-Faceless_Muscular_Dumbbell_Curl_Illustration.png",
    url: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213806/Faceless_Muscular_Dumbbell_Curl_Illustration.png",
  },
  {
    name: "5-Black-and-White_Cable_Curl_Illustration.png",
    url: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213806/Black-and-White_Cable_Curl_Illustration.png",
  },
  {
    name: "6-Seated_Preacher_Curl_Machine_Illustration.png",
    url: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213801/Seated_Preacher_Curl_Machine_Illustration.png",
  },
  {
    name: "7-Prone_Incline_Dumbbell_Curls.png",
    url: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213801/Prone_Incline_Dumbbell_Curls.png",
  },
  {
    name: "8-Muscular_Man_Curling_an_EZ_Barbell.png",
    url: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213800/Muscular_Man_Curling_an_EZ_Barbell.png",
  },
  {
    name: "9-Faceless_Bodybuilder_Holding_Barbell.png",
    url: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213792/Faceless_Bodybuilder_Holding_Barbell.png",
  },
  {
    name: "10-Faceless_Cross-Body_Curl_Illustration.png",
    url: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213792/Faceless_Cross-Body_Curl_Illustration.png",
  },
];

async function downloadFile(url: string, dest: string) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function main() {
  for (const item of imagesToDownload) {
    const dest = path.join(scratchDir, item.name);
    console.log(`Downloading ${item.name}...`);
    await downloadFile(item.url, dest);
  }
  console.log("All 10 downloaded successfully!");
}

main().catch(console.error);
