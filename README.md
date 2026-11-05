# Teaching Materials Exchange prototype

A clickable prototype of the Teaching Materials Exchange: free, classroom-ready teaching materials from business school faculty. Built from the Claude Design handoff (Editorial direction).

## Stack

- **[vinext](https://github.com/cloudflare/vinext)**: the Next.js App Router API on Vite
- **Cloudflare Workers**: deployed with `@vinext/cloudflare` and `cf` (`cloudflare.config.ts`)
- **[Base UI](https://base-ui.com)** (`@base-ui/react`): unstyled, accessible primitives (menus, selects, checkboxes, radios, switches, dialogs, tabs, toasts)
- **[Lucide](https://lucide.dev)** (`lucide-react`): line icons
- **[Tabbied](https://tabbied.com)** (`tabbied`): generative pattern covers
- **Plain CSS**: design tokens in `app/globals.css`, CSS Modules per component. No Tailwind.
- **Images**: generated with OpenAI's GPT Image 2.6 (`gpt-image-2.6-sunburst`, or `gpt-image-2.6-flare`) at low quality, all with transparent backgrounds (`public/images`)

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build for Workers
npm run start     # preview the built Worker locally
npm run deploy    # deploy to Cloudflare Workers (needs `cf auth login` or CLOUDFLARE_API_TOKEN)
```

## Deploy

Cloudflare Workers Builds deploys the `materials-exchange-prototype` Worker from this repository:

| Branch | What Workers Builds does |
| --- | --- |
| `main` | Builds and deploys to production |
| Any other branch | Builds a [Worker Preview](https://developers.cloudflare.com/workers/previews/) and comments its URL on the pull request. The URL stays the same as you push to the branch. |

GitHub Actions (`CI`) typechecks, builds, and validates every pull request and every push to `main`. It needs no secrets.

### Workers Builds settings

The project uses a typed `cloudflare.config.ts`, which deploys with the Cloudflare CLI (`cf`), not Wrangler. In the Cloudflare dashboard, open the Worker and go to **Settings > Build**:

| Setting | Value |
| --- | --- |
| Build command | Leave empty. `cf` builds the project. |
| Deploy command | `npx cf deploy` |
| Preview command | `npx cf previews deploy` |
| Branch control | Production branch `main`, with **Enable Preview Builds** checked |

With the default commands, builds fail because the project has no Wrangler configuration file:

- `npx wrangler deploy` fails with "Missing entry-point to Worker script or to assets directory".
- `npx wrangler preview` fails with "Your Wrangler configuration is missing a `previews` block to run this command".

Each Preview keeps its own copy of the build settings it was created with. If you change the Preview command, Previews that already exist keep running the old one (the build log's `Executing user deploy command` line shows which). Update them too: the Cloudflare API's Update Worker build configuration call (`PATCH /accounts/{account_id}/builds/workers/{script_tag}`) applies a new Preview command to every existing Preview when you pass `patch_existing_previews=true`.

## Demo state

There is no backend. Use the **View as** switch (bottom right, or in the admin sidebar) to see the site as a guest, a verified instructor, or an admin.

- Who you are signed in as lives in a `tme-demo` cookie, so pages render the right access state on the server.
- Everything else you do (saves, downloads, drafts, admin edits) lives in `localStorage` on your browser.
- Signing out resets the demo.

## Pages

| Path | Screen |
| --- | --- |
| `/` | Home |
| `/browse` | Browse, with filters, sort, grid or list view, and 20 materials a page |
| `/r/0142` | Resource (`?own=1` shows it to its authors) |
| `/r/0142/files/lakeside-solution.xlsx` | File, locked or unlocked by access |
| `/verify` | Verify instructor status (`?state=expired` and other states) |
| `/contribute` | Contribute a resource, five steps. It's a prototype, so nothing is checked: open any step from the progress bar, in any order, and submit with fields empty |
| `/sign-in`, `/reset-password` | Sign in, create account, reset password (`?expired=1`) |
| `/account` | Account |
| `/authors/dana-whitfield` | Author profile |
| `/about` | About the exchange: why it exists, what it holds to, who runs it, and who supports it |
| `/licenses` | Licenses: what each Creative Commons license lets people do. CC BY 4.0 is the default |
| `/r/0066`, `/r/0999` | Unpublished resource, page not found |
| `/admin` | Dashboard |
| `/admin/verification`, `/admin/verification/akim` | Verification queue and decision |
| `/admin/submissions`, `/admin/submissions/TME-0171` | Submissions and review |
| `/admin/materials`, `/admin/materials/TME-0142` | Materials and edit material |
| `/admin/users`, `/admin/users/praman` | Users and edit user |
| `/admin/emails` | Every email the exchange sends (`?t=ver-ok` opens one) |
| `/library` | Image library: every material cover, author portrait, and 3D object image (linked from the footer) |

## Layout

```
app/
  (site)/        public pages: home, browse, resource, sign in, verify, contribute, account, author
  admin/         admin screens: dashboard, verification, submissions, materials, users, emails
components/
  ui/            Base UI wrappers: Button, Badge, controls (Checkbox, Select, RadioCards, Switch, TextField, Segmented), overlays (Menu, Modal, Tabs, Disclosure, Toast)
  site/          SiteHeader, SiteFooter, PatternCover, MaterialCover, CutoutRain, Illustration, AuthorAvatar, SplitArt, ResourceCard, DividedGrid, ViewAs, Mark
  admin/         AdminShell, AdminCollection (shared table), queues, review, dashboard, emails, edit pages
  pages/         page-level views
lib/
  data.ts        sample content and author profiles (all people and most institutions are fictional)
  overviews.ts   each material's overview (a few paragraphs) and learning objectives
  admin-data.ts  applicants, submissions, and users for the admin screens
  emails.ts      every email template shown on the admin Emails page
  demo.tsx       demo state provider
  pattern.ts     discipline to Tabbied design and palette mapping
  covers.ts      material cover image files
```

## Pattern covers

[Tabbied](https://tabbied.com) patterns (`tabbied/react`) fill the home hero, a decorative band on the home page, the art beside forms like sign-in, and the cover of any material without a cover image, such as a new submission. The discipline picks the design (Bloks, Maze, Trigram, Metro, Weave, Terrain, Comet, Tesserae); the seed (usually the resource ID) keeps the same pattern for the same thing:

- The home hero uses Mixtape in light grays (`NEUTRAL_PALETTE` in `lib/pattern.ts`), so the color photos on it stand out.
- Between Browse by discipline and How it works, a tall, full-width band of Curl loops in the brand's navy, orange, and blue at full strength (`CURL_PALETTE`) runs edge to edge. Its ground is transparent (`PatternCover`'s `transparent`), so the page shows through the loops.
- A material without a cover image uses slightly deeper grays (`COVER_NEUTRAL_PALETTE`), unless its contributor picked a colored palette.
- The art beside forms keeps its discipline's colors.

Patterns are decorative and hidden from assistive technology. Covers change slowly, unless the visitor prefers reduced motion or turns animations off in the footer.

## Illustrations

Each public page has a spot illustration (the admin screens stay plain), and each How it works step has one. Each resource has one in the body of its page (`public/images/TME-0142.webp` and so on). They are WebP files with transparent backgrounds, made by `scripts/generate-images.mjs` with OpenAI's GPT Image 2.6 at low quality. The script always uses a 2.6 variant: `gpt-image-2.6-sunburst` unless `IMAGE_MODEL=gpt-image-2.6-flare` picks the other one, and it refuses any other model. Images made before the switch came from GPT Image 2.5 and are kept as they are. Every illustration prompt shares one style line that limits the palette to the site's navy, orange, and blue. Like the patterns, the illustrations are decorative, so they have empty alt text.

The home hero uses a second style: color photo cutouts that sit straight on the pattern, with no disc. Nineteen of them rain down the pattern (`home-hero-photo.webp` and the `hero-*.webp` files), showing academia, institutions, and the disciplines the exchange covers. Each falls in its own lane, left to right in the order of `HERO_CUTOUTS` in `HomeView.tsx`, and passes behind the title panel (`CutoutRain`). Drops come in three sizes, and the bigger ones fall faster, which gives the rain some depth. On a narrow screen, every other lane is left out. Photo prompts share their own style line, which asks for a true-color studio photo cut out like a collage element. The hero prompts also ask each subject to fill its frame, so the cutouts look the same scale. They're shown at about 130px or less, so the script saves them 320px wide. The illustration the hero used before (`home-hero.webp`) is kept so it can be switched back.

The same photo style is used in a few more places:

- **Stats:** each number in the home page's stats row has one cutout beside it (`stat-*.webp`).
- **Disciplines:** each tile in Browse by discipline is a cutout (`disc-fin.webp` and so on) instead of a pattern.
- **Materials:** the first eleven resources have three cutouts each (`TME-0142-a.webp` to `TME-0142-c.webp`). They were on their covers and aren't on the site right now, but they're kept for reuse.

- **Contribute steps:** each step in the contribute form's progress bar has a cutout (`step-files.webp` to `step-review.webp`). Steps ahead of the current one are a little faded.

Beside the call to action above the footer, two frosted, almost-white 3D objects float on the pale blue-gray (`cta-cap.webp`, `cta-plane.webp`). Their prompts share the `FROSTED` style line.

The About page has seven loose watercolors in the style of the material covers (`about-hero.webp`, `about-why.webp`, and so on). Their prompts share the `ABOUT` style line: the covers' `WATERCOLOR` line, with one subject and room around it instead of a banner.

### Author portraits

Every author has a head-and-shoulders photo (`author-dana-whitfield.webp` and so on, named with `authorSlug`), shown in a circle on cards, in the Authors section of a material's page, beside the name on author pages, and in the account menu (`AuthorAvatar`). The script describes each person in one line (`AUTHORS`), and every portrait shares the `PORTRAIT` style line, so they match. They're shown at 160px or less, so they're saved 400px wide. Someone without a portrait, like a co-author typed into a new submission, gets their initials instead. Each author's title, ORCID, and first year contributing are in `AUTHORS` in `lib/data.ts`.

`/library` lists every one of these 3D objects and portraits with its file name. Show one with `<Illustration name="…" />`. A new one matches the rest if its script entry uses the `HERO` style line.

### Material covers

Each published material's cover (cards, list rows, its page, and thumbnails in the account, verify, and admin screens) is a loose watercolor in navy, blue, and orange (`TME-0142-watercolor.webp` and so on, `coverFiles` in `lib/covers.ts`). Its background is transparent, so the washes sit on a cool paper white (`--cover-ground`). Each image is saved 1280px wide with a 640px copy (`-sm`) for thumbnails, and every cover tells the browser how wide it shows (`sizes`) so it loads the smaller file where that's enough.

Every cover prompt shares the `WATERCOLOR` style line and one composition line: the subject sits in a band across the middle, with empty space above and below. Covers show the whole image, scaled down to fit inside the cover's box with room on every side (`--cover-pad-x` and `--cover-pad-y` in `MaterialCover.module.css`), so a cover reads as a small picture on the pale ground. On a material's page the cover is a small picture beside the title, and above it on a narrow screen.

```bash
OPENAI_API_KEY=... node scripts/generate-images.mjs           # make any images that are missing
OPENAI_API_KEY=... node scripts/generate-images.mjs TME-0142  # make a new version of one image
```

Every resource expects two images named after its ID: the illustration in the body of its page and its watercolor cover. A new resource in `lib/data.ts` needs a subject in `MATERIAL_SUBJECTS` in the script, which makes both, and a new author needs a line in the script's `AUTHORS` and an entry in `AUTHORS` in `lib/data.ts`.

## Motion

Besides the patterns, the hero cutouts rain down, on the home page's How it works the dots march along the path and each step's picture bobs, and the frosted objects beside the call to action drift up and down. The footer's **Pause animations** button stops all of them where they are. If the visitor prefers reduced motion, they don't run at all, and the button is hidden.
