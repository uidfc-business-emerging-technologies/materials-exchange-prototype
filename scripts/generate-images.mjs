// Generates the site's illustrations with the OpenAI Images API and writes them to public/images.
//
//   OPENAI_API_KEY=... node scripts/generate-images.mjs            # only images that don't exist yet
//   OPENAI_API_KEY=... node scripts/generate-images.mjs how-find   # regenerate the named images
//
// Every illustration shares STYLE, every photo cutout shares PHOTO, and every material cover in
// one style shares that style's line, so a regenerated image still matches the rest. Images
// shown small are scaled down before they're saved.

import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

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

/** Hero cutouts rain down the home hero pattern, so each one fills its frame the same way and they read as the same scale. */
const HERO = PHOTO + " The subject fills most of the frame.";

const SQUARE = "1024x1024";
const WIDE = "1536x1024";
/** Photo cutouts are shown at about 130px or less, so they're saved 320px wide. */
const CUTOUT = { width: 320 };

/**
 * name → [size, subject, style (STYLE unless given), output (saved as generated unless given)].
 * Output can set `width` to scale the image down, `small` to also save a smaller copy as
 * `<name>-sm.webp`, and `opaque` for an image with its own background. Names match the files
 * components load from /images.
 */
const IMAGES = {
  // Home: the photo cutouts that rain down the hero pattern, and the illustration they replaced
  "home-hero-photo": [SQUARE, "A tall stack of worn hardcover textbooks and ring binders in deep navy and bright orange, with a black graduation mortarboard cap resting on top and a pair of reading glasses folded beside the cap.", PHOTO, CUTOUT],
  "hero-scale": [SQUARE, "A polished brass balance scale, its beam level, with a short stack of gold coins on one pan and a neat stack of plain paper documents on the other.", HERO, CUTOUT],
  "hero-chart": [SQUARE, "A three-dimensional bar chart sculpture made of glossy blocks in deep navy, bright orange, and mid blue, five bars rising in steps from left to right on a thin navy base.", HERO, CUTOUT],
  "hero-building": [SQUARE, "A white architectural scale model of a neoclassical university hall with tall columns, wide front steps, and a triangular pediment.", HERO, CUTOUT],
  "hero-calculator": [SQUARE, "A chunky desktop printing calculator in deep navy with bright orange keys that have no markings, a long curl of blank paper tape spilling out of the top.", HERO, CUTOUT],
  "hero-chip": [SQUARE, "A computer processor chip with a glossy deep navy top and rows of gold pins, resting at an angle on a small square of circuit board with fine copper traces and a few tiny orange components.", HERO, CUTOUT],
  "hero-magnifier": [SQUARE, "A large brass magnifying glass leaning against a stack of manila folders with blank colored index tabs in navy, orange, and blue.", HERO, CUTOUT],
  "hero-globe": [SQUARE, "An antique desk globe on a brass stand, its oceans deep navy and its continents in warm cream tones.", HERO, CUTOUT],
  "hero-server": [SQUARE, "A compact computer server tower in deep navy with rows of small glowing blue and orange status lights, and a coiled blue network cable beside it.", HERO, CUTOUT],
  "hero-coins": [SQUARE, "A clear glass jar filled with gold coins, with a small green seedling growing out of the coins at the top.", HERO, CUTOUT],
  "hero-receipts": [SQUARE, "A metal receipt spike holding a thick stack of blank paper receipts, with a wooden rubber stamp with a bright orange handle beside it.", HERO, CUTOUT],
  "hero-diploma": [SQUARE, "A rolled paper diploma tied around the middle with a bright orange satin ribbon and bow.", HERO, CUTOUT],
  "hero-abacus": [SQUARE, "A wooden abacus with rows of deep navy and bright orange beads.", HERO, CUTOUT],
  "hero-robot": [SQUARE, "A small friendly robot with a glossy white body, a deep navy face screen, and two round glowing blue eyes.", HERO, CUTOUT],
  "hero-bulb": [SQUARE, "A clear glass light bulb with a glowing warm orange filament and a brass screw base.", HERO, CUTOUT],
  "hero-pie": [SQUARE, "A three-dimensional pie chart made of thick glossy slices in deep navy, bright orange, and mid blue, with one orange slice pulled out from the rest.", HERO, CUTOUT],
  "hero-padlock": [SQUARE, "A heavy polished brass padlock with its shackle closed.", HERO, CUTOUT],
  "hero-briefcase": [SQUARE, "A deep navy leather briefcase with a top handle and two brass clasps.", HERO, CUTOUT],
  "hero-hourglass": [SQUARE, "An hourglass with a dark wooden frame and bright orange sand running from the top bulb into the bottom.", HERO, CUTOUT],
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

  // Home: one photo cutout beside each number in the stats row
  "stat-resources": [SQUARE, "A tall neat stack of teaching materials: ring binders, spiral-bound case booklets, and manila folders in deep navy, bright orange, and cream, with blank spines.", HERO, CUTOUT],
  "stat-institutions": [SQUARE, "Three small architectural scale models of different university buildings standing close together: a brick clock tower, a white domed library, and a stone hall with columns.", HERO, CUTOUT],
  "stat-instructors": [SQUARE, "A faculty ID badge on a deep navy lanyard, with a blank photo square and a large round orange check-mark seal on the badge.", HERO, CUTOUT],

  // Home: one photo cutout per discipline in Browse by discipline, keyed by discipline
  "disc-fin": [SQUARE, "A closed hardcover ledger book in deep navy with a gold ribbon bookmark, with a short stack of gold coins beside it.", HERO, CUTOUT],
  "disc-audit": [SQUARE, "A clipboard holding a blank checklist with bright orange check marks and no writing, with a large brass magnifying glass leaning against it.", HERO, CUTOUT],
  "disc-tax": [SQUARE, "A neat stack of blank paper forms held together with a large black binder clip, with a sharpened bright orange pencil lying across the top.", HERO, CUTOUT],
  "disc-ais": [SQUARE, "A stack of three glossy deep navy database disks with softly glowing blue edges, like a three-dimensional database icon.", HERO, CUTOUT],
  "disc-mgmt": [SQUARE, "Three interlocking gears, one deep navy, one bright orange, and one natural wood.", HERO, CUTOUT],
  "disc-data": [SQUARE, "A glossy three-dimensional line graph: a mid blue ribbon rising and dipping across a deep navy grid base, with bright orange spheres at its data points.", HERO, CUTOUT],
  "disc-emtech": [SQUARE, "A virtual reality headset in white and deep navy with a soft blue glow on its front panel.", HERO, CUTOUT],
  "disc-other": [SQUARE, "Four jigsaw puzzle pieces fitted together, in deep navy, bright orange, mid blue, and cream.", HERO, CUTOUT],

  // Three photo cutouts that move across each material's cover pattern, keyed by resource ID: the main one first
  "TME-0142-a": [SQUARE, "A cast-iron kettlebell in deep navy with a bright orange handle.", HERO, CUTOUT],
  "TME-0142-b": [SQUARE, "A plain gym membership key card in bright orange on a short navy lanyard, with no markings.", HERO, CUTOUT],
  "TME-0142-c": [SQUARE, "A rolled-up deep navy yoga mat tied with an orange strap.", HERO, CUTOUT],
  "TME-0157-a": [SQUARE, "A handmade ceramic vase with a deep navy glaze and a thin crack running down its side.", HERO, CUTOUT],
  "TME-0157-b": [SQUARE, "A short stack of three handmade ceramic bowls in cream and orange glazes.", HERO, CUTOUT],
  "TME-0157-c": [SQUARE, "A short stack of gold coins with one coin tipping off the top.", HERO, CUTOUT],
  "TME-0118-a": [SQUARE, "A small oak barrel with dark iron hoops.", HERO, CUTOUT],
  "TME-0118-b": [SQUARE, "A glass beer mug full of amber beer with a foamy head.", HERO, CUTOUT],
  "TME-0118-c": [SQUARE, "A polished copper brewing kettle with a curved spout.", HERO, CUTOUT],
  "TME-0127-a": [SQUARE, "An open laptop in deep navy, its screen showing a scatter of small navy dots with a few bright orange dots set apart from the cluster, and no text, numbers, or interface elements.", HERO, CUTOUT],
  "TME-0127-b": [SQUARE, "An open bound ledger book with blank ruled columns, a few rows highlighted with an orange marker.", HERO, CUTOUT],
  "TME-0127-c": [SQUARE, "A compact computer keyboard in deep navy with a few bright orange keys, all keys blank with no markings.", HERO, CUTOUT],
  "TME-0133-a": [SQUARE, "A stack of cardboard shipping boxes with one box missing from the top row.", HERO, CUTOUT],
  "TME-0133-b": [SQUARE, "A handheld barcode scanner in deep navy with a bright orange trigger.", HERO, CUTOUT],
  "TME-0133-c": [SQUARE, "A small wire shopping cart.", HERO, CUTOUT],
  "TME-0149-a": [SQUARE, "A deep navy rolling carry-on suitcase with its handle raised.", HERO, CUTOUT],
  "TME-0149-b": [SQUARE, "A long curling blank paper receipt beside a plain deep navy credit card with no markings.", HERO, CUTOUT],
  "TME-0149-c": [SQUARE, "A takeout coffee cup with a bright orange sleeve and a white lid.", HERO, CUTOUT],
  "TME-0109-a": [SQUARE, "A cardboard shipping box sealed with bright orange tape.", HERO, CUTOUT],
  "TME-0109-b": [SQUARE, "A small toy delivery truck in deep navy.", HERO, CUTOUT],
  "TME-0109-c": [SQUARE, "A clipboard holding a sheet with a hand-drawn flowchart of connected boxes and arrows, with no writing.", HERO, CUTOUT],
  "TME-0161-a": [SQUARE, "A pair of theater masks, one deep navy and one bright orange.", HERO, CUTOUT],
  "TME-0161-b": [SQUARE, "A round brass pressure gauge with its needle in an orange zone and no numbers on its face.", HERO, CUTOUT],
  "TME-0161-c": [SQUARE, "A glossy bright orange arrow sculpture pointing downward.", HERO, CUTOUT],
  "TME-0166-a": [SQUARE, "A stack of hexagonal digital token coins in deep navy and gold.", HERO, CUTOUT],
  "TME-0166-b": [SQUARE, "A heavy steel bank vault door standing slightly open.", HERO, CUTOUT],
  "TME-0166-c": [SQUARE, "A short chain of three connected glossy cubes in deep navy, mid blue, and bright orange.", HERO, CUTOUT],
  "TME-0088-a": [SQUARE, "A passenger airplane model with a deep navy and bright orange livery and no lettering.", HERO, CUTOUT],
  "TME-0088-b": [SQUARE, "A large brass key on a round orange key tag.", HERO, CUTOUT],
  "TME-0088-c": [SQUARE, "A black fountain pen with a gold nib, its cap off.", HERO, CUTOUT],
  "TME-0101-a": [SQUARE, "Two hands in a firm handshake, with deep navy and white shirt cuffs.", HERO, CUTOUT],
  "TME-0101-b": [SQUARE, "A bright orange flag on a short pole planted in a small stack of gold coins.", HERO, CUTOUT],
  "TME-0101-c": [SQUARE, "A large glossy water drop in clear mid blue.", HERO, CUTOUT],
};

/**
 * Material covers: one full-bleed image per material in each style, so the styles can be
 * compared on the site (the Covers switch) and on /library. Named `<ID>-<style>`, with a 640px
 * copy for thumbnails. Keep the keys in step with COVER_STYLES in lib/covers.ts.
 */
const COVER_STYLES = {
  photo: "Minimal editorial still-life photograph. Real objects on a plain warm off-white surface against a plain off-white wall, soft natural window light with gentle shadows, muted natural colors with small accents of deep navy and orange, lots of empty space.",
  line: "Minimal line illustration: thin, even deep navy (#13294B) ink lines on a plain off-white background, with a few small flat fills of orange (#FF5F05) and pale blue (#E8EEF6). No shading, no gradients, lots of empty space.",
  riso: "Risograph print illustration in two inks, deep navy blue and fluorescent orange, on off-white paper. Flat simple shapes with grainy texture, halftone dots, and slight misregistration between the inks.",
  watercolor: "Loose watercolor illustration on white cold-press paper: soft washes of deep navy, mid blue, and orange with gently bleeding edges, visible paper texture, and light pencil lines, lots of white space.",
  collage: "Cut-paper collage illustration: layered flat paper shapes in deep navy, orange, mid blue, and cream with subtle paper grain and soft shadows between the layers, on a plain cream background.",
};
const BANNER =
  "Wide horizontal composition: the subject sits in a band across the middle of the frame, centered, with only plain background above and below, so the image can be cropped to a wide banner. " +
  "No text, no letters, no numbers, no logos.";
const COVER = { width: 1280, small: 640, opaque: true };
const COVER_SUBJECTS = {
  "TME-0142": "A gym membership bundle laid out in a row: a kettlebell, a rolled yoga mat, a water bottle, and a membership key card on a lanyard.",
  "TME-0157": "A row of handmade ceramic vases and bowls on a potter's workbench, one vase with a thin crack, and a short stack of coins at the end of the row.",
  "TME-0118": "A small craft brewery: two oak barrels and a copper brewing kettle, with three glasses of amber beer lined up in front.",
  "TME-0127": "An open laptop whose screen shows a scatter of dots with a few outliers, beside an open ledger book and a magnifying glass.",
  "TME-0133": "A retail stockroom shelf of cardboard boxes with one gap where a box is missing, and a handheld barcode scanner resting on the shelf edge.",
  "TME-0149": "Travel and expense items in a row: a carry-on suitcase, a takeout coffee cup, a folded paper map, and a loose pile of blank receipts.",
  "TME-0109": "An order-to-cash flow from left to right: a small stack of shipping boxes, a delivery truck, and a stack of copper coins, joined by a dotted path.",
  "TME-0161": "A small meeting table with three empty chairs, a pair of theater masks resting on the table, and a line chart that dips sharply on a whiteboard behind it.",
  "TME-0166": "An open bank vault door with a neat stack of hexagonal digital tokens and a rolled bond certificate tied with a ribbon inside.",
  "TME-0088": "A regional passenger airplane parked beside an open hangar, with a large brass key in the foreground.",
  "TME-0101": "Two office buildings on either side of a calm river, joined by a small footbridge, with a milestone flag on the far bank.",
};
for (const [id, subject] of Object.entries(COVER_SUBJECTS)) {
  for (const [style, line] of Object.entries(COVER_STYLES)) IMAGES[`${id}-${style}`] = [WIDE, subject, `${line} ${BANNER}`, COVER];
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function generate(name) {
  const [size, subject, style = STYLE, { width, small, opaque = false } = {}] = IMAGES[name];
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt: `${subject} ${style}`,
      size,
      quality: "low",
      background: opaque ? "opaque" : "transparent",
      output_format: "webp",
      output_compression: 80,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${name}: ${body.error?.message || res.status}`);
  const image = Buffer.from(body.data[0].b64_json, "base64");
  const save = async (file, w) => writeFile(join(OUT_DIR, file), w ? await sharp(image).resize({ width: w }).webp({ quality: 80 }).toBuffer() : image);
  await save(`${name}.webp`, width);
  if (small) await save(`${name}-sm.webp`, small);
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
