#!/usr/bin/env sh
set -e

git add core/parser.js
git commit -m "fix(#13): defer v{} fallback resolution to instantiation time"

git add core/modules.js index.shared.js
git commit -m "fix(#12 #13): resolve embedded v{} in props, apply fallbacks, propagate fs"

git add core/evaluator.js core/evaluator.stub.js core/transpiler.js
git commit -m "fix(#10 #11): per-call evaluator isolation and module-relative baseDir"

git add CHANGELOG.md core/helpers/lib.js package.json package-lock.json
git commit -m "chore: bump to 5.0.4"

gh issue close 13 --comment "Fixed in v5.0.4."
gh issue close 12 --comment "Fixed in v5.0.4."
gh issue close 11 --comment "Fixed in v5.0.4."
gh issue close 10 --comment "Fixed in v5.0.4."
