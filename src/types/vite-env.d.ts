// src/types/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_PUBLIC_KEY?: string;
  // add all your NEXT_PUBLIC_/VITE_ variables here
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
