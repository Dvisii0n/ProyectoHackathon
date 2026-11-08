/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del back, p. ej. http://localhost:8000/api */
  readonly VITE_URL_API?: string;
  /** "true" para usar los datos de ejemplo de src/datos-mock */
  readonly VITE_USAR_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
