# How to Access the Remote App

Your ReactDemos micro-frontend can be accessed in **TWO ways**:

## 🌐 Method 1: Standalone Application

After deployment, your app runs as a complete standalone React application.

### Access URL:

```
https://hemantajax.github.io/mfe-react/
```

### Features:

- ✅ Full React application with routing
- ✅ Bootstrap 5 UI components
- ✅ Works independently without any host application
- ✅ Can be accessed directly in any browser

### Local Testing (Before Deployment):

```bash
npm start
# Opens at http://localhost:4201
```

---

## 🔌 Method 2: Module Federation Remote

Your app exposes a Module Federation remote entry that can be consumed by **ANY host application**.

### Remote Entry Point:

```
https://hemantajax.github.io/mfe-react/remoteEntry.mjs
```

### What's Exposed?

- **Module Name**: `reactdemos`
- **Exposed Entry**: `./Module` → Full React application

---

## 📦 How to Use in a Host Application

### Step 1: Configure Module Federation in Host

In your **host application's** `module-federation.config.js`:

```javascript
module.exports = {
  name: 'host',
  remotes: {
    reactdemos: 'reactdemos@https://hemantajax.github.io/mfe-react/remoteEntry.mjs',
  },
};
```

Or in **webpack.config.js** directly:

```javascript
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    reactdemos: 'reactdemos@https://hemantajax.github.io/mfe-react/remoteEntry.mjs',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    'react-router-dom': { singleton: true },
  },
});
```

### Step 2: Import and Use in Host Application

#### Option A: Dynamic Import with Promise

```typescript
// Import the remote module
import('reactdemos/Module')
  .then((module) => {
    const RemoteApp = module.default;
    // Use RemoteApp in your application
  })
  .catch((err) => {
    console.error('Failed to load remote module:', err);
  });
```

#### Option B: React Lazy Loading (Recommended)

```typescript
import React, { Suspense } from 'react';

// Lazy load the remote application
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

export default App;
```

#### Option C: Using in Routing

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

---

## 🧪 Testing the Remote Entry

### 1. Check if remoteEntry.mjs is accessible:

```bash
curl -I https://hemantajax.github.io/mfe-react/remoteEntry.mjs
```

Expected response:

```
HTTP/2 200
content-type: application/javascript
```

### 2. View in Browser:

Open this URL in your browser:

```
https://hemantajax.github.io/mfe-react/remoteEntry.mjs
```

You should see minified JavaScript code starting with `"use strict";var reactdemos;...`

---

## 📋 Complete Host Application Example

Here's a complete example of a host application consuming your remote:

### `host/module-federation.config.js`:

```javascript
module.exports = {
  name: 'host',
  remotes: {
    reactdemos: 'reactdemos@https://hemantajax.github.io/mfe-react/remoteEntry.mjs',
  },
};
```

### `host/src/App.tsx`:

```typescript
import React, { Suspense } from 'react';
import './App.css';

// Import remote module
const RemoteReactDemos = React.lazy(() => import('reactdemos/Module'));

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Host Application</h1>
        <nav>
          <a href="#home">Home</a>
          <a href="#reactdemos">ReactDemos MFE</a>
        </nav>
      </header>

      <main>
        <section id="home">
          <h2>Welcome to Host App</h2>
          <p>This application loads ReactDemos as a remote module.</p>
        </section>

        <section id="reactdemos">
          <h2>ReactDemos Micro-Frontend</h2>
          <Suspense
            fallback={
              <div className="loading">
                <p>Loading ReactDemos application...</p>
              </div>
            }
          >
            <RemoteReactDemos />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

export default App;
```

### TypeScript Declaration (if using TypeScript):

Create `host/src/declarations.d.ts`:

```typescript
declare module 'reactdemos/Module' {
  const Module: React.ComponentType;
  export default Module;
}
```

---

## 🔧 Shared Dependencies

Your remote shares these dependencies with the host:

| Package            | Version | Singleton |
| ------------------ | ------- | --------- |
| `react`            | 19.x    | ✅ Yes    |
| `react-dom`        | 19.x    | ✅ Yes    |
| `react-router-dom` | 6.29.x  | ✅ Yes    |

**Important**: The host application should use compatible versions to avoid version conflicts.

---

## 🚀 Deployment Checklist

Before accessing the remote, ensure:

- [ ] Application is built: `npm run build:prod`
- [ ] Deployed to GitHub Pages: `npm run deploy`
- [ ] GitHub Pages is enabled in repository settings
- [ ] Remote entry is accessible: `https://hemantajax.github.io/mfe-react/remoteEntry.mjs`
- [ ] Standalone app works: `https://hemantajax.github.io/mfe-react/`

---

## 🐛 Troubleshooting

### Issue: Cannot load remote module

**Solution**:

- Check if `remoteEntry.mjs` is accessible
- Verify CORS headers (GitHub Pages handles this automatically)
- Check browser console for specific errors

### Issue: Version conflicts

**Solution**:

- Ensure host uses compatible React versions (19.x)
- Check that singleton: true is set for shared dependencies

### Issue: 404 on remote entry

**Solution**:

- Verify deployment was successful
- Check GitHub Pages is enabled
- Wait 2-3 minutes after deployment

### Issue: Module not found

**Solution**:

- Verify the remote name matches: `reactdemos`
- Check the exposed module path: `./Module`
- Ensure the URL is complete with `https://`

---

## 📖 Additional Resources

- **Local Development**: See `README.md`
- **Full Deployment Guide**: See `docs/DEPLOYMENT_GUIDE.md`
- **Host/Shell Setup**: See `docs/HOST_SHELL_MFE_SETUP.md`

---

## 🌟 Quick Summary

| Access Method    | URL                                                      | Use Case               |
| ---------------- | -------------------------------------------------------- | ---------------------- |
| **Standalone**   | `https://hemantajax.github.io/mfe-react/`                | Direct browser access  |
| **Remote Entry** | `https://hemantajax.github.io/mfe-react/remoteEntry.mjs` | Module Federation host |
| **Local Dev**    | `http://localhost:4201`                                  | Development testing    |

**Repository**: https://github.com/hemantajax/mfe-react

---

**Last Updated**: October 31, 2025
