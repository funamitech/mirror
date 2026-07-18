# YuruMirror

Website and nginx fancyindex theme for [mirror.funami.tech](https://mirror.funami.tech) —
fast, laid-back package mirrors for Arch-based distros, served from Seoul.

## Tech stack

- Tailwind CSS 4 (CSS-first config in `src/assets/css/input.css` — no `tailwind.config.js`)
- A ~90-line template builder (`build.js`) that expands shared partials into static pages
- Vanilla JS, self-hosted Inter variable font, inline SVG icon sprite — **no CDNs, no frameworks**
- nginx + [ngx-fancyindex](https://github.com/aperezdc/ngx-fancyindex) for directory listings

## Project structure

```
mirror/
├── templates/            # HTML sources — EDIT THESE
│   ├── partials/         # head, nav, footer, icon sprite, error-page shell
│   ├── index.html, donate.html
│   ├── error/            # 403 / 404 / 50x (one include line each)
│   └── theme/            # fancyindex header/footer fragments
├── src/                  # deployable webroot — generated pages + static assets
│   └── assets/           # css (input.css + built tailwind.css), js, fonts, img
├── build.js              # expands templates/ -> src/
├── dev/
│   ├── server.js         # dev server with a fancyindex emulator (no Docker needed)
│   └── fixtures.json     # fake mirror tree served by the emulator
└── docker-*              # real nginx + fancyindex for full-fidelity testing
```

`src/*.html` and `src/assets/css/tailwind.css` are build artifacts (committed so that
`src/` can be deployed as-is). Edit `templates/` and `input.css`, then rebuild.

## Development

```bash
npm install
npm run dev          # http://localhost:8080 — templates re-expand on every refresh
npm run build-css    # Tailwind in watch mode (run alongside `npm run dev`)
```

The dev server emulates fancyindex listings (with sorting) from `dev/fixtures.json`,
so `/arch/core/os/x86_64/` etc. are browsable without Docker. Append `?theme=dark`
or `?theme=light` to force a color scheme while testing. A fixture value like
`"@generate:16000"` synthesizes a directory with that many files
(`/arch/pool/packages/`) for testing listing performance at real pool/ scale.

## Build & deploy

```bash
npm run build        # expand templates + minified CSS
```

Deploy the `src/` directory as the webroot. Point fancyindex at the theme:

```nginx
fancyindex on;
fancyindex_exact_size off;
fancyindex_show_path off;
fancyindex_localtime on;
fancyindex_header "/theme/header.html";
fancyindex_footer "/theme/footer.html";
```

See `docker-nginx.conf` for a complete example including themed error pages.

## Docker (full-fidelity test)

```bash
sudo docker compose up --build -d   # real nginx + fancyindex on :8080
```

## Adding or renaming a mirrored repo

Update these spots (they're small and grep-able by the repo path, e.g. `/arch/`):

1. `templates/partials/nav.html` — Distros dropdown + mobile menu
2. `templates/partials/footer.html` — Mirrors column
3. `templates/index.html` — repository card grid
4. `src/assets/js/listing.js` — `DISTROS` display-name map
5. `dev/fixtures.json` — optional, for dev-server previews

## Scripts

- `npm run dev` — dev server with fancyindex emulator
- `npm run build` — templates + minified CSS (production)
- `npm run build-css` — CSS watch mode
- `npm run lint` / `npm run lint:fix` — ESLint

## License

GPL — see [LICENSE](LICENSE). The listing enhancements are partially based on
[nginx-fancyindex-flat-theme](https://github.com/alehaa/nginx-fancyindex-flat-theme)
by Alexander Haase.
