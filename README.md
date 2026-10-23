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

GitHub Actions deploys the `materials-exchange-prototype` Worker with the Cloudflare CLI (`cf`):

| Workflow | When | What it does |
| --- | --- | --- |
| `Production` | Every push to `main`, or run by hand from the Actions tab | Typechecks, builds, and deploys to the production Worker |
| `Preview` | Every pull request | Typechecks, builds, and validates the production build. Then deploys a [Worker Preview](https://developers.cloudflare.com/workers/previews/) named `pr-<number>` and comments its URL on the pull request. The URL stays the same for the life of the pull request. The Preview is deleted when the pull request closes. |

The first deploy creates the Worker, so there is nothing to set up in the Cloudflare dashboard. Pull requests from forks get the checks but no Preview, because GitHub doesn't give forks the repository secrets.

### One-time setup

1. In the Cloudflare dashboard, create an API token at **My Profile > API Tokens > Create Token > Custom token** with these permissions:
   - **Account > Workers > Admin**, for all Workers in the account. Creating a Worker needs Admin. After the first deploy, you can narrow it to **Editor** on this one Worker.
   - **Account > Account Settings > Read**
2. Copy the account ID from **Workers & Pages** in the dashboard sidebar.
3. In GitHub, go to **Settings > Secrets and variables > Actions** and add two repository secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

Until the secrets are set, `Preview` still runs the checks and warns that it skipped the Preview, and `Production` fails with a message that names the missing secrets.

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
