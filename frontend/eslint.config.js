import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Regra estrita do react-hooks 7: fica como aviso, não erro. O padrão
      // recomendado (fetch isolado) vive no hook useRequisicao; forçar isso em
      // toda tela seria refatoração desproporcional.
      'react-hooks/set-state-in-effect': 'warn',
      // Só afeta o fast-refresh (HMR) em dev; contexts e helpers exportam hooks
      // e constantes junto dos componentes de propósito.
      'react-refresh/only-export-components': 'warn',
    },
  },
]);
