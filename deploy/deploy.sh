#!/usr/bin/env bash
# Builds the site and puts it on the VPS. Run from the repo root, on any machine with Node, ssh and tar (Git Bash on
# Windows is enough):
#
#   DEPLOY_HOST=user@vps ./deploy/deploy.sh
#
# 1. The real build (it stops while any fact in site.config.json is empty) and every test, the accessibility check in a
#    real browser included: a failed or skipped test stops the deploy before anything is uploaded.
# 2. The pages go to a new folder under /var/www/openfrequency-web/releases, and "current" points at it in one step,
#    so a visitor never sees half a deploy. The last 5 releases are kept; deploy/rollback.sh pages points "current"
#    back at the one before.
# 3. The lead endpoint (server/lead.mjs) goes to /opt/openfrequency-web, and the service restarts only if it changed.
#    The file it replaces is kept beside it as lead.mjs.prev.
# 4. The live site and the endpoint are checked over HTTPS: the pages, and /api/readyz, which reads the database. If the
#    endpoint that was just replaced is not ready within 30 seconds, lead.mjs.prev goes back and the deploy fails.
#
# Once on the VPS, before the first deploy (the deploy user needs sudo for the restart):
#   sudo mkdir -p /var/www/openfrequency-web/releases /opt/openfrequency-web/server
#   sudo chown -R "$USER" /var/www/openfrequency-web /opt/openfrequency-web
#   then deploy/openfrequency-web-leads.service, deploy/openfrequency-web-leads-backup.timer (their headers) and
#   deploy/Caddyfile.example.
set -euo pipefail

HOST="${DEPLOY_HOST:?set DEPLOY_HOST, like user@1.2.3.4 or a Host from ~/.ssh/config}"
WWW="${DEPLOY_WWW:-/var/www/openfrequency-web}"
APP="${DEPLOY_APP:-/opt/openfrequency-web}"
cd "$(dirname "$0")/.."

DOMAIN=$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('site.config.json','utf8')).domain||'')")

echo "== build and test"
node build.mjs
# A skipped test is a test that did not run (the accessibility check without a browser): it stops the deploy too.
if ! out=$(node --test --test-concurrency=1 --test-reporter=spec test/*.test.mjs 2>&1); then echo "$out" | tail -40; echo "tests failed: nothing was uploaded"; exit 1; fi
skipped=$(echo "$out" | sed -n 's/^ℹ skipped \([0-9]*\)$/\1/p')
[ "${skipped:-0}" = 0 ] || { echo "$out" | grep -i skip | head; echo "$skipped test(s) skipped: nothing was uploaded"; exit 1; }
echo "tests passed"

RELEASE=$(date -u +%Y%m%d-%H%M%S)
echo "== pages -> $HOST:$WWW/releases/$RELEASE"
tar -C dist -czf - . | ssh "$HOST" "set -e
  mkdir -p '$WWW/releases/$RELEASE'
  tar -xzf - -C '$WWW/releases/$RELEASE'
  chmod -R a+rX '$WWW/releases/$RELEASE'
  ln -sfn '$WWW/releases/$RELEASE' '$WWW/current.tmp' && mv -Tf '$WWW/current.tmp' '$WWW/current'
  cd '$WWW/releases' && ls -1 | sort | head -n -5 | xargs -r rm -rf"

echo "== lead endpoint -> $HOST:$APP"
NEW=$(node -e "process.stdout.write(require('crypto').createHash('sha256').update(require('fs').readFileSync('server/lead.mjs')).digest('hex'))")
OLD=$(ssh "$HOST" "sha256sum '$APP/server/lead.mjs' 2>/dev/null | cut -d' ' -f1" || true)
LEAD_CHANGED=0
if [ "$NEW" != "$OLD" ]; then
  ssh "$HOST" "set -e
    mkdir -p '$APP/server'
    cat > '$APP/server/lead.mjs.new' && chmod a+r '$APP/server/lead.mjs.new'
    if [ -f '$APP/server/lead.mjs' ]; then cp -p '$APP/server/lead.mjs' '$APP/server/lead.mjs.prev'; fi
    mv '$APP/server/lead.mjs.new' '$APP/server/lead.mjs'
    sudo systemctl restart openfrequency-web-leads" < server/lead.mjs
  LEAD_CHANGED=1
  echo "changed, restarted (the previous one is lead.mjs.prev)"
else
  echo "unchanged"
fi

echo "== check https://$DOMAIN"
sleep 1
for p in / /toran /teder; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN$p")
  echo "$p $code"
  [ "$code" = 200 ] || { echo "not 200. To go back: DEPLOY_HOST=$HOST ./deploy/rollback.sh pages"; exit 1; }
done
ready=""
for _ in $(seq 1 15); do
  ready=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN/api/readyz" || true)
  [ "$ready" = 200 ] && break
  sleep 2
done
echo "/api/readyz $ready"
if [ "$ready" != 200 ]; then
  if [ "$LEAD_CHANGED" = 1 ]; then
    echo "the new lead endpoint is not ready: putting lead.mjs.prev back"
    DEPLOY_HOST="$HOST" DEPLOY_WWW="$WWW" DEPLOY_APP="$APP" ./deploy/rollback.sh lead
  fi
  echo "the lead endpoint is not ready"
  exit 1
fi
echo "deployed $RELEASE"
