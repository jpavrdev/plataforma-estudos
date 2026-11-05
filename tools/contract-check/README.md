# contract-check

Tools for moving the code to English without breaking anything. Every rename PR
must leave these contracts exactly as they were on `develop`:

- **HTTP**: API routes and JSON field names. During a deploy, browsers that still
  have the old frontend open keep calling the new backend, and the monitor, the
  payment webhook and the OAuth callbacks depend on the routes.
- **Database**: table, column and enum names, the values stored in them, and the
  property names in `backend/schema.ts` (many queries return whole rows, so those
  names become JSON fields).
- **URLs**: frontend routes, links in emails and certificate QR codes.
- **Environment variables** and **localStorage keys**.

## Tools

| File | What it does |
| --- | --- |
| `contract.mjs` | Writes the static contract of a checkout (routes, property names, `/` paths, localStorage keys, schema strings, env vars) into a folder, one sorted file per aspect. |
| `record-shapes.mjs` | Preload that records the shape of every JSON response (method, route, status, each key path and its type). |
| `run-shapes.sh` | Runs the backend integration suite with the recorder and writes the sorted shapes. Two runs of the same code give zero differences. |
| `rename.mjs` | Semantic rename of exported symbols with ts-morph, like the editor's "Rename Symbol". Shorthand properties keep their keys. |
| `rename-locals.mjs` | Same, for every declaration inside the given files (variables, parameters, local functions, types), in any scope. `--list` prints the names first. It does not check for shadowing, so new names must not collide with names in scope. |

## Checking a branch

```bash
cd tools/contract-check && npm install

# baseline from develop, in a separate worktree
git worktree add --detach /tmp/base origin/develop
(cd /tmp/base/backend && npm ci)
node contract.mjs /tmp/base /tmp/contract-base
bash run-shapes.sh /tmp/base/backend /tmp/contract-base/shapes.txt

# the branch
node contract.mjs <repo> /tmp/contract-branch
bash run-shapes.sh <repo>/backend /tmp/contract-branch/shapes.txt

for f in /tmp/contract-base/*.txt; do diff "$f" "/tmp/contract-branch/$(basename "$f")"; done
```

Every file must match. The only accepted difference is an import path inside
`schema.ts` (it shows up in `db.txt`) when a module it imports is renamed. Also run
`npx drizzle-kit generate` in `backend` (it must say there are no schema changes),
the typecheck, the unit and integration tests, the lint of both projects and the
frontend build.

`run-shapes.sh` uses the same container and port as `backend/tests/run-integration.sh`,
so two runs cannot happen at the same time.
