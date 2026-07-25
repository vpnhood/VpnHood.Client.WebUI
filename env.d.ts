/// <reference types="vite/client" />
// vite-env.d.ts

// Stamped by vite.config.ts at build time.
interface ImportMetaEnv {
  readonly PACKAGE_VERSION: string;
  readonly SPA_LOCAL_BUILD_NUMBER: number;
  readonly SPA_IS_CI_BUILD: boolean;
}
