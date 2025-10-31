# Shell/Host MFE Setup Guide

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Project Structure](#project-structure)
- [Configuration Files](#configuration-files)
- [Module Federation Configuration - The Core](#module-federation-configuration---the-core)
- [Consuming Remote MFEs](#consuming-remote-mfes)
- [Application Files (Minimal Setup)](#application-files-minimal-setup)
- [Development Workflow](#development-workflow)
- [Production Build & Deployment](#production-build--deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Shell/Host application is the **container** in a Micro Frontend (MFE) architecture. Its primary purpose is to:

- **Load and integrate remote MFEs** via Module Federation
- **Define routes** that point to remote micro frontends
- Provide a minimal layout/navigation structure (optional)

This guide focuses on **how to set up Module Federation** and **how to consume remote MFEs**, not on building complex shell features. The shell app itself will be kept simple with basic "Hello World" style components.

**Key Concept**: The host is a router orchestrator that dynamically loads remotes. Keep the host lean and let the remotes handle their own features.

---

## Prerequisites

### Required Tools

- **Node.js**: v20+ (LTS recommended)
- **npm**: v10+ or **yarn**: v1.22+
- **Git**: Latest version
- **Angular CLI**: v20.3+

### Knowledge Requirements

- Angular 18+ fundamentals
- Module Federation concepts
- TypeScript basics

---

## Initial Setup

### 1. Create Nx Workspace

```bash
# Create directory
mkdir mfe-host
cd mfe-host

# Initialize Nx workspace (interactive prompts)
npx create-nx-workspace@latest .

# When prompted, choose:
# - Preset: angular-monorepo
# - Application name: shell
# - Bundler: webpack
# - Test runner: none (or your preference)
# - Stylesheet format: scss
# - Enable SSR: No
# - Nx Cloud: Skip
```

### 2. Add Module Federation

```bash
# Add Module Federation to shell
nx g @nx/angular:setup-mf shell --mfType=host --port=4200
```

### 3. Install Bootstrap (Optional)

```bash
npm install bootstrap@^5.3.8
```

### 4. Start Development

```bash
nx serve shell
```

That's it! Your shell/host application is ready.

---

## Project Structure

```
mfe-host/
├── apps/
│   └── shell/                              # Host application
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.ts                  # Root component (simple)
│       │   │   ├── app.html                # Root template (router-outlet)
│       │   │   ├── app.config.ts          # App configuration
│       │   │   └── app.routes.ts          # ⭐ Route definitions (loads remotes)
│       │   ├── bootstrap.ts               # Bootstrap logic
│       │   ├── main.ts                    # Entry point
│       │   ├── index.html                 # HTML template
│       │   └── styles.scss                # Global styles
│       ├── public/
│       │   └── favicon.ico
│       ├── module-federation.config.ts      # ⭐ Dev MF config (defines remotes)
│       ├── module-federation.config.prod.ts # ⭐ Prod MF config (remote URLs)
│       ├── webpack.config.ts                # Dev webpack
│       ├── webpack.prod.config.ts           # Prod webpack
│       ├── project.json                     # Nx project config
│       ├── tsconfig.json                    # TS config
│       ├── tsconfig.app.json               # App TS config
│       └── eslint.config.mjs               # ESLint config
├── node_modules/
├── .gitignore
├── package.json
├── tsconfig.base.json                      # ⭐ Defines remote entry paths
├── nx.json
└── README.md
```

**⭐ Key Files for Remote MFE Integration:**

- `module-federation.config.ts` - Declares which remotes to load
- `tsconfig.base.json` - TypeScript paths for remote imports
- `app.routes.ts` - Routing configuration that loads remote routes

---

## Configuration Files

### 1. tsconfig.base.json

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2015",
    "module": "esnext",
    "lib": ["es2020", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "products/Routes": ["apps/products/remote-entry/entry.routes.ts"],
      "cart/Routes": ["apps/cart/remote-entry/entry.routes.ts"],
      "profile/Routes": ["apps/profile/remote-entry/entry.routes.ts"],
      "orders/Routes": ["apps/orders/remote-entry/entry.routes.ts"]
    }
  },
  "exclude": ["node_modules", "tmp"]
}
```

**⭐ Important**: The `paths` section tells TypeScript about remote entry points. These are **virtual imports** resolved by Module Federation at runtime.

### 2. apps/shell/project.json

```json
{
  "name": "shell",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "app",
  "sourceRoot": "apps/shell/src",
  "tags": ["type:app", "scope:host"],
  "targets": {
    "build": {
      "executor": "@nx/angular:webpack-browser",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/shell",
        "index": "apps/shell/src/index.html",
        "main": "apps/shell/src/main.ts",
        "tsConfig": "apps/shell/tsconfig.app.json",
        "inlineStyleLanguage": "scss",
        "assets": [
          {
            "glob": "**/*",
            "input": "apps/shell/public"
          }
        ],
        "styles": ["apps/shell/src/styles.scss"],
        "customWebpackConfig": {
          "path": "apps/shell/webpack.config.ts"
        }
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "500kb",
              "maximumError": "1mb"
            }
          ],
          "outputHashing": "all",
          "customWebpackConfig": {
            "path": "apps/shell/webpack.prod.config.ts"
          }
        },
        "development": {
          "buildOptimizer": false,
          "optimization": false,
          "vendorChunk": true,
          "extractLicenses": false,
          "sourceMap": true,
          "namedChunks": true
        }
      },
      "defaultConfiguration": "production"
    },
    "serve": {
      "executor": "@nx/angular:module-federation-dev-server",
      "configurations": {
        "production": {
          "buildTarget": "shell:build:production"
        },
        "development": {
          "buildTarget": "shell:build:development"
        }
      },
      "defaultConfiguration": "development",
      "options": {
        "port": 4200,
        "publicHost": "http://localhost:4200"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
```

---

## Module Federation Configuration - The Core

This is where the magic happens! Module Federation allows the host to dynamically load remote micro frontends at runtime.

### Step 1: Development Configuration

**apps/shell/module-federation.config.ts**

This file tells the host which remotes exist and where to find them during development:

```typescript
import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'shell',

  /**
   * Remotes Configuration for Development
   *
   * Simple string format: 'remoteName'
   * - Assumes remote is at http://localhost:PORT (PORT from project.json)
   *
   * Tuple format: ['remoteName', 'http://localhost:4201']
   * - Explicit URL for the remote's dev server
   */
  remotes: ['products', 'cart', 'profile', 'orders'],

  // Alternative explicit URLs:
  // remotes: [
  //   ['products', 'http://localhost:4201'],
  //   ['cart', 'http://localhost:4202'],
  //   ['profile', 'http://localhost:4203'],
  //   ['orders', 'http://localhost:4204'],
  // ],
};

export default config;
```

**How it works:**

- When you navigate to `/products`, Module Federation requests `remoteEntry.mjs` from the products remote
- The remote's code is downloaded and executed dynamically
- The host integrates the remote's routes/components seamlessly

### Step 2: Production Configuration

**apps/shell/module-federation.config.prod.ts**

For production, remotes are typically deployed to CDNs or static hosting:

```typescript
import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'shell',

  /**
   * Production Remote URLs
   *
   * Format: ['remoteName', 'https://deployed-url/remoteEntry.mjs']
   *
   * These URLs should point to your deployed remotes:
   * - CDN (CloudFront, Cloudflare, etc.)
   * - Static hosting (S3, GitHub Pages, Netlify, etc.)
   * - Any accessible HTTP endpoint
   */
  remotes: [
    ['products', 'https://your-cdn.com/products/remoteEntry.mjs'],
    ['cart', 'https://your-cdn.com/cart/remoteEntry.mjs'],
    ['profile', 'https://your-cdn.com/profile/remoteEntry.mjs'],
    ['orders', 'https://your-cdn.com/orders/remoteEntry.mjs'],
  ],
};

export default config;
```

**Production Deployment Strategies:**

1. **GitHub Pages**: `https://your-org.github.io/products-mfe/remoteEntry.mjs`
2. **AWS CloudFront**: `https://d111111abcdef8.cloudfront.net/products/remoteEntry.mjs`
3. **Netlify**: `https://products-mfe.netlify.app/remoteEntry.mjs`
4. **Azure Storage**: `https://yourstorage.blob.core.windows.net/products/remoteEntry.mjs`

### Step 3: Webpack Configurations

**apps/shell/webpack.config.ts** (Development)

```typescript
import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

// Uses dev config with localhost URLs
export default withModuleFederation(config, { dts: false });
```

**apps/shell/webpack.prod.config.ts** (Production)

```typescript
import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config.prod';

// Uses prod config with deployed URLs
export default withModuleFederation(config, { dts: false });
```

---

## Consuming Remote MFEs

### Step 1: Configure TypeScript Paths

**tsconfig.base.json**

TypeScript needs to know where to find the remote entry points:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "products/Routes": ["apps/products/remote-entry/entry.routes.ts"],
      "cart/Routes": ["apps/cart/remote-entry/entry.routes.ts"],
      "profile/Routes": ["apps/profile/remote-entry/entry.routes.ts"],
      "orders/Routes": ["apps/orders/remote-entry/entry.routes.ts"]
    }
  }
}
```

**Important Notes:**

- The paths `products/Routes`, `cart/Routes`, etc., are **virtual imports**
- They don't exist in your host app's source code
- Module Federation resolves these at runtime by fetching from the remote
- The paths here are for TypeScript type-checking only

### Step 2: Load Remotes in Routes

**apps/shell/src/app/app.routes.ts**

This is where you integrate remote MFEs into your routing:

```typescript
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  // Default route
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  // Simple home page (host-owned)
  {
    path: 'home',
    loadComponent: () => import('./home.component').then((m) => m.HomeComponent),
  },

  // ============================================
  // REMOTE MFE ROUTES - This is the key part!
  // ============================================

  {
    path: 'products',
    // ⭐ This imports the routes from the REMOTE products app
    loadChildren: () => import('products/Routes').then((m) => m.remoteRoutes),
  },
  {
    path: 'cart',
    // ⭐ This imports the routes from the REMOTE cart app
    loadChildren: () => import('cart/Routes').then((m) => m.remoteRoutes),
  },
  {
    path: 'profile',
    // ⭐ This imports the routes from the REMOTE profile app
    loadChildren: () => import('profile/Routes').then((m) => m.remoteRoutes),
  },
  {
    path: 'orders',
    // ⭐ This imports the routes from the REMOTE orders app
    loadChildren: () => import('orders/Routes').then((m) => m.remoteRoutes),
  },

  // 404 - Not Found (host-owned)
  {
    path: '**',
    loadComponent: () => import('./not-found.component').then((m) => m.NotFoundComponent),
  },
];
```

**What happens when a user navigates to `/products`?**

1. Angular router matches the `/products` route
2. `loadChildren` triggers the lazy load: `import('products/Routes')`
3. Module Federation intercepts the import
4. It fetches `remoteEntry.mjs` from the products remote (localhost:4201 or CDN)
5. The remote's routes are loaded and rendered
6. User sees the products micro frontend!

### Step 3: Understanding Remote Entry Points

Each remote MFE exports its routes via an **entry point** file:

**apps/products/remote-entry/entry.routes.ts** (in the remote repo)

```typescript
import { Route } from '@angular/router';

export const remoteRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./entry.component').then((m) => m.RemoteEntryComponent),
  },
];
```

The host imports `products/Routes`, which resolves to this remote entry file.

---

## Application Files (Minimal Setup)

Keep the host app minimal. Let the remotes do the heavy lifting!

### 1. Entry Point

**apps/shell/src/main.ts**

```typescript
import('./bootstrap').catch((err) => console.error(err));
```

### 2. Bootstrap

**apps/shell/src/bootstrap.ts**

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

### 3. App Configuration

**apps/shell/src/app/app.config.ts**

```typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideRouter(appRoutes)],
};
```

### 4. Root Component (Simple!)

**apps/shell/src/app/app.ts**

```typescript
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Host Application';
}
```

**apps/shell/src/app/app.html**

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
  <div class="container-fluid">
    <a class="navbar-brand" routerLink="/">MFE Host</a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" routerLink="/home">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/products">Products</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/cart">Cart</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/orders">Orders</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/profile">Profile</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

<main class="container mt-4">
  <router-outlet></router-outlet>
</main>
```

**apps/shell/src/app/app.scss**

```scss
// Minimal styles
```

### 5. Home Component (Simple!)

**apps/shell/src/app/home.component.ts**

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  template: `
    <div class="text-center py-5">
      <h1>Welcome to the Host Application</h1>
      <p class="lead">This is a simple host shell that loads remote micro frontends.</p>
      <p>Use the navigation above to explore remote MFEs:</p>
      <ul class="list-unstyled">
        <li>Products - Loaded from remote MFE</li>
        <li>Cart - Loaded from remote MFE</li>
        <li>Orders - Loaded from remote MFE</li>
        <li>Profile - Loaded from remote MFE</li>
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
```

### 6. Not Found Component

**apps/shell/src/app/not-found.component.ts**

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterModule],
  template: `
    <div class="text-center py-5">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a routerLink="/" class="btn btn-primary">Go Home</a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
```

### 7. Global Styles

**apps/shell/src/styles.scss**

```scss
// Bootstrap 5 Import
@import 'bootstrap/scss/bootstrap';

// Global styles
* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
```

### 8. HTML Template

**apps/shell/src/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Host Application</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

---

## Development Workflow

### package.json Scripts

```json
{
  "name": "my-mfe-host",
  "version": "1.0.0",
  "scripts": {
    "start": "nx serve shell",
    "build": "nx build shell",
    "build:prod": "nx build shell --configuration=production",
    "lint": "nx lint shell",
    "serve:static": "nx serve-static shell"
  }
}
```

### Running the Application

#### Development Mode

```bash
# Start the host application
npm start

# Application will be available at http://localhost:4200
```

**Note**: For remotes to load, they must be running on their respective ports:

- Products: http://localhost:4201
- Cart: http://localhost:4202
- Profile: http://localhost:4203
- Orders: http://localhost:4204

#### Production Build

```bash
# Build for production
npm run build:prod

# Output will be in dist/apps/shell/browser
```

#### Serve Production Build Locally

```bash
# Test production build
npx http-server dist/apps/shell/browser -p 8080
```

---

## Production Build & Deployment

### Build Process

1. **Production Build**

```bash
nx build shell --configuration=production
```

2. **Output Structure**

```
dist/apps/shell/
└── browser/
    ├── index.html
    ├── main-*.js
    ├── polyfills-*.js
    ├── remoteEntry.mjs
    ├── styles-*.css
    └── assets/
```

### Deployment Options

#### 1. GitHub Pages

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build:prod

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist/apps/shell/browser'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### 2. Netlify

Create `netlify.toml`:

```toml
[build]
  command = "npm run build:prod"
  publish = "dist/apps/shell/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. AWS S3 + CloudFront

```bash
# Build
npm run build:prod

# Sync to S3
aws s3 sync dist/apps/shell/browser s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### 4. Docker

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist/apps/shell/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
      try_files $uri $uri/ /index.html;
    }

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Remote Module Not Loading

**Problem**: `Cannot find module 'products/Routes'`

**Solution**:

- Ensure remote MFE is running (check http://localhost:4201/remoteEntry.mjs)
- Check `tsconfig.base.json` paths are correct
- Verify `module-federation.config.ts` remotes configuration
- Clear cache and rebuild:

```bash
rm -rf node_modules/.cache
nx reset
nx serve shell
```

#### 2. CORS Errors

**Problem**: CORS errors when loading remote MFEs

**Solution**: Ensure remotes are served with proper CORS headers. Module Federation dev server handles this automatically.

#### 3. Version Mismatch

**Problem**: Different Angular versions between host and remotes

**Solution**: Ensure all MFEs use the same Angular version:

```json
{
  "dependencies": {
    "@angular/core": "~18.0.0",
    "@angular/common": "~18.0.0",
    "@angular/router": "~18.0.0"
  }
}
```

#### 4. Production Build Fails

**Problem**: Build works in dev but fails in production

**Solution**:

- Check production webpack config references correct `module-federation.config.prod.ts`
- Verify remote URLs are accessible
- Test production build locally:

```bash
nx build shell --configuration=production
npx http-server dist/apps/shell/browser -p 8080
```

#### 5. Remote URLs Not Working in Production

**Problem**: Remotes load in dev but not in production

**Solution**:

- Verify remote URLs in `module-federation.config.prod.ts` are correct and accessible
- Check that remotes are deployed and `remoteEntry.mjs` is accessible
- Test remote URL directly in browser: `https://your-cdn.com/products/remoteEntry.mjs`
- Ensure CORS is configured on remote hosting

---

## Summary

The host/shell app is intentionally minimal:

1. **Module Federation Config** - Declares which remotes to load and where
2. **Routes** - Maps paths to remote MFEs using `loadChildren` and dynamic imports
3. **TypeScript Paths** - Tells TypeScript about remote entry points
4. **Simple Navigation** - Basic navbar to navigate between remotes

**The remotes do all the work!** The host is just a router orchestrator.

---

## Next Steps

After setting up your shell/host application:

1. **Create Remote MFEs**: Follow the [REMOTE_MFE_SETUP.md](./REMOTE_MFE_SETUP.md) guide
2. **Deploy Remotes**: Deploy each remote MFE independently
3. **Update Production Config**: Update `module-federation.config.prod.ts` with deployed remote URLs
4. **Test Integration**: Verify all remotes load correctly in the host

---

## Related Documentation

- [Remote MFE Setup Guide](./REMOTE_MFE_SETUP.md)
- [Module Federation Best Practices](./MF_BEST_PRACTICES.md)

---

## Resources

- [Nx Module Federation](https://nx.dev/recipes/module-federation)
- [Module Federation Official Docs](https://module-federation.io/)
- [Angular Architecture Guide](https://angular.dev/guide/architecture)

---

**Last Updated**: October 21, 2025  
**Version**: 2.0.0 (Simplified - Remote-Focused)
