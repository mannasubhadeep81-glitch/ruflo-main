#!/usr/bin/env bash
set -euo pipefail

ZIP=""
for f in ./*.zip; do
  [ -f "$f" ] && ZIP="$f" && break
done

if [ -z "$ZIP" ]; then
  echo "ERROR: Upload ruflo-main.zip to this Codespace first."
  exit 1
fi

rm -rf ruflo-main
unzip -q "$ZIP"

if [ -d "ruflo-main/ruflo-main" ]; then
  ROOT="ruflo-main/ruflo-main"
else
  ROOT="ruflo-main"
fi

cp -a "$ROOT"/. .
rm -rf ruflo-main
rm -f "$ZIP"

node - <<'NODE'
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json','utf8'));
p.scripts ||= {};
p.scripts.dev = 'tsx watch v3/@claude-flow/cli/src/index.ts';
delete p.scripts['v3:domains'];
delete p.scripts['v3:swarm'];
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
const gp = 'v3/plugins/gastown-bridge/package.json';
if (fs.existsSync(gp)) {
  const g = JSON.parse(fs.readFileSync(gp,'utf8'));
  if (g.scripts) delete g.scripts.benchmark;
  fs.writeFileSync(gp, JSON.stringify(g, null, 2) + '\n');
}
NODE

npm ci
npm run build
npm test
