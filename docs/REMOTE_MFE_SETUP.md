# Remote MFE Setup Guide (Products Example)

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Project Structure](#project-structure)
- [Configuration Files](#configuration-files)
- [Module Federation Configuration](#module-federation-configuration)
- [Remote Entry Routes](#remote-entry-routes)
- [Application Architecture](#application-architecture)
- [Integration with UIKit](#integration-with-uikit)
- [Development Workflow](#development-workflow)
- [Production Build & Deployment](#production-build--deployment)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

A Remote MFE (Micro Frontend) is an independently deployable application that is consumed by the Shell/Host application through Module Federation. Each remote:

- **Independent Repository**: Has its own Git repository
- **Independent Deployment**: Can be deployed separately from other MFEs
- **Shared Dependencies**: Uses shared libraries from `@hemantajax/mfe-uikit`
- **Route Exposure**: Exposes its routes to be consumed by the host
- **Isolated Development**: Can be developed and tested independently

This guide shows how to create a **standalone GitHub repository** for a remote MFE using **Products** as an example.

> **📌 What You'll Build**: This guide provides a minimal "Hello World" setup to demonstrate the remote MFE architecture. You'll get a working remote that can be consumed by the host shell. Once set up, you can add your own components, services, and business logic as needed.

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
- TypeScript
- Bootstrap 5

### Required Packages

You'll need access to:

- `@hemantajax/mfe-uikit` - Shared UIKit package

---

## Initial Setup

### 1. Create Nx Workspace

```bash
# Create directory
mkdir mfe-products
cd mfe-products

# Initialize Nx workspace (interactive prompts)
npx create-nx-workspace@latest .

# When prompted, choose:
# - Preset: angular-monorepo
# - Application name: products
# - Bundler: webpack
# - Test runner: none (or your preference)
# - Stylesheet format: scss
# - Enable SSR: No
# - Nx Cloud: Skip
```

### 2. Add Module Federation

```bash
# Add Module Federation to products
nx g @nx/angular:setup-mf products --mfType=remote --port=4201 --host=shell
nx g @nx/react:setup-mf reactdemos --mfType=remote --port=4201 --host=shell
```

**Note**: The `--host=shell` flag is for reference only; it doesn't create a dependency.

### 3. Install Shared UIKit

```bash
# Install shared UIKit package
npm install @hemantajax/mfe-uikit@latest

# If using GitHub Packages, create .npmrc first:
echo "@hemantajax:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}" >> .npmrc

# Then install
npm install @hemantajax/mfe-uikit@latest
```

### 4. Install Bootstrap (Optional)

```bash
npm install bootstrap@^5.3.8
```

### 5. Start Development

```bash
nx serve products
```

Your remote MFE is now running at `http://localhost:4201`

---

## Project Structure

```
mfe-products/
├── apps/
│   └── products/                        # Remote application
│       ├── src/
│       │   ├── app/
│       │   │   ├── pages/
│       │   │   │   └── home/
│       │   │   │       ├── home.component.ts
│       │   │   │       ├── home.component.html
│       │   │   │       └── home.component.scss
│       │   │   ├── app.component.ts           # Root component
│       │   │   ├── app.component.html         # Root template
│       │   │   ├── app.component.scss         # Root styles
│       │   │   ├── app.config.ts             # App configuration
│       │   │   └── app.routes.ts             # Internal routes
│       │   ├── remote-entry/
│       │   │   ├── entry.component.ts        # Remote entry component
│       │   │   └── entry.routes.ts           # Routes exposed to host
│       │   ├── bootstrap.ts                  # Bootstrap logic
│       │   ├── main.ts                       # Entry point
│       │   ├── index.html                    # HTML template
│       │   └── styles.scss                   # Global styles
│       ├── public/
│       │   └── favicon.ico
│       ├── module-federation.config.ts       # Dev MF config
│       ├── module-federation.config.prod.ts  # Prod MF config
│       ├── webpack.config.ts                 # Dev webpack
│       ├── webpack.prod.config.ts            # Prod webpack
│       ├── project.json                      # Nx project config
│       ├── tsconfig.json                     # TS config
│       ├── tsconfig.app.json                # App TS config
│       └── eslint.config.mjs                # ESLint config
├── node_modules/
├── .gitignore
├── .npmrc                                    # npm registry config
├── package.json
├── tsconfig.base.json
├── nx.json
└── README.md
```

---

## Configuration Files

### 1. .npmrc (for GitHub Packages)

```
@hemantajax:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 2. tsconfig.base.json

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
    "paths": {}
  },
  "exclude": ["node_modules", "tmp"]
}
```

### 3. apps/products/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "target": "es2022",
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "emitDecoratorMetadata": false,
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "typeCheckHostBindings": true,
    "strictTemplates": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    }
  ]
}
```

### 4. apps/products/tsconfig.app.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": [],
    "target": "ES2020"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

### 5. apps/products/project.json

```json
{
  "name": "products",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "app",
  "sourceRoot": "apps/products/src",
  "tags": ["type:remote", "scope:products"],
  "targets": {
    "build": {
      "executor": "@nx/angular:webpack-browser",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/products",
        "index": "apps/products/src/index.html",
        "main": "apps/products/src/main.ts",
        "tsConfig": "apps/products/tsconfig.app.json",
        "inlineStyleLanguage": "scss",
        "assets": [
          {
            "glob": "**/*",
            "input": "apps/products/public"
          }
        ],
        "styles": ["apps/products/src/styles.scss"],
        "customWebpackConfig": {
          "path": "apps/products/webpack.config.ts"
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
            "path": "apps/products/webpack.prod.config.ts"
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
          "buildTarget": "products:build:production"
        },
        "development": {
          "buildTarget": "products:build:development"
        }
      },
      "defaultConfiguration": "development",
      "options": {
        "port": 4201,
        "publicHost": "http://localhost:4201"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
```

---

## Module Federation Configuration

### Development Configuration

**apps/products/module-federation.config.ts**

```typescript
import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'products',
  /**
   * Expose the routes to be consumed by the host
   * The host will import these as: import('products/Routes')
   */
  exposes: {
    './Routes': 'apps/products/src/remote-entry/entry.routes.ts',
  },
};

export default config;
```

### Production Configuration

**apps/products/module-federation.config.prod.ts**

```typescript
import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'products',
  /**
   * Production configuration
   * Exposes same routes but optimized for production
   */
  exposes: {
    './Routes': 'apps/products/src/remote-entry/entry.routes.ts',
  },
};

export default config;
```

### Webpack Configurations

**apps/products/webpack.config.ts** (Development)

```typescript
import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

/**
 * Development webpack configuration
 * Runs on http://localhost:4201
 */
export default withModuleFederation(config, { dts: false });
```

**apps/products/webpack.prod.config.ts** (Production)

```typescript
import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config.prod';

/**
 * Production webpack configuration
 * Deployed to CDN/static hosting
 */
export default withModuleFederation(config, { dts: false });
```

---

## Remote Entry Routes

### Entry Routes (Exposed to Host)

**apps/products/src/remote-entry/entry.routes.ts**

```typescript
import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';

/**
 * Routes exposed to the host application
 * Host imports these as: import('products/Routes').then(m => m.remoteRoutes)
 */
export const remoteRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntryComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('../app/pages/home/home.component').then((m) => m.HomeComponent),
      },
    ],
  },
];
```

### Entry Component

**apps/products/src/remote-entry/entry.component.ts**

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Remote entry component
 * Serves as the root for all product routes
 */
@Component({
  imports: [RouterModule],
  selector: 'app-products-entry',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoteEntryComponent {}
```

---

## Application Architecture

### 1. Entry Point

**apps/products/src/main.ts**

```typescript
import('./bootstrap').catch((err) => console.error(err));
```

### 2. Bootstrap

**apps/products/src/bootstrap.ts**

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
```

### 3. App Configuration

**apps/products/src/app/app.config.ts**

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideBrowserGlobalErrorListeners(), provideRouter(appRoutes), provideHttpClient()],
};
```

### 4. Root Component

**apps/products/src/app/app.component.ts**

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '@hemantajax/mfe-uikit';

@Component({
  imports: [RouterModule, HeaderComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected title = 'Products MFE';
}
```

**apps/products/src/app/app.component.html**

```html
<app-header [title]="title"></app-header>

<main class="container-fluid py-4">
  <router-outlet></router-outlet>
</main>
```

### 5. Internal Route Configuration

**apps/products/src/app/app.routes.ts**

```typescript
import { Route } from '@angular/router';

/**
 * Internal routes for standalone development
 * These are used when running products independently
 */
export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('../remote-entry/entry.routes').then((m) => m.remoteRoutes),
  },
];
```

### 6. Home Component (Simple Example)

**apps/products/src/app/pages/home/home.component.ts**

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected title = 'Products MFE';
  protected message = 'This is a remote micro-frontend running independently!';
}
```

**apps/products/src/app/pages/home/home.component.html**

```html
<div class="container py-5">
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-body text-center">
          <h1 class="card-title">{{ title }}</h1>
          <p class="card-text lead">{{ message }}</p>
          <hr />
          <p class="text-muted">
            This component is loaded from the Products remote MFE.<br />
            You can now add your own components, services, and features here.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
```

**apps/products/src/app/pages/home/home.component.scss**

```scss
// Component-specific styles
.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

> **📝 Note**: This is a basic "Hello World" component. You can now:
>
> - Add more components in the `pages/` directory
> - Create services in a `services/` directory
> - Add models in a `models/` directory
> - Create additional routes in `entry.routes.ts`
> - Use `nx g component` to generate new components

**Example: Generate a new component**

```bash
# Generate a new component
nx g component pages/about --project=products

# Generate a service
nx g service services/data --project=products
```

### 7. Global Styles

**apps/products/src/styles.scss**

```scss
// Bootstrap 5 Import
@import 'bootstrap/scss/bootstrap';

// Optional: Import UIKit styles if available
// @import '@hemantajax/mfe-uikit/styles/variables';
// @import '@hemantajax/mfe-uikit/styles/mixins';

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

// Utility classes
.cursor-pointer {
  cursor: pointer;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 8. HTML Template

**apps/products/src/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Products MFE</title>
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

## Integration with UIKit

### Using UIKit Components

```typescript
// Import from UIKit package
import { HeaderComponent } from '@hemantajax/mfe-uikit';

@Component({
  imports: [HeaderComponent],
  selector: 'app-root',
  template: `
    <app-header [title]="'Products MFE'" />
    <router-outlet />
  `,
})
export class AppComponent {}
```

### Using UIKit Services

```typescript
import { StorageService } from '@hemantajax/mfe-uikit';

@Component({
  selector: 'app-home',
  // ...
})
export class HomeComponent {
  constructor(private storage: StorageService) {
    // Use UIKit services
    const theme = this.storage.getItem('theme');
    console.log('Current theme:', theme);
  }
}
```

### Using UIKit Utilities

```typescript
import { formatDate, capitalize } from '@hemantajax/mfe-uikit';

// Use utility functions
const formattedDate = formatDate(new Date());
const name = capitalize('products');
```

---

## Development Workflow

### package.json Scripts

```json
{
  "name": "mfe-products",
  "version": "1.0.0",
  "scripts": {
    "start": "nx serve products",
    "build": "nx build products",
    "build:prod": "nx build products --configuration=production",
    "lint": "nx lint products",
    "test": "nx test products",
    "serve:static": "nx serve-static products"
  },
  "dependencies": {
    "@angular/animations": "~20.3.0",
    "@angular/common": "~20.3.0",
    "@angular/compiler": "~20.3.0",
    "@angular/core": "~20.3.0",
    "@angular/forms": "~20.3.0",
    "@angular/platform-browser": "~20.3.0",
    "@angular/platform-browser-dynamic": "~20.3.0",
    "@angular/router": "~20.3.0",
    "@hemantajax/mfe-uikit": "^1.0.0",
    "bootstrap": "^5.3.8",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.15.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~20.3.0",
    "@angular/cli": "~20.3.0",
    "@angular/compiler-cli": "~20.3.0",
    "@nx/angular": "20.3.0",
    "@nx/module-federation": "20.3.0",
    "@nx/webpack": "20.3.0",
    "nx": "20.3.0",
    "typescript": "~5.7.2",
    "webpack": "^5.94.0"
  }
}
```

### Running the Application

#### Development Mode (Standalone)

```bash
# Start products MFE independently
npm start

# Application runs at http://localhost:4201
```

#### Development Mode (With Shell)

**Terminal 1 - Products Remote:**

```bash
cd mfe-products
npm start
# Runs at http://localhost:4201
```

**Terminal 2 - Shell Host:**

```bash
cd mfe-shell
npm start
# Runs at http://localhost:4200
# Consumes products from localhost:4201
```

#### Production Build

```bash
# Build for production
npm run build:prod

# Output: dist/apps/products/browser/
```

#### Serve Production Build Locally

```bash
# Test production build
npm run serve:static

# Or use http-server
npx http-server dist/apps/products/browser -p 8201 --cors
```

---

## Production Build & Deployment

### Build Process

```bash
# Production build
nx build products --configuration=production

# Output structure:
# dist/apps/products/
# ├── browser/
# │   ├── index.html
# │   ├── main-*.js
# │   ├── polyfills-*.js
# │   ├── remoteEntry.mjs        ← Important for Module Federation
# │   ├── styles-*.css
# │   └── assets/
```

### Deployment Options

#### 1. GitHub Pages

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Products MFE

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

      - name: Configure npm for GitHub Packages
        run: |
          echo "@hemantajax:registry=https://npm.pkg.github.com" >> .npmrc
          echo "//npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }}" >> .npmrc

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build:prod

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist/apps/products/browser'

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
  publish = "dist/apps/products/browser"

[[headers]]
  for = "/remoteEntry.mjs"
  [headers.values]
    Access-Control-Allow-Origin = "*"

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"

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
aws s3 sync dist/apps/products/browser s3://products-mfe --delete

# Set CORS headers for remoteEntry.mjs
aws s3 cp s3://products-mfe/remoteEntry.mjs s3://products-mfe/remoteEntry.mjs \
  --metadata-directive REPLACE \
  --content-type "application/javascript" \
  --acl public-read \
  --cache-control "public, max-age=31536000"

# Invalidate CloudFront
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

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Set GitHub token for private packages
ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build:prod

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist/apps/products/browser /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
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

    # CORS headers for Module Federation
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type" always;

    location / {
      try_files $uri $uri/ /index.html;
    }

    # Cache busting for hashed files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }

    # Never cache remoteEntry.mjs
    location = /remoteEntry.mjs {
      expires -1;
      add_header Cache-Control "no-cache, no-store, must-revalidate";
      add_header Access-Control-Allow-Origin * always;
    }

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
  }
}
```

Build and run:

```bash
# Build image
docker build --build-arg GITHUB_TOKEN=$GITHUB_TOKEN -t products-mfe .

# Run container
docker run -p 8201:80 products-mfe

# Or use docker-compose
docker-compose up
```

### CORS Configuration

**Important**: The remote MFE must have CORS enabled for the host to load it.

**Development**: Usually handled automatically by webpack-dev-server

**Production**: Configure your web server (nginx, Apache, etc.) to add CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Best Practices

### 1. Route Naming Convention

```typescript
// ✅ Good - Relative paths in remote routes
export const remoteRoutes: Route[] = [
  {
    path: '', // Not '/products'
    component: RemoteEntryComponent,
    children: [
      { path: '', component: ProductListComponent },
      { path: ':id', component: ProductDetailComponent },
    ],
  },
];

// ❌ Bad - Absolute paths
export const remoteRoutes: Route[] = [
  {
    path: 'products', // This will break when integrated
    // ...
  },
];
```

**Why?** The host already routes to `/products`, so the remote should use relative paths.

### 2. State Management

```typescript
// Use signals for reactive state
private items = signal<string[]>([]);
readonly items$ = this.items.asReadonly();

// Use computed for derived state
readonly itemCount = computed(() => this.items().length);

// Update state
addItem(item: string): void {
  this.items.update(items => [...items, item]);
}
```

### 3. Error Handling

```typescript
// Always handle errors gracefully
async loadData(): Promise<void> {
  try {
    const data = await this.http.get<any[]>(this.apiUrl).toPromise();
    this.items.set(data || []);
  } catch (err) {
    this.error.set('Failed to load data');
    console.error('Error loading data:', err);
    // Optionally: Send to error tracking service
  }
}
```

### 4. Lazy Loading

```typescript
// Lazy load components for better performance
{
  path: 'details',
  loadComponent: () => import('./details/details.component').then(m => m.DetailsComponent)
}
```

### 5. Performance Optimization

```typescript
// Use trackBy for @for loops
trackById(_index: number, item: any): string {
  return item.id;
}

// Use OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})

// Prefer signals over observables for better performance
private count = signal(0);
readonly count$ = this.count.asReadonly();
```

### 6. Testing Standalone

```typescript
// app.routes.ts - Load remote routes for standalone testing
export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('../remote-entry/entry.routes').then((m) => m.remoteRoutes),
  },
];
```

This allows you to run and test the remote MFE independently without the host.

### 7. Environment Configuration

**apps/products/src/environments/environment.ts**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

**apps/products/src/environments/environment.prod.ts**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com',
};
```

---

## Troubleshooting

### Common Issues

#### 1. Host Cannot Load Remote

**Problem**: `Error: Shared module is not available for eager consumption`

**Solution**: Ensure proper bootstrap pattern:

```typescript
// main.ts
import('./bootstrap').catch((err) => console.error(err));

// bootstrap.ts
import { bootstrapApplication } from '@angular/platform-browser';
// ... rest of bootstrap
```

#### 2. CORS Errors in Production

**Problem**: CORS errors when host tries to load remote

**Solution**: Add CORS headers to remote deployment:

```nginx
# nginx.conf
add_header Access-Control-Allow-Origin * always;
```

#### 3. Routes Not Working

**Problem**: Routes work standalone but not when loaded by host

**Solution**: Use relative paths in remote routes:

```typescript
// ✅ Correct
{ path: '', component: ListComponent }
{ path: ':id', component: DetailComponent }

// ❌ Wrong
{ path: '/products', component: ListComponent }
```

#### 4. Shared Dependencies Version Mismatch

**Problem**: Runtime errors due to version conflicts

**Solution**: Ensure all MFEs use same Angular version:

```json
{
  "dependencies": {
    "@angular/core": "~20.3.0",
    "@angular/common": "~20.3.0",
    "@angular/router": "~20.3.0"
  }
}
```

#### 5. UIKit Package Not Found

**Problem**: `Cannot find module '@hemantajax/mfe-uikit'`

**Solution**: Configure npm registry and authenticate:

```bash
# Create .npmrc
echo "@hemantajax:registry=https://npm.pkg.github.com" > .npmrc

# Set GitHub token
export GITHUB_TOKEN=your_token_here

# Install
npm install @hemantajax/mfe-uikit@latest
```

#### 6. remoteEntry.mjs Not Generated

**Problem**: Build completes but remoteEntry.mjs is missing

**Solution**: Check Module Federation config:

```typescript
// module-federation.config.ts
const config: ModuleFederationConfig = {
  name: 'products', // Must be set
  exposes: {
    './Routes': 'apps/products/src/remote-entry/entry.routes.ts',
  },
};
```

#### 7. Standalone Works But Breaks in Host

**Problem**: MFE works standalone but crashes when loaded by host

**Solution**: Check for:

- Absolute route paths (use relative)
- Duplicate service providers (use `providedIn: 'root'`)
- Missing peer dependencies in UIKit

### Debug Mode

Enable verbose logging:

```typescript
// bootstrap.ts
console.log('🚀 Products MFE bootstrapping...');
console.log('Environment:', environment);

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('✅ Products MFE ready'))
  .catch((err) => console.error('❌ Bootstrap failed:', err));
```

---

## Testing Strategy

### 1. Standalone Testing

```bash
# Run standalone
nx serve products

# Test at http://localhost:4201
```

### 2. Integration Testing with Host

```bash
# Terminal 1 - Products
cd mfe-products
nx serve products

# Terminal 2 - Host
cd mfe-shell
nx serve shell

# Test at http://localhost:4200/products
```

### 3. Production Build Testing

```bash
# Build production
nx build products --configuration=production

# Serve locally
npx http-server dist/apps/products/browser -p 8201 --cors

# Update host to point to localhost:8201
```

---

## Deployment Checklist

- [ ] Module Federation config completed
- [ ] Remote entry routes created
- [ ] UIKit integration tested
- [ ] Standalone testing successful
- [ ] Integration with host tested
- [ ] CORS headers configured
- [ ] Production build successful
- [ ] remoteEntry.mjs generated
- [ ] Deployment pipeline configured
- [ ] Health check endpoint added (optional)
- [ ] Monitoring/logging configured
- [ ] Documentation updated

---

## Next Steps

After setting up your remote MFE:

1. **Add Your Features**: Implement your domain-specific components and services
2. **Add More Routes**: Create additional pages as needed
3. **Shared State**: Implement cross-MFE communication if needed
4. **Authentication**: Add auth guards and token management
5. **API Integration**: Connect to your backend services
6. **Testing**: Add unit and E2E tests
7. **Monitoring**: Add error tracking (Sentry, etc.)
8. **CI/CD**: Automate builds and deployments

---

## Related Documentation

- [Host/Shell MFE Setup Guide](./HOST_SHELL_MFE_SETUP.md)
- [Shared UIKit Setup Guide](./POLYREPO_UIKIT_APPROACH.md)
- [Module Federation Best Practices](./MF_BEST_PRACTICES.md) _(to be created)_
- [Cross-MFE Communication](./CROSS_MFE_COMMUNICATION.md) _(to be created)_
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) _(to be created)_

---

## Resources

- [Nx Module Federation](https://nx.dev/recipes/module-federation)
- [Angular Module Federation](https://www.angulararchitects.io/en/blog/module-federation-with-angular/)
- [Module Federation Official Docs](https://module-federation.io/)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)

---

**Last Updated**: October 21, 2025  
**Version**: 1.0.0  
**Repository**: https://github.com/hemantajax/mfe-products (example)
