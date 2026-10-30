# Teaching Materials Exchange prototype

A clickable prototype of the Teaching Materials Exchange: free, classroom-ready teaching materials from business school faculty. Built from the Claude Design handoff (Editorial direction).

## Stack

- **[vinext](https://github.com/cloudflare/vinext)**: the Next.js App Router API on Vite
- **Cloudflare Workers**: deployed with `@vinext/cloudflare` and `cf` (`cloudflare.config.ts`)
- **[Base UI](https://base-ui.com)** (`@base-ui/react`): unstyled, accessible primitives (menus, selects, checkboxes, radios, switches, dialogs, tabs, toasts)
- **[Lucide](https://lucide.dev)** (`lucide-react`): line icons
- **[Tabbied](https://tabbied.com)** (`tabbied`): generative pattern covers
- **Plain CSS**: design tokens in `app/globals.css`, CSS Modules per component. No Tailwind.
- **Illustrations**: generated with OpenAI's `gpt-image-2.5-sunburst` (`public/images`)

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
| `/browse` | Browse, with filters, sort, and grid or list view |
| `/r/0142` | Resource (`?own=1` shows it to its authors) |
| `/r/0142/files/lakeside-solution.xlsx` | File, locked or unlocked by access |
| `/verify` | Verify instructor status (`?state=expired` and other states) |
| `/contribute` | Contribute a resource, five steps |
| `/sign-in`, `/reset-password` | Sign in, create account, reset password (`?expired=1`) |
| `/account` | Account |
| `/authors/dana-whitfield` | Author profile |
| `/r/0066`, `/r/0999` | Unpublished resource, page not found |
| `/admin` | Dashboard |
| `/admin/verification`, `/admin/verification/akim` | Verification queue and decision |
| `/admin/submissions`, `/admin/submissions/TME-0171` | Submissions and review |
| `/admin/materials`, `/admin/materials/TME-0142` | Materials and edit material |
| `/admin/users`, `/admin/users/praman` | Users and edit user |
| `/admin/emails` | Every email the exchange sends (`?t=ver-ok` opens one) |

## Layout

```
app/
  (site)/        public pages: home, browse, resource, sign in, verify, contribute, account, author
  admin/         admin screens: dashboard, verification, submissions, materials, users, emails
components/
  ui/            Base UI wrappers: Button, Badge, controls (Checkbox, Select, RadioCards, Switch, TextField, Segmented), overlays (Menu, Modal, Tabs, Disclosure, Toast)
  site/          SiteHeader, SiteFooter, PatternCover, MaterialCover, CutoutRain, Illustration, SplitArt, ResourceCard, DividedGrid, ViewAs, Mark
  admin/         AdminShell, AdminCollection (shared table), queues, review, dashboard, emails, edit pages
  pages/         page-level views
lib/
  data.ts        sample content (all people and most institutions are fictional)
  admin-data.ts  applicants, submissions, and users for the admin screens
  emails.ts      every email template shown on the admin Emails page
  demo.tsx       demo state provider
  pattern.ts     discipline to Tabbied design and palette mapping
```

## Pattern covers

Each resource gets a [Tabbied](https://tabbied.com) pattern cover (`tabbied/react`). The discipline picks the design (Bloks, Maze, Trigram, Metro, Weave, Terrain, Comet, Tesserae); the resource ID is the seed, so the same resource always gets the same cover. Covers that show color photos are in grays, so the photos stand out:

- The home hero uses Mixtape in light grays (`NEUTRAL_PALETTE` in `lib/pattern.ts`).
- Material covers (`MaterialCover`) use slightly deeper grays (`COVER_NEUTRAL_PALETTE`). They're small, have no border, and several designs are thin lines, which the lighter grays would lose against the white page. A contributor can still pick a colored palette for a new submission's cover.
- Other patterns, such as the art beside the sign-in form, keep their discipline's colors.

Patterns are decorative and hidden from assistive technology. Covers change slowly, unless the visitor prefers reduced motion or turns animations off in the footer.

## Illustrations

Each public page has a spot illustration (the admin screens stay plain), and each How it works step has one. Each resource has one in the body of its page (`public/images/TME-0142.webp` and so on). They are WebP files with transparent backgrounds, made by `scripts/generate-images.mjs` with OpenAI's `gpt-image-2.5-sunburst` at low quality. Every illustration prompt shares one style line that limits the palette to the site's navy, orange, and blue. Like the patterns, the illustrations are decorative, so they have empty alt text.

The home hero uses a second style: color photo cutouts that sit straight on the pattern, with no disc. Nineteen of them rain down the pattern (`home-hero-photo.webp` and the `hero-*.webp` files), showing academia, institutions, and the disciplines the exchange covers. Each falls in its own lane, left to right in the order of `HERO_CUTOUTS` in `HomeView.tsx`, and passes behind the title panel (`CutoutRain`). Drops come in three sizes, and the bigger ones fall faster, which gives the rain some depth. On a narrow screen, every other lane is left out. Photo prompts share their own style line, which asks for a true-color studio photo cut out like a collage element. The hero prompts also ask each subject to fill its frame, so the cutouts look the same scale. They're shown at about 130px or less, so the script saves them 320px wide. The illustration the hero used before (`home-hero.webp`) is kept so it can be switched back.

The same photo style is used in two more places:

- **Stats:** each number in the home page's stats row has one cutout beside it (`stat-*.webp`).
- **Disciplines:** each tile in Browse by discipline is a cutout (`disc-fin.webp` and so on) instead of a pattern.
- **Material covers:** each resource has three cutouts (`TME-0142-a.webp` to `TME-0142-c.webp`, the main one first). They move slowly to the left across its cover in a seamless loop, about half the cover's height, and fade in and out at the edges. Each cover's speed and starting point come from the resource ID, so a grid of cards doesn't move in step. A thumbnail under 64px tall shows only the main cutout, standing still. On the resource page, the cutouts keep clear of the title panel.

```bash
OPENAI_API_KEY=... node scripts/generate-images.mjs           # make any images that are missing
OPENAI_API_KEY=... node scripts/generate-images.mjs TME-0142  # make a new version of one image
```

Every resource expects four images named after its ID (the illustration and three cutouts), so a new resource in `lib/data.ts` needs four entries in the script too.

## Motion

Besides the pattern covers, the hero cutouts rain down, material covers' cutouts move across them, and on the home page's How it works, the dots march along the path and each step's picture bobs. The footer's **Pause animations** button stops all of them where they are. If the visitor prefers reduced motion, they don't run at all, and the button is hidden.
