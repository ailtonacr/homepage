import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
for (const lang of ["", "-en"]) {
  const path = resolve("dist", "og" + lang + ".png");
  const bytes = await readFile(path);
  const metadata = await sharp(bytes).metadata();
  assert.deepEqual([metadata.format, metadata.width, metadata.height], ["png", 1200, 630], "OG must be 1200×630 PNG");
  assert.ok((await stat(path)).size < 5 * 1024 * 1024, "Social image must be under 5 MB");
  const route = lang ? "en/index.html" : "index.html";
  const html = await readFile(resolve("dist", route), "utf8");
  assert.ok(html.includes("og" + lang + ".png"), "Localized page must use matching OG image: " + route);
  assert.ok(html.includes('property="og:image:type" content="image/png"'));
  assert.ok(html.includes('property="og:image:width" content="1200"'));
}
console.log("Open Graph: localized 1200×630 PNG images and actual metadata validated");
