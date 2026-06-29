import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
    { ignores: ["node_modules", "dist", "drizzle", "uploads"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: { ...globals.node },
        },
        rules: {
            // Permite parâmetros/variáveis intencionalmente não usados com prefixo _.
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
        },
    },
    {
        // Testes podem usar any em helpers de request.
        files: ["tests/**"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    prettier,
);
