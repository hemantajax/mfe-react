# React Micro-Frontend (MFE) with Module Federation

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A React 19 micro-frontend application built with Nx monorepo, Module Federation, and Bootstrap 5. This application can run as a standalone app or be consumed as a remote module in a host application.

## 🚀 Live Demos

### Standalone Application
Access the full React application directly:
- **URL**: [https://hemantajax.github.io/mfe-react/](https://hemantajax.github.io/mfe-react/)
- **Features**: Complete React app with routing, Bootstrap 5 UI, works independently

### Module Federation Remote
Consume this micro-frontend in any host application:
- **Remote Entry**: [https://hemantajax.github.io/mfe-react/remoteEntry.mjs](https://hemantajax.github.io/mfe-react/remoteEntry.mjs)
- **Module Name**: `reactdemos`
- **Exposed Module**: `./Module`

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Production Build](#production-build)
- [Deployment](#deployment)
- [Module Federation Usage](#module-federation-usage)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Git**: Latest version

```bash
# Check versions
node --version
npm --version
git --version
```

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/hemantajax/mfe-react.git
cd mfe-react

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# 4. Open browser
# Application runs at http://localhost:4201
```

---

## 💻 Development Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React 19
- React Router DOM 6.29
- Bootstrap 5.3.8
- Nx 22.x
- Webpack Module Federation
- All development dependencies

### 2. Start Development Server

```bash
# Using npm script
npm start

# Or using Nx directly
npx nx serve reactdemos

# With specific host/port
npx nx serve reactdemos --host=0.0.0.0 --port=4201
```

The application will be available at:
- **Local**: `http://localhost:4201`
- **Network**: `http://<your-ip>:4201` (if host set to 0.0.0.0)

### 3. Development Features

- ✅ Hot Module Replacement (HMR)
- ✅ Fast Refresh for React
- ✅ Source maps for debugging
- ✅ ESLint integration
- ✅ Prettier formatting
- ✅ TypeScript support

---

## 🏗️ Production Build

### Build for Production

```bash
# Production build
npm run build:prod

# Or using Nx
npx nx build reactdemos --configuration=production
```

Build output location: `apps/reactdemos/dist/`

### Build Features

- ✅ Code minification
- ✅ Tree shaking
- ✅ Bundle optimization
- ✅ Module Federation setup
- ✅ Source maps (optional)
- ✅ Asset optimization

### Preview Production Build Locally

```bash
# Preview the production build
npm run preview

# Or using Nx
npx nx preview reactdemos
```

---

## 🚀 Deployment

### Deploy to GitHub Pages

This project is configured for automatic deployment to GitHub Pages.

#### Automatic Deployment

```bash
# Build and deploy in one command
npm run deploy
```

This command will:
1. Run production build (`npm run build:prod`)
2. Deploy to `gh-pages` branch
3. Update GitHub Pages site

#### Manual Deployment Steps

```bash
# 1. Build for production
npm run build:prod

# 2. Deploy using gh-pages
npx gh-pages -d apps/reactdemos/dist -b gh-pages -m 'Deploy reactdemos micro-frontend'
```

#### Configure GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages** section
3. Set source to `gh-pages` branch
4. Set folder to `/ (root)`
5. Save and wait 2-3 minutes

#### Verify Deployment

```bash
# Check if remote entry is accessible
curl -I https://hemantajax.github.io/mfe-react/remoteEntry.mjs

# Expected: HTTP/2 200
```

---

## 🔌 Module Federation Usage

### Using This Remote in a Host Application

#### 1. Configure Module Federation

**In host application's `module-federation.config.js`:**

```javascript
module.exports = {
  name: 'host',
  remotes: {
    reactdemos: 'reactdemos@https://hemantajax.github.io/mfe-react/remoteEntry.mjs',
  },
};
```

#### 2. Import and Use

**React Lazy Loading (Recommended):**

```typescript
import React, { Suspense } from 'react';

const RemoteReactDemos = React.lazy(() => import('reactdemos/Module'));

function App() {
  return (
    <div className="container">
      <h1>Host Application</h1>
      
      <Suspense fallback={<div>Loading ReactDemos...</div>}>
        <RemoteReactDemos />
      </Suspense>
    </div>
  );
}
```

**With React Router:**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { Suspense } from 'react';

const RemoteReactDemos = React.lazy(() => import('reactdemos/Module'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/reactdemos/*"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <RemoteReactDemos />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

#### 3. TypeScript Declaration

Create `src/declarations.d.ts` in host app:

```typescript
declare module 'reactdemos/Module' {
  const Module: React.ComponentType;
  export default Module;
}
```

#### 4. Shared Dependencies

Ensure your host application shares these dependencies:

```javascript
shared: {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  'react-router-dom': { singleton: true, requiredVersion: '6.29.0' },
}
```

---

## 📜 Available Scripts

### Development

```bash
npm start                 # Start development server
npm run preview           # Preview production build
npm test                  # Run tests
npm test:watch           # Run tests in watch mode
npm test:coverage        # Generate test coverage report
```

### Build

```bash
npm run build            # Development build
npm run build:prod       # Production build
```

### Deployment

```bash
npm run deploy           # Build and deploy to GitHub Pages
npm run predeploy        # Pre-deployment hook (runs build:prod)
```

### Code Quality

```bash
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Testing

```bash
npm test                 # Run unit tests
npm run e2e              # Run end-to-end tests
npm run e2e:headless     # Run e2e tests in headless mode
```

### Nx Workspace

```bash
npm run nx:graph         # Visualize project dependencies
npm run nx:reset         # Reset Nx cache
npx nx show project reactdemos  # Show project details
```

### Affected Commands

```bash
npm run affected:build   # Build affected projects
npm run affected:test    # Test affected projects
npm run affected:lint    # Lint affected projects
npm run affected:e2e     # E2E test affected projects
```

---

## 📁 Project Structure

```
mfe-react/
├── apps/
│   └── reactdemos/              # Main application
│       ├── src/
│       │   ├── app/             # React components
│       │   ├── assets/          # Static assets
│       │   ├── main.tsx         # Application entry
│       │   └── index.html       # HTML template
│       ├── webpack.config.js    # Webpack + Module Federation
│       ├── project.json         # Nx project configuration
│       └── tsconfig.json        # TypeScript config
├── docs/                        # Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── HOST_SHELL_MFE_SETUP.md
│   ├── GITHUB_PAGES_DEPLOYMENT.md
│   └── REMOTE_MFE_SETUP.md
├── package.json                 # Dependencies & scripts
├── nx.json                      # Nx workspace config
├── tsconfig.base.json          # Base TypeScript config
├── HOW_TO_ACCESS_REMOTE.md     # Remote usage guide
└── README.md                    # This file
```

---

## 🛠️ Technologies Used

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.0.0 | UI Framework |
| **React Router DOM** | 6.29.0 | Routing |
| **Bootstrap** | 5.3.8 | UI Components & Styling |
| **TypeScript** | 5.9.2 | Type Safety |
| **Nx** | 22.0.1 | Monorepo Management |
| **Webpack** | 5.x | Module Bundler |
| **Module Federation** | 2.x | Micro-Frontend Architecture |
| **Jest** | 30.0.2 | Testing Framework |
| **Playwright** | 1.36.0 | E2E Testing |
| **ESLint** | 9.8.0 | Code Linting |
| **Prettier** | 2.6.2 | Code Formatting |

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### End-to-End Tests

```bash
# Run e2e tests
npm run e2e

# Headless mode
npm run e2e:headless
```

### Test Configuration

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: Istanbul

---

## 🐛 Troubleshooting

### Development Server Issues

**Problem**: Port 4201 already in use

```bash
# Kill process on port 4201
lsof -ti:4201 | xargs kill -9

# Or use different port
npx nx serve reactdemos --port=4202
```

**Problem**: Module not found errors

```bash
# Clear Nx cache
npm run nx:reset

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Issues

**Problem**: Build fails with memory error

```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:prod
```

**Problem**: TypeScript errors

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix linting issues
npm run lint:fix
```

### Deployment Issues

**Problem**: GitHub Pages shows 404

1. Verify `gh-pages` branch exists
2. Check GitHub Pages settings
3. Wait 2-3 minutes after deployment
4. Clear browser cache

**Problem**: Remote entry not loading

```bash
# Verify deployment
curl -I https://hemantajax.github.io/mfe-react/remoteEntry.mjs

# Check CORS (should be OK on GitHub Pages)
```

### Module Federation Issues

**Problem**: Cannot load remote module

- Verify remote URL is correct and accessible
- Check browser console for errors
- Ensure shared dependencies are compatible
- Verify `singleton: true` for React packages

**Problem**: Version conflicts

- Use same React version (19.x) in host and remote
- Set `requiredVersion` in shared dependencies
- Check for duplicate dependencies

---

## 📚 Additional Documentation

For more detailed information, see:

- **[HOW_TO_ACCESS_REMOTE.md](HOW_TO_ACCESS_REMOTE.md)** - Complete guide to consuming this remote
- **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Detailed deployment instructions
- **[docs/HOST_SHELL_MFE_SETUP.md](docs/HOST_SHELL_MFE_SETUP.md)** - Host application setup
- **[docs/GITHUB_PAGES_DEPLOYMENT.md](docs/GITHUB_PAGES_DEPLOYMENT.md)** - GitHub Pages configuration
- **[docs/REMOTE_MFE_SETUP.md](docs/REMOTE_MFE_SETUP.md)** - Remote MFE configuration

---

## 🔗 Quick Reference

| Resource | URL |
|---------|-----|
| **Live App** | [https://hemantajax.github.io/mfe-react/](https://hemantajax.github.io/mfe-react/) |
| **Remote Entry** | [https://hemantajax.github.io/mfe-react/remoteEntry.mjs](https://hemantajax.github.io/mfe-react/remoteEntry.mjs) |
| **Repository** | [https://github.com/hemantajax/mfe-react](https://github.com/hemantajax/mfe-react) |
| **Local Dev** | `http://localhost:4201` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🌟 Nx Workspace

This project uses Nx for monorepo management. Learn more:

- [Nx Documentation](https://nx.dev)
- [React Monorepo Tutorial](https://nx.dev/getting-started/tutorials/react-monorepo-tutorial)
- [Module Federation with Nx](https://nx.dev/recipes/module-federation)

### Nx Console

Install Nx Console extension for better developer experience:
- [VS Code](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console)
- [IntelliJ](https://plugins.jetbrains.com/plugin/21060-nx-console)

### Nx Community

- [Discord](https://go.nx.dev/community)
- [Twitter](https://twitter.com/nxdevtools)
- [LinkedIn](https://www.linkedin.com/company/nrwl)
- [YouTube](https://www.youtube.com/@nxdevtools)
- [Blog](https://nx.dev/blog)

---

**Last Updated**: October 31, 2025  
**Version**: 1.0.0  
**Maintained by**: [Hemant](https://github.com/hemantajax)
