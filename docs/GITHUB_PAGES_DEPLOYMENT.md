# GitHub Pages Deployment Guide

This guide explains how to deploy your Angular application to GitHub Pages using the automated deployment script.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [How It Works](#how-it-works)

## Prerequisites

Before deploying to GitHub Pages, ensure you have:

1. **Git Repository**: Your project must be a Git repository with a remote origin configured
2. **GitHub Account**: Access to the GitHub repository where you want to deploy
3. **GitHub Pages Enabled**: Enable GitHub Pages in your repository settings (Settings → Pages)
4. **Node.js and npm**: Installed on your system (Node.js 18+ recommended)
5. **Git Authentication**: Configure Git credentials for pushing to the repository

## Installation

The required package for GitHub Pages deployment is already included in the project's `devDependencies`:

```json
"angular-cli-ghpages": "^2.0.3"
```

If you need to install it manually in a new project, run:

```bash
npm install --save-dev angular-cli-ghpages
```

## Configuration

### 1. NPM Script Configuration

The deployment script is configured in `package.json`:

```json
{
  "scripts": {
    "deploy": "nx build dashboard --configuration=production && npx angular-cli-ghpages --dir=dist/apps/dashboard --repo=https://github.com/hemantajax/mfe-host.git --branch=gh-pages --no-silent"
  }
}
```

### 2. Script Breakdown

The deploy script consists of two parts:

**Part 1: Build the Application**
```bash
nx build dashboard --configuration=production
```
- Builds the `dashboard` application using Nx
- Uses the `production` configuration for optimized output
- Output is generated in `dist/apps/dashboard`

**Part 2: Deploy to GitHub Pages**
```bash
npx angular-cli-ghpages --dir=dist/apps/dashboard --repo=https://github.com/hemantajax/mfe-host.git --branch=gh-pages --no-silent
```
- `--dir=dist/apps/dashboard`: Specifies the build output directory
- `--repo=https://github.com/hemantajax/mfe-host.git`: Target GitHub repository
- `--branch=gh-pages`: Deploys to the `gh-pages` branch
- `--no-silent`: Shows deployment progress in the console

### 3. Customizing for Your Repository

To deploy to a different repository, update the `--repo` parameter:

```json
"deploy": "nx build dashboard --configuration=production && npx angular-cli-ghpages --dir=dist/apps/dashboard --repo=https://github.com/YOUR-USERNAME/YOUR-REPO.git --branch=gh-pages --no-silent"
```

### 4. Angular Configuration (Base Href)

For GitHub Pages to work correctly, ensure your Angular app has the correct base href. Update `apps/dashboard/project.json`:

```json
{
  "targets": {
    "build": {
      "configurations": {
        "production": {
          "baseHref": "/YOUR-REPO-NAME/"
        }
      }
    }
  }
}
```

**Note**: For user/organization sites (username.github.io), use `baseHref: "/"` instead.

## Deployment

### Simple Deployment

Run the deployment script:

```bash
npm run deploy
```

This will:
1. Build your application in production mode
2. Deploy the built files to the `gh-pages` branch
3. Push the changes to GitHub

### Manual Deployment Steps

If you prefer more control, you can run the steps separately:

**Step 1: Build the Application**
```bash
npm run build:prod
# or
nx build dashboard --configuration=production
```

**Step 2: Deploy to GitHub Pages**
```bash
npx angular-cli-ghpages --dir=dist/apps/dashboard --repo=https://github.com/YOUR-USERNAME/YOUR-REPO.git --branch=gh-pages
```

### First-Time Deployment

On your first deployment:

1. Ensure you're authenticated with GitHub:
   ```bash
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   ```

2. Run the deployment:
   ```bash
   npm run deploy
   ```

3. Go to your GitHub repository settings:
   - Navigate to **Settings** → **Pages**
   - Source should be set to `gh-pages` branch
   - Your site will be published at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

## Additional Options

### Using SSH Instead of HTTPS

If you prefer SSH authentication:

```json
"deploy": "nx build dashboard --configuration=production && npx angular-cli-ghpages --dir=dist/apps/dashboard --repo=git@github.com:YOUR-USERNAME/YOUR-REPO.git --branch=gh-pages --no-silent"
```

### Custom Message

Add a custom commit message:

```bash
npx angular-cli-ghpages --dir=dist/apps/dashboard --message="Deploy: $(date)"
```

### Dry Run

Test the deployment without actually pushing:

```bash
npx angular-cli-ghpages --dir=dist/apps/dashboard --dry-run
```

## Troubleshooting

### Issue: 404 Error After Deployment

**Solution**: Check the `baseHref` in your production configuration. It should match your repository name.

```json
"baseHref": "/YOUR-REPO-NAME/"
```

### Issue: Permission Denied

**Solution**: Ensure you have write access to the repository and proper Git authentication:

```bash
# For HTTPS
git config credential.helper store

# For SSH
ssh-add ~/.ssh/id_rsa
```

### Issue: Build Fails

**Solution**: Test the build locally first:

```bash
npm run build:prod
```

Fix any build errors before deploying.

### Issue: Old Version Still Showing

**Solution**: Clear browser cache or open the site in an incognito window. GitHub Pages caching can take a few minutes to update.

### Issue: Assets Not Loading

**Solution**: Verify that your asset paths are relative or use the base href correctly:

```typescript
// Good
<img src="assets/logo.png">

// Avoid
<img src="/assets/logo.png">
```

## How It Works

### Deployment Process

1. **Build Phase**:
   - Nx compiles the Angular application
   - Applies production optimizations (minification, tree-shaking, etc.)
   - Outputs static files to `dist/apps/dashboard`

2. **Deployment Phase**:
   - `angular-cli-ghpages` creates/updates the `gh-pages` branch
   - Copies all files from `dist/apps/dashboard` to the branch root
   - Commits the changes
   - Pushes to the remote repository

3. **GitHub Pages**:
   - Detects the push to `gh-pages` branch
   - Builds and deploys the site
   - Makes it available at your GitHub Pages URL

### Branch Structure

- **main/master**: Your source code
- **gh-pages**: Deployed static files (auto-generated, don't edit manually)

### Files Deployed

The following files are deployed to GitHub Pages:

- `index.html` - Main HTML file
- `*.js` - JavaScript bundles
- `*.css` - Stylesheets
- `assets/` - Images, fonts, and other static assets
- `favicon.ico` - Site icon

## Best Practices

1. **Always test locally** before deploying:
   ```bash
   npm run build:prod
   npx http-server dist/apps/dashboard -p 8080
   ```

2. **Use production builds** for deployment (already configured in the script)

3. **Commit your changes** before deploying to keep a clean history

4. **Review build output** for any warnings or errors

5. **Set up CI/CD** for automated deployments (GitHub Actions example below)

### GitHub Actions Automation (Optional)

Create `.github/workflows/deploy.yml`:

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

## Resources

- [angular-cli-ghpages Documentation](https://github.com/angular-schule/angular-cli-ghpages)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Nx Build Documentation](https://nx.dev/nx-api/angular/executors/webpack-browser)
- [Angular Deployment Guide](https://angular.dev/tools/cli/deployment)

## Support

For issues specific to:
- **Nx build**: Check [Nx Documentation](https://nx.dev)
- **GitHub Pages deployment**: Check [angular-cli-ghpages](https://github.com/angular-schule/angular-cli-ghpages/issues)
- **GitHub Pages hosting**: Check [GitHub Support](https://support.github.com)

