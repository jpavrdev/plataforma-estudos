// Semantic rename of every declaration inside the given files whose name is in
// the mapping: functions, variables, destructured bindings, parameters, types,
// interfaces and classes, in any scope. References follow, and a shorthand
// property keeps its key ({ old } becomes { old: renamed }). Property names are
// never touched. Pick new names that do not collide with names already in scope:
// the language service does not check for shadowing, so run the typecheck after.
//
// List the names first:  node rename-locals.mjs <tsconfig.json> --list <file>...
// Rename:                node rename-locals.mjs <tsconfig.json> <mapping.json> <file>...
// mapping.json: { "oldName": "newName" }
import fs from "node:fs";
import path from "node:path";
import { Node, Project, SyntaxKind } from "ts-morph";

const [tsconfig, mode, ...files] = process.argv.slice(2);
const project = new Project({ tsConfigFilePath: tsconfig });

const KINDS = [
    SyntaxKind.VariableDeclaration,
    SyntaxKind.BindingElement,
    SyntaxKind.Parameter,
    SyntaxKind.FunctionDeclaration,
    SyntaxKind.TypeAliasDeclaration,
    SyntaxKind.InterfaceDeclaration,
    SyntaxKind.ClassDeclaration,
    SyntaxKind.EnumDeclaration,
];

// The identifier a declaration binds, if it binds a single plain name.
function boundName(node) {
    const nameNode = node.getNameNode?.();
    return nameNode && Node.isIdentifier(nameNode) ? nameNode : null;
}

function declarations(sf) {
    return sf.getDescendants().filter((n) => KINDS.includes(n.getKind()) && boundName(n));
}

if (mode === "--list") {
    for (const file of files) {
        const sf = project.getSourceFileOrThrow(path.resolve(file));
        const names = new Map();
        for (const d of declarations(sf)) {
            const name = boundName(d).getText();
            names.set(name, (names.get(name) ?? 0) + 1);
        }
        console.log(`== ${file}`);
        console.log([...names.keys()].sort().join(" "));
    }
} else {
    const mapping = JSON.parse(fs.readFileSync(mode, "utf8"));
    let renamed = 0;
    for (const file of files) {
        const sf = project.getSourceFileOrThrow(path.resolve(file));
        // Re-query after every rename: a rename rewrites the tree.
        for (;;) {
            const next = declarations(sf).find((d) => mapping[boundName(d).getText()]);
            if (!next) break;
            const id = boundName(next);
            id.rename(mapping[id.getText()], { usePrefixAndSuffixText: true });
            renamed++;
        }
    }
    await project.save();
    console.log(`renamed ${renamed} declarations`);
}
