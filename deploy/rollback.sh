#!/usr/bin/env bash
# Puts the previous build back on the VPS. Run from the repo root, like deploy.sh:
#
#   DEPLOY_HOST=user@vps ./deploy/rollback.sh pages   "current" back to the release before it (deploy.sh keeps 5)
#   DEPLOY_HOST=user@vps ./deploy/rollback.sh lead    the lead endpoint deploy.sh replaced last (lead.mjs.prev), restarted
#   DEPLOY_HOST=user@vps ./deploy/rollback.sh all     both
#
# The lead endpoint's database is never touched: server/lead.mjs only adds columns (open()), and an older lead.mjs runs
# on a database with columns it doesn't know. The file rolled back from is kept as lead.mjs.rolledback.
# Then the live site and /api/readyz are checked over HTTPS, as after a deploy.
set -euo pipefail

HOST="${DEPLOY_HOST:?set DEPLOY_HOST, like user@1.2.3.4 or a Host from ~/.ssh/config}"
WWW="${DEPLOY_WWW:-/var/www/openfrequency-web}"
APP="${DEPLOY_APP:-/opt/openfrequency-web}"
WHAT="${1:-all}"
case "$WHAT" in pages | lead | all) ;; *) echo "usage: DEPLOY_HOST=... $0 pages|lead|all"; exit 2 ;; esac
cd "$(dirname "$0")/.."
DOMAIN=$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('site.config.json','utf8')).domain||'')")

if [ "$WHAT" != lead ]; then
  echo "== pages"
  ssh "$HOST" bash -s -- "$WWW" <<'REMOTE'
set -euo pipefail
WWW="$1"
cur=$(basename "$(readlink -f "$WWW/current")")
prev=$(ls -1 "$WWW/releases" | sort | awk -v c="$cur" '$0 < c' | tail -n 1)
[ -n "$prev" ] || { echo "no release before $cur"; exit 1; }
ln -sfn "$WWW/releases/$prev" "$WWW/current.tmp" && mv -Tf "$WWW/current.tmp" "$WWW/current"
echo "current: $cur -> $prev"
REMOTE
fi

if [ "$WHAT" != pages ]; then
  echo "== lead endpoint"
  ssh "$HOST" bash -s -- "$APP" <<'REMOTE'
set -euo pipefail
APP="$1"
[ -f "$APP/server/lead.mjs.prev" ] || { echo "no lead.mjs.prev to go back to"; exit 1; }
cp -p "$APP/server/lead.mjs" "$APP/server/lead.mjs.rolledback"
mv "$APP/server/lead.mjs.prev" "$APP/server/lead.mjs"
sudo systemctl restart openfrequency-web-leads
echo "lead.mjs.prev is back and restarted (the one rolled back from: lead.mjs.rolledback)"
REMOTE
fi

echo "== check https://$DOMAIN"
sleep 1
check() {
  local code=""
  for _ in $(seq 1 10); do
    code=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN$1" || true)
    [ "$code" = 200 ] && break
    [ "$code" = 404 ] && [ "$1" = /api/readyz ] && break
    sleep 2
  done
  echo "$1 $code"
  CODE="$code"
}
check /
[ "$CODE" = 200 ] || { echo "still not 200 after the rollback"; exit 1; }
check /api/readyz
# A lead.mjs from before /api/readyz (the one on the server until the first deploy with it) answers 404 there: then
# /api/health, which every version has, says whether it runs.
if [ "$CODE" = 404 ]; then check /api/health; fi
[ "$CODE" = 200 ] || { echo "the lead endpoint is still not answering after the rollback"; exit 1; }
echo "rolled back: $WHAT"
