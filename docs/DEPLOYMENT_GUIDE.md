# GitHub Pages Deployment Guide for ReactDemos Micro-Frontend

This guide explains how to deploy the React ReactDemos micro-frontend to GitHub Pages at `https://hemantajax.github.io/mfe-react/`.

## Overview

This project is configured to deploy as a Module Federation remote at:

- **Remote Entry URL**: `https://hemantajax.github.io/mfe-react/remoteEntry.mjs`
- **Standalone App URL**: `https://hemantajax.github.io/mfe-react/`
- **Repository**: `https://github.com/hemantajax/mfe-react`

## Prerequisites

1. **Git Repository**: Ensure you're working with a Git repository
2. **GitHub Access**: Push access to `https://github.com/hemantajax/mfe-react`
3. **Node.js**: Version 18+ recommended
4. **Dependencies Installed**: Run `npm install` if not already done

## Configuration Details

### 1. Webpack Configuration

The webpack configuration (`apps/reactdemos/webpack.config.js`) is set up to:

- **Production Public Path**: `https://hemantajax.github.io/mfe-react/`
- **Base Href**: `/mfe-react/`
- **Remote Entry File**: `remoteEntry.mjs` (Module Federation entry point)
- **Development Mode**: Uses `auto` public path for local development

### 2. Module Federation Setup

```javascript
{
  name: 'reactdemos',
  filename: 'remoteEntry.mjs',
  exposes: {
    './Module': './src/remote-entry.ts'
  }
}
```

### 3. Deployment Script

The `package.json` includes deployment scripts:

```json
{
  "predeploy": "npm run build:prod",
  "deploy": "gh-pages -d apps/reactdemos/dist -b gh-pages -m 'Deploy reactdemos micro-frontend'"
}
```

**Script Parameters:**

- `-d apps/reactdemos/dist`: Source directory (build output)
- `-b gh-pages`: Deploy to gh-pages branch (root of branch)
- `-m 'Deploy reactdemos micro-frontend'`: Commit message
- Deploys to current repository (`https://github.com/hemantajax/mfe-react`)

## Deployment Steps

### Quick Deployment

Simply run:

```bash
npm run deploy
```

This will:

1. Build the application in production mode (`predeploy` script)
2. Deploy to GitHub Pages (`deploy` script)
3. Push to the `gh-pages` branch root directory

### Manual Steps (Optional)

If you prefer to run steps separately:

**Step 1: Build**

```bash
npm run build:prod
```

**Step 2: Deploy**

```bash
npx gh-pages -d apps/reactdemos/dist -e reactdemos -r https://github.com/hemantajax/mfedemos.git -b gh-pages
```

## First-Time Setup

### 1. Enable GitHub Pages

1. Go to repository settings: `https://github.com/hemantajax/mfedemos/settings/pages`
2. Under "Source", select:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
3. Click "Save"

### 2. Configure Git Authentication

Ensure you have push access configured:

**For HTTPS:**

```bash
git config credential.helper store
```

**For SSH:**

```bash
ssh-add ~/.ssh/id_rsa
```

### 3. First Deployment

Run the deployment command:

```bash
npm run deploy
```

Wait a few minutes for GitHub Pages to build and deploy.

### 4. Verify Deployment

Check these URLs:

- **Application**: https://hemantajax.github.io/mfedemos/reactdemos/
- **Remote Entry**: https://hemantajax.github.io/mfedemos/reactdemos/remoteEntry.mjs

## Using in Host Application

In your host application (e.g., `mfe-host`), configure Module Federation to load this remote:

```javascript
// webpack.config.js or module-federation.config.js
{
  remotes: {
    reactdemos: 'reactdemos@https://hemantajax.github.io/mfedemos/reactdemos/remoteEntry.mjs';
  }
}
```

Then import and use:

```typescript
// In your host application
import('reactdemos/Module').then((module) => {
  // Use the remote module
});
```

## Build Verification

After building, verify the following files are present in `apps/reactdemos/dist/`:

- ✅ `remoteEntry.mjs` - Module Federation entry point
- ✅ `.nojekyll` - Prevents Jekyll processing
- ✅ `index.html` - With correct base href: `/mfedemos/reactdemos/`
- ✅ All JavaScript bundles and assets

Run this command to verify:

```bash
ls -la apps/reactdemos/dist/ | grep -E "(remoteEntry|nojekyll)"
```

Expected output:

```
-rw-r--r--  .nojekyll
-rw-r--r--  remoteEntry.mjs
```

## Troubleshooting

### Issue: 404 on Remote Entry

**Cause**: Incorrect public path or deployment directory
**Solution**: Verify webpack config has correct publicPath:

```javascript
publicPath: 'https://hemantajax.github.io/mfedemos/reactdemos/';
```

### Issue: Assets Not Loading

**Cause**: Incorrect base href
**Solution**: Check `index.html` contains:

```html
<base href="/mfedemos/reactdemos/" />
```

### Issue: CORS Errors in Host Application

**Cause**: GitHub Pages serves files without proper CORS headers
**Solution**: GitHub Pages automatically serves static files with appropriate headers. If issues persist, verify:

1. The host application is also on GitHub Pages or a proper domain
2. The remote entry URL is correctly formatted with `https://`

### Issue: Module Not Found in Host

**Cause**: Host application Module Federation config incorrect
**Solution**: Ensure remote name matches and URL is complete:

```javascript
remotes: {
  reactdemos: 'reactdemos@https://hemantajax.github.io/mfedemos/reactdemos/remoteEntry.mjs';
}
```

### Issue: Old Version Still Showing

**Cause**: Browser or CDN caching
**Solution**:

- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Open in incognito/private window
- Wait a few minutes for GitHub Pages cache to clear

### Issue: Permission Denied During Deploy

**Cause**: No push access to repository
**Solution**:

1. Verify you have write access to the repository
2. Check Git credentials are configured
3. Try SSH if HTTPS fails

### Issue: Build Fails

**Cause**: Missing dependencies or configuration errors
**Solution**:

```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Nx cache
npm run nx:reset

# Try build again
npm run build:prod
```

## Development vs Production

### Development Mode

```bash
npm start
# or
nx serve reactdemos
```

- Runs on `http://localhost:4201`
- Public path: `auto` (relative paths)
- Base href: `/`
- Hot module replacement enabled

### Production Mode

```bash
npm run build:prod
```

- Public path: `https://hemantajax.github.io/mfedemos/reactdemos/`
- Base href: `/mfedemos/reactdemos/`
- Optimized and minified
- Ready for GitHub Pages deployment

## Continuous Deployment (Optional)

For automated deployments on every push, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build and Deploy
        run: npm run deploy
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Project Structure

```
mfe-react/
├── apps/
│   └── reactdemos/
│       ├── dist/                      # Build output (generated)
│       │   ├── remoteEntry.mjs       # Module Federation entry
│       │   ├── .nojekyll             # GitHub Pages config
│       │   ├── index.html            # Main HTML file
│       │   └── *.js                  # Compiled bundles
│       ├── src/
│       │   ├── .nojekyll             # Source (copied to dist)
│       │   └── remote-entry.ts       # MF exposed module
│       ├── webpack.config.js         # Webpack configuration
│       └── module-federation.config.js
├── package.json                      # Contains deploy scripts
└── docs/
    └── DEPLOYMENT_GUIDE.md          # This file
```

## Important Files

### webpack.config.js

Contains production publicPath and Module Federation configuration.

### module-federation.config.js

Defines exposed modules and remote name.

### .nojekyll

Prevents GitHub Pages from processing files with Jekyll (important for files starting with `_`).

## Resources

- **gh-pages Package**: https://www.npmjs.com/package/gh-pages
- **Module Federation**: https://webpack.js.org/concepts/module-federation/
- **GitHub Pages**: https://docs.github.com/en/pages
- **Nx Build**: https://nx.dev/nx-api/webpack

## Support

For issues related to:

- **Build**: Check Nx logs and webpack configuration
- **Deployment**: Verify gh-pages settings and Git access
- **Module Federation**: Check remote configuration in host application
- **GitHub Pages**: Verify repository settings and branch configuration

## Quick Reference

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm start`          | Start development server         |
| `npm run build`      | Build development version        |
| `npm run build:prod` | Build production version         |
| `npm run deploy`     | Build and deploy to GitHub Pages |
| `npm run lint`       | Run linter                       |
| `npm run test`       | Run tests                        |

## URLs

- **Deployed Application**: https://hemantajax.github.io/mfedemos/reactdemos/
- **Remote Entry**: https://hemantajax.github.io/mfedemos/reactdemos/remoteEntry.mjs
- **Host Application**: https://hemantajax.github.io/mfe-host/
- **Repository**: https://github.com/hemantajax/mfedemos

---

**Last Updated**: October 31, 2025
