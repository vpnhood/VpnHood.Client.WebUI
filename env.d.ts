/// <reference types="vite/client" />
// vite-env.d.ts

// Stamped by vite.config.ts at build time.
interface ImportMetaEnv {
  readonly PACKAGE_VERSION: string;
  readonly SPA_BUILD_TIME: string;
  readonly SPA_IS_CI_BUILD: boolean;
}
