# Teaching Materials Exchange prototype

A clickable prototype of the Teaching Materials Exchange: free, classroom-ready teaching materials from business school faculty. Built from the Claude Design handoff (Editorial direction).

## Stack

- **[vinext](https://github.com/cloudflare/vinext)**: the Next.js App Router API on Vite
- **Cloudflare Workers**: deployed with `@vinext/cloudflare` and `cf` (`cloudflare.config.ts`)
- **[Base UI](https://base-ui.com)** (`@base-ui/react`): unstyled, accessible primitives (menus, selects, checkboxes, radios, switches, dialogs, tabs, toasts)
- **[Lucide](https://lucide.dev)** (`lucide-react`): line icons
- **Plain CSS**: design tokens in `app/globals.css`, CSS Modules per component. No Tailwind.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build for Workers
npm run start     # preview the built Worker locally
npm run deploy    # deploy to Cloudflare Workers (needs `cf auth login` or CLOUDFLARE_API_TOKEN)
```

## Demo state

There is no backend. Use the **View as** switch (bottom right, or in the admin sidebar) to see the site as a guest, a verified instructor, or an admin.

- Who you are signed in as lives in a `tme-demo` cookie, so pages render the right access state on the server.
- Everything else you do (saves, downloads, drafts, admin edits) lives in `localStorage` on your browser.
- Signing out resets the demo.

## Layout

```
app/
  (site)/        public pages: home, browse, resource, sign in, verify, contribute, account, author
  admin/         admin screens: dashboard, verification, submissions, materials, users, emails
components/
  ui/            Base UI wrappers: Button, Badge, controls (Checkbox, Select, RadioCards, Switch, TextField, Segmented), overlays (Menu, Modal, Tabs, Disclosure, Toast)
  site/          SiteHeader, SiteFooter, PatternCover, ResourceCard, ViewAs, Mark
  admin/         AdminShell
  pages/         page-level views
lib/
  data.ts        sample content (all people and most institutions are fictional)
  demo.tsx       demo state provider
  pattern.ts     discipline to pattern mapping for covers
```

## Pattern covers

Each resource gets a generated pattern cover. The discipline picks the pattern and palette; the resource ID sets the seed, so the same resource always gets the same cover. Patterns are decorative and hidden from assistive technology. Covers change slowly, unless the visitor prefers reduced motion or turns animations off in the footer.
