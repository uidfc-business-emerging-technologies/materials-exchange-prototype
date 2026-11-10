# Teaching Materials Exchange prototype

A clickable prototype of the Teaching Materials Exchange: free, classroom-ready teaching materials from business school faculty. Built from the Claude Design handoff (Editorial direction).

## Stack

- **[vinext](https://github.com/cloudflare/vinext)**: the Next.js App Router API on Vite
- **Cloudflare Workers**: deployed with `@vinext/cloudflare` and `cf` (`cloudflare.config.ts`)
- **[Base UI](https://base-ui.com)** (`@base-ui/react`): unstyled, accessible primitives (menus, selects, checkboxes, radios, switches, dialogs, tabs, toasts)
- **[Lucide](https://lucide.dev)** (`lucide-react`): line icons
- **[Tabbied](https://tabbied.com)** (`tabbied`): generative patterns for the home hero and the art beside forms
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

## Links and categories

Text links have no underline; one appears on hover (`app/globals.css`). The header menu keeps its orange underline under the current page.

Every page sets `robots: noindex, nofollow` in the root layout's metadata, so search engines leave the prototype out. Footer and other links open a page at the top of the window.

A material's type and disciplines link to Browse with that filter applied, wherever they appear: card and list kickers, the breadcrumb, kicker, and facts on its page, and the account page (`CategoryLine` and `DisciplineLinks`). A discipline line with two areas links each one: "Emerging technology and audit" links Emerging technology and Audit, and "analytics" links Data analytics. A line that isn't a discipline of its own, like Ethics, links to the material's discipline (Other).

## Demo state

There is no backend. Use the **View as** switch (bottom right, or in the admin sidebar) to see the site as a guest, a verified instructor, or an admin.

- Who you are signed in as lives in a `tme-demo` cookie, so pages render the right access state on the server.
- Everything else you do (saves, downloads, drafts, admin edits) lives in `localStorage` on your browser.
- Signing out resets the demo.

## Pages

| Path | Screen |
| --- | --- |
| `/` | Home |
| `/browse` | Browse, with filters, sort, grid or list view, and 20 materials a page. The search, filters, sort, and page are in the URL (`/browse?disc=Audit&tools=Excel&sort=newest&page=2`), so Back and shared links show the same results |
| `/r/0142` | Resource (`?own=1` shows it to its authors) |
| `/r/0142/files/lakeside-solution.xlsx` | File, locked or unlocked by access |
| `/verify` | Verify instructor status (`?state=expired` and other states) |
| `/contribute` | Contribute a resource, five steps. It's a prototype, so nothing is checked: open any step from the progress bar, in any order, and submit with fields empty. Add a co-author who's a member by their email (try `kmensah@eastmoor.edu`) |
| `/sign-in`, `/reset-password` | Sign in, create account (passwords of 8 or more characters), reset password (`?expired=1`). Sign in and Create account each have a watercolor on a quiet Northstar pattern |
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
  covers.ts      material cover image files, and the placeholder covers
```

## Pattern covers

[Tabbied](https://tabbied.com) patterns (`tabbied/react`) fill the home hero, a decorative band on the home page, and the art beside forms like sign-in. Material covers are watercolors, not patterns (see Material covers). The discipline picks the design (Bloks, Maze, Trigram, Metro, Weave, Terrain, Comet, Tesserae); the seed keeps the same pattern for the same thing:

- The home hero uses Mixtape in light grays (`NEUTRAL_PALETTE` in `lib/pattern.ts`), so the color photos on it stand out.
- Between Browse by discipline and How it works, a tall, full-width band of Curl loops in very light neutral grays (`CURL_PALETTE`) runs edge to edge, fading in at the top and out at the bottom. Its ground is transparent (`PatternCover`'s `transparent`), so the page shows through the loops.
- The art beside forms keeps its discipline's colors.

Patterns are decorative and hidden from assistive technology. Covers change slowly, unless the visitor prefers reduced motion or turns animations off in the footer.

## Illustrations

Each public page has a spot illustration (the admin screens stay plain). Each resource has one in the body of its page (`public/images/TME-0142.webp` and so on); for the thirty materials from earlier in 2026 (`TME-0036` to `TME-0065`), that picture is a watercolor instead (see Material covers). They are WebP files with transparent backgrounds, made by `scripts/generate-images.mjs` with OpenAI's GPT Image 2.6 at low quality. The script always uses a 2.6 variant: `gpt-image-2.6-sunburst` unless `IMAGE_MODEL=gpt-image-2.6-flare` picks the other one, and it refuses any other model. Every illustration prompt shares one style line that limits the palette to the site's navy, orange, and blue. Like the patterns, the illustrations are decorative, so they have empty alt text.

The home hero uses a second style: color photo cutouts that sit straight on the pattern, with no disc. Nineteen of them rain down the pattern (`home-hero-photo.webp` and the `hero-*.webp` files), showing academia, institutions, and the disciplines the exchange covers. Each falls in its own lane, left to right in the order of `HERO_CUTOUTS` in `HomeView.tsx`, and passes behind the title panel (`CutoutRain`). Drops come in three sizes, and the bigger ones fall faster, which gives the rain some depth. On a narrow screen, every other lane is left out. Photo prompts share their own style line, which asks for a true-color studio photo cut out like a collage element. The hero prompts also ask each subject to fill its frame, so the cutouts look the same scale. They're shown at about 130px or less, so the script saves them 320px wide. The illustration the hero used before (`home-hero.webp`) is kept so it can be switched back.

The same photo style is used in a few more places:

- **Stats:** each number in the home page's stats row has one cutout beside it (`stat-*.webp`).
- **Disciplines:** each tile in Browse by discipline is a cutout (`disc-fin.webp` and so on) instead of a pattern.
- **Materials:** the first eleven resources have three cutouts each (`TME-0142-a.webp` to `TME-0142-c.webp`). They were on their covers and aren't on the site right now, but they're kept for reuse.

- **Contribute steps:** each step of the contribute form has a cutout (`step-files.webp` to `step-review.webp`). They were in its progress bar and aren't on the site right now, but they're kept for reuse. The progress bar is plain: a segment for each step, then the step's number beside its name. The number is navy for the current step and the ones done, and muted for steps ahead; the segment shows which are done. On a phone, only the current step shows its name.

Beside the call to action above the footer, two frosted, almost-white 3D objects float on the pale blue-gray (`cta-cap.webp`, `cta-plane.webp`). Their prompts share the `FROSTED` style line.

The About page has loose watercolors in the style of the material covers (`about-hero.webp`, `about-why.webp`, and so on). Their prompts share the `ABOUT` style line: the covers' `WATERCOLOR` line, with one subject and room around it instead of a banner. Who runs the exchange shows the Commons atrium inside the Business Instructional Facility at Gies College of Business (`about-bif.webp`), painted from a photo of it, so its prompt uses the `VIGNETTE` line: the same watercolor, fading out at every edge. The railing it first had along the bottom was taken out with the Images API's edit endpoint, and the prompt now asks for an open view with no railing. The generic hall it replaced (`about-center.webp`) is kept.

The same `ABOUT` style is used in two more places:

- **How it works:** each of the three steps on the home page has a watercolor (`how-find-watercolor.webp` and so on). The flat illustrations they replaced (`how-find.webp` and so on) are kept.
- **Before you submit:** at the end of the contribute form, each statement has its own small watercolor beside it (`attest-rights.webp`, `attest-privacy.webp`, `attest-company.webp`, `attest-original.webp`). The rows aren't cards: space and a thin line above each one set them apart, and the whole row, picture included, is the checkbox's label.

### Author portraits

Every author has a head-and-shoulders photo (`author-dana-whitfield.webp` and so on, named with `authorSlug`), shown in a circle on cards, in the Authors section of a material's page, beside the name on author pages, and in the account menu (`AuthorAvatar`). The script describes each person in one line (`AUTHORS`), and every portrait shares the `PORTRAIT` style line, so they match. They're shown at 160px or less, so they're saved 400px wide. Members who aren't authors yet, like the instructors and admins in the admin Users list, have portraits in the same style, named the same way (`MEMBERS` in the script, `MEMBER_PORTRAITS` in `lib/data.ts`); the Users table and each user's edit page show them in a circle. Someone without a portrait, like a co-author typed into a new submission or an account that just signed up, gets their initials instead.

### Lists, not cards

List items are rows, not cards: space and a thin line set them apart. That covers the authors and uploaded files in the contribute form, its Before you submit statements, and the authors on a material's page. Cards are kept where a box is the best fit: a preview of how a material's card will look, the Files download panel and the citation on a material's page, the dashed Add a co-author area, and notices.

### Co-authors who are members

In the contribute form's Authors step, a contributor can find a member of the exchange by the email they sign in with and add them as a co-author. Their name, title, and institution come from their profile, so the row has a Member badge and can be removed but not edited. Only a full email finds someone, so the form can't be used to browse the members. Someone who isn't a member is still added by typing in their details. In the prototype, every author is a member (`MEMBERS` in `lib/data.ts`), with an email made from their first initial, last name, and school, like `kmensah@eastmoor.edu`. Each author's title, ORCID, and first year contributing are in `AUTHORS` in `lib/data.ts`.

`/library` lists every one of these 3D objects and portraits with its file name. Show one with `<Illustration name="…" />`. A new one matches the rest if its script entry uses the `HERO` style line.

### Material covers

Each published material's cover (cards, list rows, its page, and thumbnails in the account, verify, and admin screens) is a loose watercolor in navy, blue, and orange (`TME-0142-watercolor.webp` and so on, `coverFiles` in `lib/covers.ts`). Its background is transparent, so the washes sit on a cool paper white (`--cover-ground`). Each image is saved 1280px wide with a 640px copy (`-sm`) for thumbnails, and every cover tells the browser how wide it shows (`sizes`) so it loads the smaller file where that's enough.

A material without its own cover yet, such as a new submission, shows one of four placeholder watercolors in the same style (`placeholder-1-watercolor.webp` to `placeholder-4-watercolor.webp`, `PLACEHOLDER_COVERS` in `lib/covers.ts`). The resource ID picks which one, and the contribute form's cover preview can shuffle through them; the one picked follows the submission to its page and My resources.

Every cover prompt shares the `WATERCOLOR` style line and one composition line: the subject sits in a band across the middle, with empty space above and below. Covers show the whole image, scaled down to fit inside the cover's box with room on every side (`--cover-pad-x` and `--cover-pad-y` in `MaterialCover.module.css`), so a cover reads as a small picture on the pale ground. On a material's page the cover is a wide banner, and the title's white panel is raised into its bottom left corner. The watercolor sits at about half the banner's width, centered in the part the panel leaves open, so the panel never hides its subject; a tall one fades out softly where the banner crops it.

```bash
OPENAI_API_KEY=... node scripts/generate-images.mjs           # make any images that are missing
OPENAI_API_KEY=... node scripts/generate-images.mjs TME-0142  # make a new version of one image
```

Every resource expects two images named after its ID: the picture in the body of its page and its watercolor cover. For most materials, the picture is a flat illustration, and one subject in `MATERIAL_SUBJECTS` in the script makes both. The thirty materials from earlier in 2026 (`TME-0036` to `TME-0065`) are in `WATERCOLOR_MATERIALS` instead, with two subjects each: the cover's scene, and a closer subject for the page, painted in the About page's `ABOUT` style (one subject with room around it) and saved 1120px wide. A new resource should go in `WATERCOLOR_MATERIALS`. A new author needs a line in the script's `AUTHORS` and an entry in `AUTHORS` in `lib/data.ts`.

## Motion

Besides the patterns, the hero cutouts rain down, on the home page's How it works the dots march along the path and each step's picture bobs, and the frosted objects beside the call to action drift up and down. The footer's **Pause animations** button stops all of them where they are. If the visitor prefers reduced motion, they don't run at all, and the button is hidden.
