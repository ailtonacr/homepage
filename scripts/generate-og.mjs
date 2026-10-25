import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const destination = resolve(root, "public");
await mkdir(destination, { recursive: true });
for (const lang of ["", "-en"]) {
  const svg = await readFile(resolve(destination, "og" + lang + ".svg"));
  const output = resolve(destination, "og" + lang + ".png");
  const image = sharp(svg, { density: 96 }).resize(1200, 630).png({ palette: false, compressionLevel: 9 });
  const result = await image.toFile(output);
  if (result.width !== 1200 || result.height !== 630 || result.format !== "png") throw new Error("Incorrect OG format: " + output);
  console.log("OG " + (lang || "pt") + ": " + result.width + "×" + result.height + ", " + (result.size / 1024).toFixed(1) + " KiB");
}
