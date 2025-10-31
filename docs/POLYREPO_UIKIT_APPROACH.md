# Polyrepo UIKit Approach - Single Package Strategy

## 🎯 Overview

This guide describes the **UIKit approach** for polyrepo micro-frontend architecture, where we publish a **single npm package** (`@hemantajax/mfe-uikit`) that contains all shared code, while maintaining clean internal organization.

---

## 🏗️ Architecture

### Repository Structure

```
mfe-polyrepo-shared-libs/          ← Single repository
├── libs/
│   ├── layout/                    ← Non-publishable (internal)
│   ├── components/                ← Non-publishable (internal)
│   ├── services/                  ← Non-publishable (internal)
│   ├── core/                      ← Non-publishable (internal)
│   ├── utils/                     ← Non-publishable (internal)
│   ├── pipes/                     ← Non-publishable (internal)
│   ├── directives/                ← Non-publishable (internal)
│   ├── constants/                 ← Non-publishable (internal)
│   ├── styles/                    ← Non-publishable (internal)
│   └── uikit/                     ← PUBLISHABLE (meta-package)
│       ├── src/
│       │   └── index.ts           ← Re-exports all libraries
│       └── package.json           ← Published to npm
├── .github/workflows/
│   └── publish.yml
├── nx.json
├── package.json
└── tsconfig.base.json
```

### Key Concepts

1. **Internal Libraries** (Non-Publishable)

   - Organized by domain (layout, services, etc.)
   - Used only within the monorepo
   - Fast development with TypeScript path mappings
   - Clean separation of concerns

2. **UIKit Package** (Publishable)
   - Meta-package that re-exports everything
   - Only package published to npm
   - Consumed by shell and all remotes
   - Single version to manage

---

## 🚀 Step-by-Step Implementation

### Quick Reference

**TL;DR - Commands you'll use most:**

```bash
# 1. Create workspace
npx create-nx-workspace@latest .              # Follow prompts

# 2. Add framework support
npm install -D @nx/angular                    # or @nx/react

# 3. Generate libraries
nx g lib my-library                           # Interactive (recommended)

# OR specify everything explicitly
nx g @nx/angular:lib my-library               # Angular library
nx g @nx/react:lib my-library                 # React library
nx g @nx/js:lib my-library                    # Plain TypeScript

# Optional: Add --importPath to customize (usually not needed)
nx g lib my-library --importPath=@myorg/my-library

# 4. Build
nx build my-library
```

**Framework Choice Guide:**

- 🅰️ **Angular** → `@nx/angular:lib` - For components, services, pipes, directives
- ⚛️ **React** → `@nx/react:lib` - For React components and hooks
- 📦 **TypeScript** → `@nx/js:lib` - For utilities, models, constants (no framework code)

---

### Step 1: Create Repository

```bash
# Create directory
mkdir mfe-polyrepo-shared-libs
cd mfe-polyrepo-shared-libs

# Initialize Nx workspace (interactive prompts)
npx create-nx-workspace@latest .

# When prompted, choose:
# - Preset: ts (TypeScript)
# - Name: mfe-shared           ← This becomes your default import path prefix!
# - Nx Cloud: Skip
# - Package Manager: npm
```

**📝 About the Name:** The workspace name you choose (e.g., `mfe-shared`) becomes the default prefix for all library import paths:

- Workspace name: `mfe-shared` → Import paths: `@mfe-shared/layout`, `@mfe-shared/components`, etc.
- Workspace name: `hemantajax` → Import paths: `@hemantajax/layout`, `@hemantajax/components`, etc.

This is stored in `package.json` as `"name": "@mfe-shared/source"` and used in `tsconfig.base.json` for path mappings.

#### Customizing the Default Import Path Scope

**Option 1: Set during workspace creation** (Recommended)
Just choose your desired name when running `npx create-nx-workspace@latest .`

**Option 2: Manually configure in `package.json`**

```json
{
  "name": "@hemantajax/source", // Change @mfe-shared to @hemantajax
  "version": "0.0.0"
  // ...
}
```

**Option 3: Add `npmScope` to `nx.json`** (Optional, overrides package.json)

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "npmScope": "hemantajax" // Add this line
  // ...
}
```

**Real Example from your nxmfe workspace:**

```json
// package.json
{
  "name": "@nxmfe/source"          // Scope is @nxmfe
}

// tsconfig.base.json
{
  "paths": {
    "@nxmfe/shared/layout": ["libs/shared/layout/src/index.ts"],
    "@nxmfe/shared/services": ["libs/shared/services/src/index.ts"]
    // All imports use @nxmfe prefix
  }
}
```

### Step 2: Install Framework Support (Optional)

Choose based on your micro-frontend framework:

```bash
# For Angular micro-frontends
npm install -D @nx/angular

# For React micro-frontends
npm install -D @nx/react

# For framework-agnostic/vanilla TypeScript (already included)
# No additional installation needed - @nx/js comes with preset:ts
```

**Which to choose?**

| Generator         | Use When                                        | Examples                                                        |
| ----------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `@nx/angular:lib` | Angular components, services, pipes, directives | `layout`, `components`, `services`, `pipes`, `directives`       |
| `@nx/react:lib`   | React components and hooks                      | `components`, `shared-hooks`                                    |
| `@nx/js:lib`      | Framework-agnostic TypeScript code              | `utils`, `constants`, `models`, `types`, `uikit` (meta-package) |

**💡 Pro Tip:** You can mix and match! For example:

- Use `@nx/angular:lib` for `layout`, `components`, `pipes`
- Use `@nx/js:lib` for `utils`, `constants`, `core/models`
- Use `@nx/js:lib` for the `uikit` meta-package (since it just re-exports)

**For this guide:** We'll use `@nx/angular` since we're building for Angular micro-frontends.

```bash
npm install -D @nx/angular
```

### Step 3: Configure Generator Defaults (Recommended)

Add generator defaults to `nx.json` to avoid specifying the generator each time:

```json
{
  "generators": {
    "@nx/angular:library": {
      "linter": "eslint",
      "unitTestRunner": "jest"
    }
  }
}
```

### Step 4: Generate Non-Publishable Libraries

**Option 1: Interactive Mode (Recommended - Easiest)**

```bash
# Let Nx prompt you for everything
nx g lib layout
nx g lib components
nx g lib services
nx g lib core
nx g lib utils
nx g lib pipes
nx g lib directives
nx g lib constants
nx g lib styles

# Nx will prompt for:
# - Generator type (choose @nx/angular:library)
# - Import path (accept default or customize)
# - Other options
```

**Option 2: Specify Import Path Explicitly**

```bash
# If you want to control the import path names
nx g lib layout --importPath=@mfe-shared/layout
nx g lib components --importPath=@mfe-shared/components
nx g lib services --importPath=@mfe-shared/services
# ... etc
```

**Option 3: Use Directory Flag (Nx auto-generates import path)**

```bash
# Nx will auto-generate import path as @mfe-shared/<name>
nx g lib layout --directory=libs/layout
nx g lib components --directory=libs/components
# ... etc
```

**💡 Which to choose?**

- **Option 1** (Interactive): Best for learning, no memorization needed
- **Option 2** (Explicit import): Best for scripts/automation, full control
- **Option 3** (Directory): Good balance, less typing

**Note:** By default, Nx generates import paths based on your workspace name and library location, so you often don't need `--importPath` unless you want a specific naming convention.

### Step 5: Generate Publishable UIKit Package

**Interactive Mode (Recommended)**

```bash
nx g lib uikit

# When prompted:
# - Generator: @nx/js:library (plain TypeScript, not Angular)
# - Publishable: Yes
# - Import path: @hemantajax/mfe-uikit
```

**Or explicit (one-liner)**

```bash
nx g @nx/js:lib uikit --publishable --importPath=@hemantajax/mfe-uikit
```

**Why `@nx/js:lib`?** The uikit package is just a meta-package that re-exports other libraries - it doesn't contain any Angular components itself, so plain TypeScript is perfect.

**Why `@hemantajax/mfe-uikit` instead of `@mfe-shared/uikit`?**

For **publishable packages** (like uikit), use your **npm/GitHub username or organization**:

| Internal Libraries                    | Publishable Package                        |
| ------------------------------------- | ------------------------------------------ |
| `@mfe-shared/layout` ← Local only     | `@hemantajax/mfe-uikit` ← Published to npm |
| `@mfe-shared/components` ← Local only | Use your GitHub/npm username               |
| `@mfe-shared/services` ← Local only   | Must match registry scope                  |

**Examples:**

- GitHub Packages: `@hemantajax/mfe-uikit` (your GitHub username)
- npm Public: `@yourcompany/mfe-uikit` (your npm org)
- npm Private: `@myorg/mfe-uikit` (your private org)

The internal libraries use `@mfe-shared` for development convenience, but the published package needs a real registry scope.

### Step 6: Configure UIKit to Re-Export Everything

Create `libs/uikit/src/index.ts`:

```typescript
/**
 * @hemantajax/mfe-uikit
 *
 * Complete UI Kit for Micro-Frontend applications
 * Includes layout, components, services, utilities, and more
 */

// ===== Layout Components =====
export * from '@mfe-shared/layout';

// ===== UI Components =====
export * from '@mfe-shared/components';

// ===== Services =====
export * from '@mfe-shared/services';

// ===== Core (Guards, Interceptors, Models) =====
export * from '@mfe-shared/core';

// ===== Utilities =====
export * from '@mfe-shared/utils';

// ===== Pipes =====
export * from '@mfe-shared/pipes';

// ===== Directives =====
export * from '@mfe-shared/directives';

// ===== Constants =====
export * from '@mfe-shared/constants';

// Note: Styles are imported via SCSS, not exported from TypeScript
```

### Step 7: Configure UIKit package.json

Update `libs/uikit/package.json`:

```json
{
  "name": "@hemantajax/mfe-uikit",
  "version": "1.0.0",
  "description": "Complete UI Kit for Micro-Frontend applications - includes layout, components, services, and utilities",
  "main": "./src/index.js",
  "types": "./src/index.d.ts",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/@hemantajax",
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/hemantajax/mfe-polyrepo-shared-libs.git"
  },
  "keywords": ["angular", "micro-frontend", "module-federation", "ui-kit", "components", "services"],
  "author": "Hemant",
  "license": "MIT",
  "peerDependencies": {
    "@angular/common": "^18.0.0",
    "@angular/core": "^18.0.0",
    "@angular/router": "^18.0.0"
  }
}
```

### Step 8: Configure Build Dependencies

Update `libs/uikit/project.json`:

```json
{
  "name": "uikit",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/uikit/src",
  "projectType": "library",
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/uikit",
        "main": "libs/uikit/src/index.ts",
        "tsConfig": "libs/uikit/tsconfig.lib.json",
        "assets": ["libs/uikit/*.md"]
      },
      "dependsOn": ["^build"]
    }
  },
  "tags": ["type:publishable"],
  "implicitDependencies": ["layout", "components", "services", "core", "utils", "pipes", "directives", "constants"]
}
```

### Step 9: Configure npm Registry

Create `.npmrc` in root:

```
@hemantajax:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### Step 10: Create GitHub Actions Workflow

Create `.github/workflows/publish.yml`:

```yaml
name: Publish UIKit Package

on:
  push:
    branches: [main]
  release:
    types: [created]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@hemantajax'

      - name: Install dependencies
        run: npm ci

      - name: Build uikit (builds all dependencies)
        run: nx build uikit

      - name: Publish uikit package
        run: cd dist/libs/uikit && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        continue-on-error: true
```

### Step 11: Push to GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: UIKit shared libraries"

# Create GitHub repository
gh repo create mfe-polyrepo-shared-libs --public --source=. --remote=origin

# Push
git branch -M main
git push -u origin main
```

---

## 📦 Usage in Shell and Remotes

### Installation

```bash
# In shell or any remote repository
npm install @hemantajax/mfe-uikit@latest
```

### Import Everything from Single Package

```typescript
// Before (monorepo):
import { HeaderComponent } from '@nxmfe/shared/layout';
import { StorageService } from '@nxmfe/shared/services';
import { TruncatePipe } from '@nxmfe/shared/pipes';

// After (polyrepo with UIKit):
import { HeaderComponent, StorageService, TruncatePipe } from '@hemantajax/mfe-uikit';
```

### Using in Components

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { HeaderComponent, NotFoundComponent, StorageService, TruncatePipe } from '@hemantajax/mfe-uikit';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, NotFoundComponent, TruncatePipe],
  template: `
    <app-header />
    <router-outlet />
  `,
})
export class AppComponent {
  constructor(private storage: StorageService) {
    this.storage.setItem('user', { name: 'John' });
  }
}
```

### Using Styles

```scss
// styles.scss
@import '@hemantajax/mfe-uikit/styles/variables';
@import '@hemantajax/mfe-uikit/styles/mixins';
```

---

## 🔄 Update Workflow

### Updating UIKit Package

1. **Make changes** to any internal library (layout, services, etc.)
2. **Commit and push** to main branch
3. **GitHub Actions automatically**:
   - Builds all internal libraries
   - Builds uikit (which bundles everything)
   - Publishes to GitHub Packages
4. **Update consumers**:
   ```bash
   npm update @hemantajax/mfe-uikit@latest
   ```

### Version Management

Update version in `libs/uikit/package.json`:

```json
{
  "name": "@hemantajax/mfe-uikit",
  "version": "1.1.0" // Increment version
}
```

Or use npm:

```bash
cd libs/uikit
npm version patch  // 1.0.0 → 1.0.1
npm version minor  // 1.0.0 → 1.1.0
npm version major  // 1.0.0 → 2.0.0
```

---

## ✅ Benefits of UIKit Approach

### For Developers

✅ **Simple installation**: One package instead of nine  
✅ **Easy imports**: Import everything from one place  
✅ **Single version**: No version conflicts between packages  
✅ **Faster setup**: Less configuration required

### For Maintainers

✅ **Clean organization**: Internal libraries well-structured  
✅ **Easier publishing**: Publish one package instead of nine  
✅ **Better refactoring**: Change internal structure without breaking consumers  
✅ **Nx benefits**: Dependency graph, affected commands, caching

### For Architecture

✅ **Separation of concerns**: Code organized by domain  
✅ **Encapsulation**: Internal structure hidden from consumers  
✅ **Scalability**: Easy to add new internal libraries  
✅ **Flexibility**: Can split into multiple packages later if needed

---

## 📊 Comparison with Multi-Package Approach

| Aspect                    | UIKit (Single Package)              | Multi-Package           |
| ------------------------- | ----------------------------------- | ----------------------- |
| **Packages to publish**   | 1                                   | 9                       |
| **Installation**          | `npm install @hemantajax/mfe-uikit` | Install 9 packages      |
| **Import complexity**     | Single import source                | Multiple import sources |
| **Version management**    | 1 version                           | 9 versions              |
| **Setup time**            | ~2 hours                            | ~4 hours                |
| **Maintenance**           | Simple                              | Complex                 |
| **Internal organization** | ✅ Clean                            | ✅ Clean                |
| **Publishing workflow**   | Simple                              | Complex                 |
| **Best for**              | Most projects                       | Large enterprises       |

---

## 🧪 Testing Locally

### Build and Test

```bash
# Build uikit
nx build uikit

# Check output
ls -la dist/libs/uikit/

# Test in another project (local link)
cd dist/libs/uikit
npm link

# In shell/remote project
npm link @hemantajax/mfe-uikit
```

### Verify Package Contents

```bash
# Check what's included
cd dist/libs/uikit
tar -tzf $(npm pack)
```

---

## 🚀 Deployment Checklist

- [ ] All internal libraries created
- [ ] Code copied from monorepo
- [ ] UIKit library created (publishable)
- [ ] UIKit re-exports all libraries
- [ ] package.json configured
- [ ] GitHub Packages registry configured
- [ ] GitHub Actions workflow created
- [ ] Repository pushed to GitHub
- [ ] First build successful
- [ ] Package published to GitHub Packages
- [ ] Package visible in GitHub Packages UI
- [ ] Test installation in shell/remote

---

## 📚 Related Documentation

- [Nx Library Types](./NX_LIBRARY_TYPES.md) - Publishable vs Non-Publishable
- [Polyrepo Implementation Plan](./POLYREPO_IMPLEMENTATION_PLAN.md) - Complete setup guide
- [Monorepo vs Polyrepo](./MONOREPO_VS_POLYREPO.md) - Architecture comparison

---

## 🔧 Daily Development Workflow

Once your workspace is set up, here are the commands you'll use daily:

### Adding a New Library

```bash
# Interactive mode (recommended)
nx g lib my-new-lib

# Or specify generator explicitly
nx g @nx/angular:lib my-new-lib

# Only add --importPath if you need a custom name
nx g lib my-new-lib --importPath=@custom/my-lib
```

### Adding a Component to an Existing Library

```bash
# Simple form
nx g component my-component --project=layout

# Full form
nx g @nx/angular:component my-component --project=layout
```

### Building and Testing

```bash
# Build a single library
nx build layout

# Build everything
nx run-many --target=build --all

# Test a library
nx test layout

# Lint
nx lint layout
```

### Publishing Updates

```bash
# 1. Make changes to any internal library
# 2. Update version in libs/uikit/package.json
npm version patch  # or minor, or major

# 3. Commit and push
git add .
git commit -m "feat: add new feature"
git push

# 4. GitHub Actions automatically publishes to npm
# 5. Update in consumer projects
cd ../my-shell-app
npm update @hemantajax/mfe-uikit@latest
```

**Key Takeaway:** Use the simple `nx g lib` and `nx g component` forms. Nx will prompt you for what it needs!

---

## 🎉 Summary

The **UIKit approach** gives you:

- ✅ **Single package** for easy consumption
- ✅ **Clean internal organization** for maintainability
- ✅ **Nx benefits** for development
- ✅ **Simple publishing** workflow
- ✅ **Best of both worlds**: monorepo development, polyrepo deployment

This is the recommended approach for most polyrepo micro-frontend projects!

---

**Created**: October 21, 2025  
**Repository**: https://github.com/hemantajax/mfe-polyrepo-shared-libs (to be created)  
**Package**: `@hemantajax/mfe-uikit`
