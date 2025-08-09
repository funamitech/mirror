# YuruMirror (Modern!)

Mirror project with modern TailwindCSS design.
Docker files provided for testing.

`src/` contains the website files with modern styling and directory listing functionality.

## 🚀 Tech Stack
- Tailwind CSS 4.1 (CSS-first configuration)
- Tailwind CLI (`@tailwindcss/cli`)
- Vanilla HTML/JS

## 🚧 Requirements
- Node.js 20+ (Tailwind v4 requires modern Node and browsers)
- npm

## 🧰 Install
```bash
npm install
```

## 🔨 Build CSS
- Production:
  ```bash
  npm run build-css-prod
  ```
  Outputs `src/assets/css/tailwind.css` (minified)

- Development (watch):
  ```bash
  npm run build-css
  ```

## 📁 Project Structure
```
mirror/
├── src/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── input.css      # Tailwind v4 entry + @theme, @utility
│   │   │   └── tailwind.css   # Generated CSS (after build)
│   │   ├── js/
│   │   └── img/
│   ├── theme/
│   ├── error/
│   └── *.html
├── package.json
└── README.md
```

## 🚢 Deployment
1. Build CSS:
   ```bash
   npm run build-css-prod
   ```
2. Deploy the `src/` directory to your web server. Ensure `src/assets/css/tailwind.css` is included.

## 🛠️ Scripts
- `npm run build-css-prod` — Build minified CSS for production
- `npm run build-css` — Watch and rebuild CSS on changes
- `npm run lint` — ESLint for JS
- `npm run lint:fix` — ESLint with auto-fix

## 🐳 Docker
Docker files are provided for testing and deployment:
```bash
sudo docker compose up --build -d
```
