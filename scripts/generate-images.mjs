// Generates the site's illustrations with the OpenAI Images API and writes them to public/images.
//
//   OPENAI_API_KEY=... node scripts/generate-images.mjs            # only images that don't exist yet
//   OPENAI_API_KEY=... node scripts/generate-images.mjs how-find   # regenerate the named images
//
// Every illustration shares STYLE and every photo cutout shares PHOTO, so a regenerated image
// still matches the rest.

import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const MODEL = "gpt-image-2.5-sunburst";
const OUT_DIR = join(import.meta.dirname, "..", "public", "images");
const CONCURRENCY = 4;

const STYLE =
  "Flat editorial spot illustration. Clean geometric shapes, crisp edges, minimal detail. " +
  "Limited palette only: deep navy #13294B, bright orange #FF5F05, mid blue #1D58A7, pale blue-gray #E8EEF6, and white. " +
  "A single isolated subject, centered, with generous empty space around it. " +
  "Fully transparent background with no backdrop, no floor, and no cast shadow outside the subject. " +
  "No text, no letters, no numbers, no logos.";

/** Photo cutouts, shown straight on a pattern instead of on a disc. */
const PHOTO =
  "Full-color studio photograph with natural, true-to-life colors. Sharp focus, soft even lighting. " +
  "A single isolated subject, centered, cut out cleanly like a magazine collage element, with crisp edges. " +
  "Fully transparent background with no backdrop, no floor, and no cast shadow outside the subject. " +
  "No text, no letters, no numbers, no logos.";

/** Hero cutouts take turns standing on the bottom edge of the home hero pattern, so each one fills its frame the same way. */
const HERO = PHOTO + " The subject fills most of the frame, and its base touches the bottom edge of the image.";

const SQUARE = "1024x1024";
const WIDE = "1536x1024";

/** name → [size, subject, style (STYLE unless given)]. Names match the files components load from /images. */
const IMAGES = {
  // Home: the photo cutouts that take turns over the hero pattern, and the illustration they replaced
  "home-hero-photo": [SQUARE, "A tall stack of worn hardcover textbooks and ring binders in deep navy and bright orange, with a black graduation mortarboard cap resting on top and a pair of reading glasses folded beside the cap.", PHOTO],
  "hero-scale": [SQUARE, "A polished brass balance scale, its beam level, with a short stack of gold coins on one pan and a neat stack of plain paper documents on the other.", HERO],
  "hero-chart": [SQUARE, "A three-dimensional bar chart sculpture made of glossy blocks in deep navy, bright orange, and mid blue, five bars rising in steps from left to right on a thin navy base.", HERO],
  "hero-building": [SQUARE, "A white architectural scale model of a neoclassical university hall with tall columns, wide front steps, and a triangular pediment.", HERO],
  "hero-calculator": [SQUARE, "A chunky desktop printing calculator in deep navy with bright orange keys that have no markings, a long curl of blank paper tape spilling out of the top.", HERO],
  "hero-chip": [SQUARE, "A computer processor chip with a glossy deep navy top and rows of gold pins, resting at an angle on a small square of circuit board with fine copper traces and a few tiny orange components.", HERO],
  "hero-magnifier": [SQUARE, "A large brass magnifying glass leaning against a stack of manila folders with blank colored index tabs in navy, orange, and blue.", HERO],
  "hero-globe": [SQUARE, "An antique desk globe on a brass stand, its oceans deep navy and its continents in warm cream tones.", HERO],
  "hero-server": [SQUARE, "A compact computer server tower in deep navy with rows of small glowing blue and orange status lights, and a coiled blue network cable beside it.", HERO],
  "hero-coins": [SQUARE, "A clear glass jar filled with gold coins, with a small green seedling growing out of the coins at the top.", HERO],
  "hero-receipts": [SQUARE, "A metal receipt spike holding a thick stack of blank paper receipts, with a wooden rubber stamp with a bright orange handle beside it.", HERO],
  "home-hero": [SQUARE, "A graduation mortarboard cap resting on a neat stack of case folders, with a spreadsheet card and a small bar chart card fanned out behind the stack."],

  // Home: How it works
  "how-find": [SQUARE, "A large magnifying glass over a small fanned stack of case documents and a spreadsheet card."],
  "how-verify": [SQUARE, "A browser window showing a faculty profile page with a round portrait avatar, and a large round check-mark badge in front of it."],
  "how-share": [SQUARE, "An open folder with three document pages lifting out of it and flying outward like paper airplanes."],

  // One decorative image per page
  "home-share": [SQUARE, "A classroom lectern with an open book on top and a neat stack of handouts beside it."],
  browse: [SQUARE, "A short bookshelf section holding plain binders and case folders, with a spreadsheet card leaning against them."],
  verify: [SQUARE, "A university building with columns and a triangular roof, with a large shield badge showing a check mark in front of it."],
  contribute: [SQUARE, "A stack of documents and a spreadsheet sliding into an open folder, with a large upward arrow above it."],
  "contribute-done": [SQUARE, "A closed folder resting in an inbox tray, with a small clock badge beside it."],
  "sign-in": [SQUARE, "A large door key resting in front of an open laptop whose screen shows a round avatar."],
  "reset-password": [SQUARE, "An open envelope with a door key rising out of it."],
  account: [SQUARE, "A desk with an open laptop, a book with a ribbon bookmark, and a coffee mug."],
  author: [SQUARE, "A stack of three books with a ribbon bookmark, a pen lying across the top, and a round award medal leaning against them."],
  "file-download": [SQUARE, "A spreadsheet document with a large downward arrow pointing into an open tray."],
  "file-locked": [SQUARE, "A document page with a large orange padlock in front of it."],
  "not-found": [SQUARE, "An empty open folder with a single paper airplane flying away from it."],

  // One image in the body of each material, keyed by resource ID
  "TME-0142": [WIDE, "A gym kettlebell, a membership card, a water bottle, and a wall calendar page with four days circled."],
  "TME-0157": [WIDE, "Three ceramic vases on a shelf beside a line chart that falls to the right and a small hourglass."],
  "TME-0118": [WIDE, "A copper brewing kettle and two wooden barrels beside a pie chart split into three slices."],
  "TME-0127": [WIDE, "An open ledger book with ruled rows, a few rows highlighted in orange, beside a laptop showing a grid of code cells drawn as plain lines."],
  "TME-0133": [WIDE, "Retail store shelves stocked with boxes, beside a dashboard screen with bar charts and a map with dots."],
  "TME-0149": [WIDE, "A scatter of travel receipts, an airplane boarding pass, and a hotel key card, beside a bar chart whose bars step down from tall on the left to short on the right."],
  "TME-0109": [WIDE, "A flowchart of connected rounded boxes leading from a shopping cart to a delivery truck to a stack of coins, with copper-colored accents."],
  "TME-0161": [WIDE, "Three businesspeople at a meeting table, one with a laptop, one with a clipboard, one gesturing, with a screen behind them showing a line chart that dips."],
  "TME-0166": [WIDE, "A stack of digital token coins beside a government bond certificate with a ribbon seal, joined by a short chain of small cubes."],
  "TME-0088": [WIDE, "A passenger airplane flying above a lease contract page and a desk calendar."],
  "TME-0101": [WIDE, "Two office buildings joined by a bridge, with a path that rises to a milestone flag and a balance scale in the foreground."],

  // One image on a disc over each material's cover pattern, keyed by resource ID
  "TME-0142-cover": [SQUARE, "A gym kettlebell with a price tag hanging from its handle, the tag split into three colored bands."],
  "TME-0157-cover": [SQUARE, "A single ceramic vase with a thin zigzag crack down its side, standing on a short stack of coins."],
  "TME-0118-cover": [SQUARE, "Two beer mugs clinking together above a small wooden barrel."],
  "TME-0127-cover": [SQUARE, "A stylized geometric snake coiled around a closed ledger book."],
  "TME-0133-cover": [SQUARE, "A pyramid of cardboard stock boxes with a gap where one box is missing, and a clipboard checklist leaning against it."],
  "TME-0149-cover": [SQUARE, "A rolling suitcase with a long curling paper receipt spilling out of its front pocket."],
  "TME-0109-cover": [SQUARE, "A shipping box and a large coin joined in a loop by two curved arrows, forming a cycle."],
  "TME-0161-cover": [SQUARE, "A round pressure gauge with its needle in an orange zone, beside a small card showing a line chart that dips."],
  "TME-0166-cover": [SQUARE, "A heavy bank vault door standing open, with a stack of hexagonal digital token coins inside."],
  "TME-0088-cover": [SQUARE, "A passenger airplane seen from the side, with a large key tag hanging from its nose on a short string."],
  "TME-0101-cover": [SQUARE, "Two hands meeting in a handshake, with a milestone flag rising behind them and a small stack of coins below."],
};

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function generate(name) {
  const [size, subject, style = STYLE] = IMAGES[name];
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt: `${subject} ${style}`,
      size,
      quality: "low",
      background: "transparent",
      output_format: "webp",
      output_compression: 80,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${name}: ${body.error?.message || res.status}`);
  await writeFile(join(OUT_DIR, `${name}.webp`), Buffer.from(body.data[0].b64_json, "base64"));
  console.log(`${name}.webp`);
}

if (!process.env.OPENAI_API_KEY) {
  console.error("Set OPENAI_API_KEY first.");
  process.exit(1);
}
const asked = process.argv.slice(2);
const unknown = asked.filter((n) => !IMAGES[n]);
if (unknown.length) {
  console.error(`Unknown image: ${unknown.join(", ")}`);
  process.exit(1);
}
await mkdir(OUT_DIR, { recursive: true });
const queue = asked.length ? asked : (await Promise.all(Object.keys(IMAGES).map(async (n) => ((await exists(join(OUT_DIR, `${n}.webp`))) ? null : n)))).filter(Boolean);
let failed = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let name = queue.shift(); name; name = queue.shift()) {
      await generate(name).catch((e) => {
        failed++;
        console.error(e.message);
      });
    }
  }),
);
process.exit(failed ? 1 : 0);
