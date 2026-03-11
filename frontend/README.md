# 🚀 Orionex ViteJS Enterprise Boilerplate

A production-ready, highly optimized ViteJS frontend boilerplate built on enterprise-grade architecture. 

This template leverages a **Feature-Sliced / Domain-Driven Design** to keep code scalable, alongside next-generation rendering and compilation tools (Million.js, SWC, LightningCSS) to deliver maximum performance.

---

## 📑 Table of Contents
1.[Tech Stack & Dependencies](#-tech-stack--dependencies)
2. [Project Architecture](#-project-architecture)
3.[Architecture Rules (Dos & Don'ts)](#-architecture-rules-dos--donts)
4.[Developer Guide: Step-by-Step](#-developer-guide-step-by-step)
5. [Theming & Authentication](#-theming--authentication)
6. [Verification & Metrics](#-verification--metrics)

---

## 📦 Tech Stack & Dependencies

To maintain maximum performance, it is critical to understand the distinction between our standard UI dependencies and our core optimization engine.

### Core UI & Logic
*   **React & React Router DOM**: Core rendering and routing.
*   **TailwindCSS, PostCSS, Autoprefixer**: Utility-first styling.
*   **Framer Motion**: Page transitions and animations.
*   **Lucide React**: Lightweight, scalable SVG icons.

### ⚠️ Critical Optimization Engine (DO NOT REMOVE)
These packages are explicitly configured to maximize speed. **Modifying or removing them will break the optimization pipeline and degrade performance:**

*   ⚡ **`million` / `million/compiler`**: Replaces the standard React Virtual DOM with a hyper-fast *Block Virtual DOM*, vastly improving rendering speeds for dynamic lists and components.
*   🦀 **`@vitejs/plugin-react-swc`**: Uses Rust-based SWC (instead of Babel) for instant local startup times and blazing-fast Hot Module Replacement (HMR).
*   🎨 **`lightningcss`**: A rigorous, Rust-based CSS minifier that processes styles faster than standard PostCSS minifiers.
*   🎉 **`@builder.io/partytown`**: Offloads third-party scripts (like analytics) to a Web Worker, freeing up the main thread for UI rendering.
*   🗜️ **`vite-plugin-compression`**: Automatically generates pre-compressed `.gz` (Gzip) and `.br` (Brotli) bundles for production.
*   🖼️ **`vite-plugin-image-optimizer`**: Automatically evaluates and compresses static visual assets.
*   🔤 **`unplugin-fonts`**: Downloads and injects fonts locally, preventing Cumulative Layout Shift (CLS) and render-blocking external requests.

---

## 📂 Project Architecture

The `src/` directory strictly follows a **Domain-Driven Architecture**. Code is grouped by *feature* rather than by file type.

```text
src/
 ├─ app/           # App bootstrapping (main.tsx, App.tsx, global providers)
 ├─ features/      # ⭐️ Domain-specific modules (users, products, etc.)
 │   └─ dashboard/
 │       ├─ api/        # API calls specific to the dashboard
 │       ├─ components/ # Components only used in the dashboard
 │       ├─ hooks/      # Hooks only used in the dashboard
 │       ├─ pages/      # Route pages (loaded via React.lazy)
 │       ├─ store/      # Local state for this feature
 │       └─ types.ts    # TypeScript interfaces for this feature
 ├─ shared/        # Reusable global items (Buttons, Modals, API clients)
 ├─ layouts/       # Global shell layouts (e.g., MainLayout)
 ├─ config/        # Environment variables and routing configs
 ├─ assets/        # Visual assets (images, vectors)
 ├─ styles/        # Global CSS (Tailwind entry point)
 └─ types/         # Global TypeScript definitions
```

---

## ⚖️ Architecture Rules (Dos & Don'ts)

To keep the codebase from becoming a tangled mess, strictly follow these rules:

### ✅ DOs
*   **DO create domain-specific folders:** Put all components, state, and API logic related to a specific domain (e.g., `Users`) inside its own folder `features/users/`.
*   **DO use `shared/` for generic tools:** If a component (like a Button) or utility (like an Axios wrapper) is used across *multiple* features, put it in `shared/`.
*   **DO use Route-Level Code Splitting:** Always load feature pages dynamically in `app/App.tsx` using `React.lazy()`. This ensures users only download the code they need.

### ❌ DON'Ts
*   **DON'T cross-import between features:** `features/users` should **never** import a file from `features/products`. If they both need the same logic, move that logic to `shared/`.
*   **DON'T inject heavy scripts directly into `index.html`:** All third-party analytics or tracking tools must be routed through `Partytown` to protect UI performance.
*   **DON'T alter `vite.config.ts` carelessly:** Removing optimization plugins will severely impact memory footprint and load times.

---

## 🛠️ Developer Guide: Step-by-Step

Welcome to the team! This architecture is designed to keep your code clean as the app scales. Here is exactly how to add new features to the boilerplate.

### 1. Create a New Page (Feature)
Imagine you need to build a "Settings" page. Do not dump it in a generic "pages" folder.

1. Create a new feature directory: `src/features/settings/`.
2. Inside it, create a `pages/` folder.
3. Create your component: `src/features/settings/pages/SettingsPage.tsx`.

```tsx
import React from 'react';

// You MUST default export pages for React.lazy() to work properly!
const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold dark:text-white">Account Settings</h1>
      <p className="text-slate-500">Configure your preferences here.</p>
    </div>
  );
};

export default SettingsPage; 
```

### 2. Add the Page to the Router (Lazy Loading)
We use **Code Splitting** so users don't download the whole app at once.

1. Open `src/app/App.tsx`.
2. Add your new page to the **Lazy Imports** section at the top:
   ```tsx
   const SettingsPage = React.lazy(() => import('@/features/settings/pages/SettingsPage'));
   ```
3. Scroll down to the `<Routes>` block and register your route:
   ```tsx
   <Route path="/settings" element={
     <PageTransition>
       <SettingsPage />
     </PageTransition>
   } />
   ```

### 3. Add the Page to the Sidebar
Give users a way to navigate to your new page.

1. Open `src/layouts/components/Sidebar.tsx`.
2. Find the `rawNavItems` array inside the `useMemo` block.
3. Add your route (importing your preferred icon from `lucide-react`):
   ```tsx
   { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' } 
   ```

---

## 🌗 Theming & Authentication

### Global Dark Mode
You do not need to write complex theme logic. 
* **Styling:** Simply append `dark:` to any Tailwind class (e.g., `bg-white dark:bg-slate-900`).
* **Cross-Subdomain Persistence:** When a user toggles the theme in the Header, `MainLayout.tsx` saves a cookie named `ornx-theme` to `.orionex.id`. This means their theme preference will automatically persist across *all* Orionex applications!

### Mock Authentication
To allow you to build UI layouts immediately, this template utilizes a **Mock Authentication Provider** located at `src/features/auth/contexts/AuthContext.tsx`.
* It simulates a logged-in User profile so your Sidebar and Header work out of the box.
* **To go live:** When the backend is ready, simply replace the `mockUser` state inside `AuthContext.tsx` with your real API fetching logic.

---

## 📊 Verification & Metrics

* **Suspense Boundaries:** Ensure any new routing components added to `app/App.tsx` are properly wrapped in `<Suspense>` (Note: This is handled automatically if you use the pre-configured `AnimatedRoutes`).
* **Debugging:** Standard Vite `console.log()` metrics apply during development. 
* **Production Build:** When running `npm run build`, check the output terminal. The `dist/assets` folder should isolate `vendor-react` chunks separately from your feature code, proving that code-splitting is working correctly.

