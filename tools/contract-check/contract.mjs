// Static contract of the codebase: everything a pure rename must keep intact.
// Writes one sorted file per aspect into <out dir>, to diff against a baseline.
//   routes.txt      method + path of every backend route, and app.use paths
//   props-*.txt     property names (object literal keys, interface and type
//                   members) with their counts, backend and frontend
//   paths-*.txt     string literals that start with "/" (API paths, URLs, links)
//   storage.txt     localStorage keys used by the frontend
//   db.txt          every string literal in schema.ts (table, column, enum names)
//   env.txt         env var names read by the backend
// Usage: node contract.mjs <repo root> <out dir>
import fs from "node:fs";
import path from "node:path";
import { Project, SyntaxKind } from "ts-morph";

const [root, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const write = (name, lines) =>
    fs.writeFileSync(path.join(outDir, name), [...lines].sort().join("\n") + "\n");

const walk = (dir, exts) =>
    fs.existsSync(dir)
        ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
              const p = path.join(dir, d.name);
              if (d.isDirectory()) return d.name === "node_modules" ? [] : walk(p, exts);
              return exts.some((e) => d.name.endsWith(e)) ? [p] : [];
          })
        : [];

// Routes
const routes = new Set();
for (const file of walk(path.join(root, "backend/src/routes"), [".ts"])) {
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(/router\.(get|post|put|patch|delete|all)\(\s*["'`]([^"'`]+)["'`]/g)) {
        routes.add(`${m[1].toUpperCase()} ${m[2]}`);
    }
}
const app = fs.readFileSync(path.join(root, "backend/app.ts"), "utf8");
for (const m of app.matchAll(/app\.use\(\s*["'`]([^"'`]+)["'`]/g)) routes.add(`USE ${m[1]}`);
write("routes.txt", routes);

// Property names and "/" literals, per side
function scan(side, files) {
    const project = new Project({ skipAddingFilesFromTsConfig: true, compilerOptions: { allowJs: true, jsx: 4 } });
    const props = new Map();
    const paths = new Set();
    const storage = new Set();
    const bump = (name) => props.set(name, (props.get(name) ?? 0) + 1);
    for (const file of files) {
        const sf = project.addSourceFileAtPath(file);
        sf.forEachDescendant((node) => {
            const kind = node.getKind();
            if (
                kind === SyntaxKind.PropertyAssignment ||
                kind === SyntaxKind.ShorthandPropertyAssignment ||
                kind === SyntaxKind.PropertySignature ||
                kind === SyntaxKind.PropertyDeclaration
            ) {
                bump(node.getName());
            } else if (kind === SyntaxKind.JsxAttribute) {
                const name = node.getNameNode().getText();
                if (name === "path" || name === "to" || name === "href") {
                    const init = node.getInitializer()?.getText() ?? "";
                    paths.add(`jsx ${name}=${init}`);
                }
            } else if (kind === SyntaxKind.StringLiteral || kind === SyntaxKind.NoSubstitutionTemplateLiteral) {
                const value = node.getLiteralText();
                if (value.startsWith("/")) paths.add(value);
            } else if (kind === SyntaxKind.TemplateExpression) {
                const head = node.getHead().getLiteralText();
                if (head.startsWith("/")) paths.add(`${node.getText()}`.replace(/\$\{[^}]*\}/g, "${}"));
            } else if (kind === SyntaxKind.CallExpression) {
                const callee = node.getExpression().getText();
                if (/localStorage\.(get|set|remove)Item$/.test(callee)) {
                    const arg = node.getArguments()[0];
                    if (arg) storage.add(arg.getText());
                }
            }
        });
    }
    write(`props-${side}.txt`, [...props].map(([k, v]) => `${k} ${v}`));
    write(`paths-${side}.txt`, paths);
    return storage;
}

const backendFiles = [
    ...walk(path.join(root, "backend/src"), [".ts"]),
    path.join(root, "backend/app.ts"),
    path.join(root, "backend/index.ts"),
].filter((f) => fs.existsSync(f) && !f.endsWith(".test.ts"));
scan("backend", backendFiles);
const storage = scan("frontend", walk(path.join(root, "frontend/src"), [".ts", ".tsx"]));
write("storage.txt", storage);

// Database names: every string literal in schema.ts
const schema = new Project({ skipAddingFilesFromTsConfig: true }).addSourceFileAtPath(
    path.join(root, "backend/schema.ts"),
);
write(
    "db.txt",
    new Set(schema.getDescendantsOfKind(SyntaxKind.StringLiteral).map((s) => s.getLiteralText())),
);

// Env var names
const env = new Set();
for (const file of backendFiles) {
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(/(?:env|process\.env)\.([A-Z][A-Z0-9_]+)/g)) env.add(m[1]);
}
write("env.txt", env);
console.log(`contract written to ${outDir}`);
