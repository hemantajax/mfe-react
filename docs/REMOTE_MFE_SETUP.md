# Remote MFE Setup Guide (React Example)

> **⚠️ IMPORTANT - Manual Setup Required**: The NX generator command `nx g @nx/react:setup-mf` does NOT work reliably with current NX versions. This guide documents the **manual configuration approach** that actually works. Follow the manual steps in the [Initial Setup](#initial-setup) section.

## What This Guide Covers

This guide documents the **working manual approach** for setting up a React Remote MFE with Module Federation when the NX automated generators fail. The setup was successfully implemented for the `reactdemos` application.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Project Structure](#project-structure)
- [Configuration Files](#configuration-files)
- [Module Federation Configuration](#module-federation-configuration)
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
- **Module Exposure**: Exposes its components/modules to be consumed by the host
- **Isolated Development**: Can be developed and tested independently

This guide shows how to create a **standalone GitHub repository** for a remote MFE using **React** with **manual Module Federation setup**.

> **📌 What You'll Build**: This guide provides a minimal "Hello World" setup to demonstrate the remote MFE architecture. You'll get a working React remote that can be consumed by the host shell. Once set up, you can add your own components, services, and business logic as needed.

> **⚠️ Important**: The NX generators (`nx g @nx/react:setup-mf`) may not work properly with all NX versions. This guide shows the **manual approach** that works reliably.

---

## Prerequisites

### Required Tools

- **Node.js**: v20+ (LTS recommended)
- **npm**: v10+ or **yarn**: v1.22+
- **Git**: Latest version
- **Nx CLI**: Latest version

### Knowledge Requirements

- React 18+ fundamentals
- Module Federation concepts
- TypeScript
- Bootstrap 5 (optional)

### Required Packages

You'll need access to:

- `@hemantajax/mfe-uikit` - Shared UIKit package (optional)

---

## Initial Setup

### 1. Create Nx Workspace

```bash
# Create directory
mkdir mfe-reactdemos
cd mfe-reactdemos

# Initialize Nx workspace (interactive prompts)
npx create-nx-workspace@latest .

# When prompted, choose:
# - Preset: react-monorepo
# - Application name: reactdemos
# - Bundler: webpack
# - Test runner: none (or your preference)
# - Stylesheet format: scss
# - Nx Cloud: Skip
```

### 2. Manual Module Federation Setup

**⚠️ Note**: The automated `nx g @nx/react:setup-mf` command may not work with all NX versions. Follow the manual setup below instead.

The manual setup involves:

1. Creating a Module Federation configuration file
2. Creating a bootstrap file for proper dependency sharing
3. Creating a remote entry file to expose components
4. Modifying the main entry point to use dynamic imports
5. Configuring webpack to use Module Federation Plugin

#### Step 2.1: Create Module Federation Config

Create **`apps/reactdemos/module-federation.config.js`**:

```javascript
/**
 * Module Federation configuration for reactdemos remote application
 * This exposes the Module entry point to be consumed by the host application
 */
module.exports = {
  name: 'reactdemos',

  /**
   * Expose the remote entry point
   * The host application will import this as: import('reactdemos/Module')
   */
  exposes: {
    './Module': './src/remote-entry.ts',
  },
};
```

#### Step 2.2: Create Bootstrap File

Create **`apps/reactdemos/src/bootstrap.tsx`**:

```typescript
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/app';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

#### Step 2.3: Create Remote Entry File

Create **`apps/reactdemos/src/remote-entry.ts`**:

```typescript
/**
 * Remote Entry Point for reactdemos
 * This file exposes the main App component to be consumed by the host application
 *
 * Usage in host:
 * import('reactdemos/Module').then(module => {
 *   const App = module.default;
 *   // Use the App component
 * });
 */

export { default } from './app/app';
export * from './app/app';
```

#### Step 2.4: Modify Main Entry Point

Update **`apps/reactdemos/src/main.tsx`**:

```typescript
/**
 * Main entry point for the reactdemos remote application
 * This file dynamically imports the bootstrap file to enable Module Federation
 * to properly share dependencies with the host application
 */
import('./bootstrap');
```

#### Step 2.5: Configure Webpack

Update **`apps/reactdemos/webpack.config.js`**:

```javascript
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const { join } = require('path');

// Load Module Federation config
const mfConfig = require('./module-federation.config');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    publicPath: 'auto',
    uniqueName: 'reactdemos',
  },
  devServer: {
    port: 4201,
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new NxAppWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index: './src/index.html',
      baseHref: '/',
      assets: ['./src/favicon.ico', './src/assets'],
      styles: ['./src/styles.scss'],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactWebpackPlugin(),
    new ModuleFederationPlugin({
      name: mfConfig.name,
      filename: 'remoteEntry.js',
      exposes: mfConfig.exposes,
      shared: {
        react: {
          singleton: true,
          requiredVersion: false,
          eager: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: false,
          eager: false,
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: false,
          eager: false,
        },
      },
    }),
  ],
};
```

### 3. Install Dependencies

```bash
# Install required dependencies
npm install react react-dom react-router-dom

# Install shared UIKit package (if needed)
npm install @hemantajax/mfe-uikit@latest

# If using GitHub Packages, create .npmrc first:
echo "@hemantajax:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}" >> .npmrc
```

### 4. Install Bootstrap (Optional)

```bash
npm install bootstrap@^5.3.8
```

### 5. Start Development

```bash
nx serve reactdemos
```

Your remote MFE is now running at `http://localhost:4201`

### Summary of Manual Setup

The manual Module Federation setup involved creating/modifying these key files:

**Created Files:**

1. `apps/reactdemos/module-federation.config.js` - Defines what to expose
2. `apps/reactdemos/src/bootstrap.tsx` - Actual React app bootstrap code
3. `apps/reactdemos/src/remote-entry.ts` - Exports the App component

**Modified Files:** 4. `apps/reactdemos/src/main.tsx` - Changed to dynamically import bootstrap 5. `apps/reactdemos/webpack.config.js` - Added ModuleFederationPlugin configuration 6. `tsconfig.base.json` - Added jsx support (if needed)

This approach works around the non-functional `nx g @nx/react:setup-mf` generator and gives you full control over the Module Federation configuration.

---

## Quick Reference: File Contents

Below are the exact file contents for the manual setup:

### File 1: module-federation.config.js

```javascript
/**
 * Module Federation configuration for reactdemos remote application
 */
module.exports = {
  name: 'reactdemos',
  exposes: {
    './Module': './src/remote-entry.ts',
  },
};
```

### File 2: src/bootstrap.tsx

```typescript
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/app';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

### File 3: src/remote-entry.ts

```typescript
/**
 * Remote Entry Point - exposes App component to host
 */
export { default } from './app/app';
export * from './app/app';
```

### File 4: src/main.tsx (Modified)

```typescript
/**
 * Main entry - dynamically imports bootstrap for Module Federation
 */
import('./bootstrap');
```

### File 5: webpack.config.js (Key Parts)

Add the `ModuleFederationPlugin` to your webpack config:

```javascript
const { ModuleFederationPlugin } = require('webpack').container;
const mfConfig = require('./module-federation.config');

module.exports = {
  output: {
    publicPath: 'auto',
    uniqueName: 'reactdemos',
  },
  devServer: {
    port: 4201,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    // ... other plugins
    new ModuleFederationPlugin({
      name: mfConfig.name,
      filename: 'remoteEntry.js',
      exposes: mfConfig.exposes,
      shared: {
        react: { singleton: true, requiredVersion: false, eager: false },
        'react-dom': { singleton: true, requiredVersion: false, eager: false },
        'react-router-dom': { singleton: true, requiredVersion: false, eager: false },
      },
    }),
  ],
};
```

### File 6: tsconfig.base.json (Add jsx support)

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
    // ... other options
  }
}
```

### Key Concepts Explained

**Why Bootstrap Pattern?**

- Module Federation requires shared dependencies to be resolved before app initialization
- Dynamic import (`import('./bootstrap')`) ensures dependencies load first
- This prevents "shared module not available for eager consumption" errors

**Why Remote Entry?**

- Exposes your App component for the host to consume
- Host imports as: `import('reactdemos/Module').then(m => m.default)`
- Separates exposure logic from main app logic

**Why Module Federation Config File?**

- Centralizes what modules to expose
- Makes webpack config cleaner and more maintainable
- Can be imported by webpack.config.js

**Shared Dependencies Configuration:**

- `singleton: true` - Ensures only one version loads (critical for React)
- `eager: false` - Load asynchronously (required for Module Federation)
- `requiredVersion: false` - Don't enforce strict version matching

### Verification

After setup, verify your remote is working:

```bash
# Start the remote
nx serve reactdemos

# Check these URLs:
# - http://localhost:4201 - Your app should load
# - http://localhost:4201/remoteEntry.js - Should return JavaScript (the federation entry point)
```

If `remoteEntry.js` loads successfully, your Module Federation setup is working!

---

## Project Structure

```
mfe-reactdemos/
├── apps/
│   └── reactdemos/                          # Remote application
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.tsx                  # Main App component
│       │   │   ├── app.module.scss          # App styles
│       │   │   ├── nx-welcome.tsx           # Sample component
│       │   │   └── app.spec.tsx             # Tests
│       │   ├── assets/                      # Static assets
│       │   ├── bootstrap.tsx                # Bootstrap file (dynamic import target)
│       │   ├── remote-entry.ts              # Remote entry (exposes App)
│       │   ├── main.tsx                     # Entry point (imports bootstrap)
│       │   ├── index.html                   # HTML template
│       │   └── styles.scss                  # Global styles
│       ├── module-federation.config.js      # Module Federation config
│       ├── webpack.config.js                # Webpack config with MF plugin
│       ├── project.json                     # Nx project config
│       ├── tsconfig.json                    # TS config
│       ├── tsconfig.app.json               # App TS config
│       └── eslint.config.mjs               # ESLint config
├── node_modules/
├── .gitignore
├── .npmrc                                   # npm registry config (optional)
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

### 3. apps/reactdemos/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "allowJs": false,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "types": ["node"]
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
```

### 4. apps/reactdemos/tsconfig.app.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": ["node"]
  },
  "files": ["../../node_modules/@nx/react/typings/cssmodule.d.ts", "../../node_modules/@nx/react/typings/image.d.ts"],
  "exclude": ["src/**/*.spec.ts", "src/**/*.test.ts", "src/**/*.spec.tsx", "src/**/*.test.tsx"],
  "include": ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx"]
}
```

### 5. apps/reactdemos/project.json

The project.json is typically auto-generated by Nx. Key configuration:

```json
{
  "name": "reactdemos",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/reactdemos/src",
  "tags": ["type:remote", "scope:reactdemos"],
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "options": {
        "compiler": "babel",
        "outputPath": "dist/apps/reactdemos",
        "index": "apps/reactdemos/src/index.html",
        "baseHref": "/",
        "main": "apps/reactdemos/src/main.tsx",
        "tsConfig": "apps/reactdemos/tsconfig.app.json",
        "assets": ["apps/reactdemos/src/favicon.ico", "apps/reactdemos/src/assets"],
        "styles": ["apps/reactdemos/src/styles.scss"],
        "webpackConfig": "apps/reactdemos/webpack.config.js"
      },
      "configurations": {
        "production": {
          "optimization": true,
          "outputHashing": "all",
          "sourceMap": false,
          "namedChunks": false,
          "extractLicenses": true,
          "vendorChunk": false
        }
      }
    },
    "serve": {
      "executor": "@nx/webpack:dev-server",
      "options": {
        "buildTarget": "reactdemos:build",
        "port": 4201
      },
      "configurations": {
        "production": {
          "buildTarget": "reactdemos:build:production"
        }
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
```

**Key points:**

- Uses `@nx/webpack:webpack` executor (not Angular-specific)
- Custom `webpack.config.js` for Module Federation
- Port 4201 for dev server

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
