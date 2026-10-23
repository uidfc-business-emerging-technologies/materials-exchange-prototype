# Teaching Materials Exchange prototype

A clickable prototype of the Teaching Materials Exchange: free, classroom-ready teaching materials from business school faculty. Built from the Claude Design handoff (Editorial direction).

## Stack

- **[vinext](https://github.com/cloudflare/vinext)**: the Next.js App Router API on Vite
- **Cloudflare Workers**: deployed with `@vinext/cloudflare` and `cf` (`cloudflare.config.ts`)
- **[Base UI](https://base-ui.com)** (`@base-ui/react`): unstyled, accessible primitives (menus, selects, checkboxes, radios, switches, dialogs, tabs, toasts)
- **[Lucide](https://lucide.dev)** (`lucide-react`): line icons
- **[Tabbied](https://tabbied.com)** (`tabbied`): generative pattern covers
- **Plain CSS**: design tokens in `app/globals.css`, CSS Modules per component. No Tailwind.

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

With the default deploy command, `npx wrangler deploy`, the build fails with "Missing entry-point to Worker script or to assets directory", because the project has no Wrangler configuration file.

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
  site/          SiteHeader, SiteFooter, PatternCover, ResourceCard, ViewAs, Mark
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

Each resource gets a [Tabbied](https://tabbied.com) pattern cover (`tabbied/react`). The discipline picks the design (Bloks, Maze, Trigram, Metro, Weave, Terrain, Comet, Tesserae) and palette; the resource ID is the seed, so the same resource always gets the same cover. Patterns are decorative and hidden from assistive technology. Covers change slowly, unless the visitor prefers reduced motion or turns animations off in the footer.
