// Semantic rename of exported symbols, the same mechanism as the editor's
// "Rename Symbol": every reference in the project follows, and a shorthand
// property keeps its key ({ old } becomes { old: renamed }), so object shapes
// and API payloads stay the same.
// Usage: node rename.mjs <tsconfig.json> <mapping.json>
// mapping.json: { "<file relative to the tsconfig dir>": { "OldName": "NewName" } }
// A member of an exported object literal goes as "object.member", for services
// written as objects ({ "authService.oldMethod": "newMethod" }).
import fs from "node:fs";
import path from "node:path";
import { Node, Project } from "ts-morph";

const [tsconfig, mappingFile] = process.argv.slice(2);
const base = path.dirname(path.resolve(tsconfig));
const mapping = JSON.parse(fs.readFileSync(mappingFile, "utf8"));
const project = new Project({ tsConfigFilePath: tsconfig });

function memberOf(decl, name) {
    if (!Node.isVariableDeclaration(decl)) return undefined;
    const init = decl.getInitializer();
    return init && Node.isObjectLiteralExpression(init) ? init.getProperty(name) : undefined;
}

let renamed = 0;
const missing = [];
for (const [file, names] of Object.entries(mapping)) {
    const sf = project.getSourceFileOrThrow(path.join(base, file));
    const exported = sf.getExportedDeclarations();
    for (const [oldName, newName] of Object.entries(names)) {
        const [owner, member] = oldName.split(".");
        const decl = exported.get(owner)?.[0];
        const target = member ? memberOf(decl, member) : decl;
        if (!target || !("rename" in target)) {
            missing.push(`${file}: ${oldName}`);
            continue;
        }
        target.rename(newName, { usePrefixAndSuffixText: true });
        renamed++;
    }
}
await project.save();
console.log(`renamed ${renamed} symbols`);
if (missing.length) {
    console.log(`not found:\n  ${missing.join("\n  ")}`);
    process.exitCode = 1;
}
