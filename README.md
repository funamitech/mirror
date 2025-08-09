# YuruMirror (Modern!)

Mirror project with modern TailwindCSS design.
Docker files provided for testing.

`src/` contains the website files with modern styling and directory listing functionality.

## 🚀 Building the Project

This project uses **Tailwind CSS** for styling. The CSS needs to be compiled before the site can be served.

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build CSS for production:**
   ```bash
   npm run build-css-prod
   ```

   This generates the minified `src/assets/css/tailwind.css` file required by all HTML pages.

### Development Workflow

For development with automatic rebuilding when you modify HTML or CSS:

```bash
npm run build-css
```

This command watches for changes and rebuilds the CSS automatically.

### Build Scripts

- `npm run build-css-prod` - Builds minified CSS for production deployment
- `npm run build-css` - Builds CSS with watch mode for development
- `npm run lint` - Runs ESLint on JavaScript files
- `npm run lint:fix` - Automatically fixes linting issues

### Project Structure

```
mirror/
├── src/                          # Website source files
│   ├── assets/
│   │   ├── css/
│   │   │   ├── input.css         # Tailwind input file
│   │   │   └── tailwind.css      # Generated CSS (after build)
│   │   ├── js/                   # JavaScript files
│   │   └── img/                  # Images
│   ├── theme/                    # Theme templates
│   ├── error/                    # Error pages
│   └── *.html                    # Main pages
├── tailwind.config.js            # Tailwind configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

### Deployment

1. **Build production CSS:**
   ```bash
   npm run build-css-prod
   ```

2. **Deploy the `src/` directory** to your web server

The generated `tailwind.css` file must be present for the site to display correctly.

### Customization

To modify the design:

1. **Edit Tailwind config:** Update `tailwind.config.js` for custom colors, fonts, or animations
2. **Modify CSS:** Edit `src/assets/css/input.css` for custom styles
3. **Rebuild:** Run `npm run build-css-prod` to apply changes

### Docker Support

Docker files are provided for testing and deployment:

```bash
docker-compose up
```
