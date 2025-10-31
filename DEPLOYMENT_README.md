# ReactDemos Micro-Frontend - Deployment Guide

## 🚀 Quick Start

### Run Standalone (Development)
```bash
npm start
# Opens at http://localhost:4201
```

### Build & Deploy to GitHub Pages
```bash
npm run deploy
```

## 📦 Production Build

The production build generates a Module Federation remote that can be consumed by any host application.

### Build Commands
```bash
# Development build
npm run build

# Production build (for deployment)
npm run build:prod
```

## 🌐 Deployment URLs

After deploying, your micro-frontend will be available at:

- **Live Application**: https://hemantajax.github.io/mfe-react/
- **Remote Entry Point**: https://hemantajax.github.io/mfe-react/remoteEntry.mjs

## 🔌 Using in a Host Application

### Configuration in Host's `module-federation.config.js`:

```javascript
module.exports = {
  name: 'host',
  remotes: {
    reactdemos: 'reactdemos@https://hemantajax.github.io/mfe-react/remoteEntry.mjs',
  },
};
```

### Usage in Host Application:

```typescript
// Dynamic import
import('reactdemos/Module').then((module) => {
  // Use the remote module
  const RemoteComponent = module.default;
  // Render or use the component
});

// Or with React lazy loading
const RemoteApp = React.lazy(() => import('reactdemos/Module'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RemoteApp />
    </Suspense>
  );
}
```

## 📋 What's Exposed?

The micro-frontend exposes the following module:
- `./Module` → Main application entry point (`src/remote-entry.ts`)

## 🔧 Key Configuration Files

### 1. `webpack.config.js`
- **Production Public Path**: `https://hemantajax.github.io/mfe-react/`
- **Development Public Path**: `auto` (relative)
- **Module Federation**: Exposes `./Module`

### 2. `project.json` (Angular-style)
- **Development Config**: Base href `/`, no optimization
- **Production Config**: Base href `/mfe-react/`, optimized, minified

### 3. `module-federation.config.js`
```javascript
module.exports = {
  name: 'reactdemos',
  exposes: {
    './Module': './src/remote-entry.ts',
  },
};
```

## 🛠️ Build Output

Production build generates:
- ✅ `remoteEntry.mjs` - Module Federation entry point
- ✅ `.nojekyll` - Prevents Jekyll processing
- ✅ `index.html` - Standalone application
- ✅ All JavaScript bundles and assets

## 🎯 Features

### Standalone Mode
- ✅ Can run independently at https://hemantajax.github.io/mfe-react/
- ✅ Full React application with routing
- ✅ Bootstrap 5 UI components

### Remote Mode (Module Federation)
- ✅ Can be consumed by any Module Federation host
- ✅ Exposes main application module
- ✅ Shares React, React-DOM, React-Router-DOM (singleton)

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server (port 4201) |
| `npm run build` | Development build |
| `npm run build:prod` | Production build (optimized) |
| `npm run deploy` | Build & deploy to GitHub Pages |
| `npm run preview` | Preview production build locally |
| `npm test` | Run tests |
| `npm run lint` | Lint code |

## 🔍 Verification After Deployment

1. Check the live application:
   ```
   https://hemantajax.github.io/mfe-react/
   ```

2. Verify remoteEntry.mjs is accessible:
   ```
   https://hemantajax.github.io/mfe-react/remoteEntry.mjs
   ```

3. Test in a host application using the Module Federation configuration above.

## ⚙️ Configuration System (Angular-style)

Unlike traditional React builds that rely on `NODE_ENV`, this project uses **Nx configurations** similar to Angular:

```bash
# Uses 'development' configuration
nx build reactdemos

# Uses 'production' configuration
nx build reactdemos --configuration=production
```

This approach:
- ✅ Works on Windows, Mac, and Linux
- ✅ Supports multiple environments (dev, staging, prod)
- ✅ Declarative configuration in `project.json`
- ✅ No need for environment variables in scripts

## 🚨 First-Time GitHub Pages Setup

If deploying for the first time:

1. Run `npm run deploy`
2. Go to repository settings: https://github.com/hemantajax/mfe-react/settings/pages
3. Under "Source", select:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
4. Click "Save"
5. Wait 2-3 minutes for GitHub Pages to deploy

## 📖 Additional Documentation

- Full deployment guide: `docs/DEPLOYMENT_GUIDE.md`
- Host/Shell setup: `docs/HOST_SHELL_MFE_SETUP.md`
- Remote MFE setup: `docs/REMOTE_MFE_SETUP.md`

---

**Repository**: https://github.com/hemantajax/mfe-react
**Last Updated**: October 31, 2025

