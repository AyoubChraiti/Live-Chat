Assets for the Live Chat frontend

Files:
- logo.svg — small brand mark used in the landing and header
- avatar-placeholder.svg — simple avatar placeholder for users without images
- hero-illustration.svg — lightweight hero illustration for the landing or marketing sections
- favicon.svg — small favicon for the site

Usage:
- Import SVGs directly in React components, for example:
  import Logo from '@/assets/logo.svg';
  or
  <img src="/src/assets/logo.svg" alt="Live Chat logo" />

Notes:
- These are intentionally lightweight placeholder SVGs. Replace them with production assets as needed.
- If you use a bundler that requires SVGR (import as React component), ensure the front `package.json` includes the appropriate configuration.
