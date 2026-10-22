#!/usr/bin/env bash
# Builds the site and puts it on the VPS. Run from the repo root, on any machine with Node, ssh and tar (Git Bash on
# Windows is enough):
#
#   DEPLOY_HOST=user@vps ./deploy/deploy.sh
#
# 1. The real build (it stops while any fact in site.config.json is empty) and the endpoint's tests.
# 2. The pages go to a new folder under /var/www/openfrequency-web/releases, and "current" points at it in one step,
#    so a visitor never sees half a deploy. The last 5 releases are kept; rolling back is pointing "current" back.
# 3. The lead endpoint (server/lead.mjs) goes to /opt/openfrequency-web, and the service restarts only if it changed.
# 4. The live site and the endpoint are checked over HTTPS.
#
# Once on the VPS, before the first deploy (the deploy user needs sudo for the restart):
#   sudo mkdir -p /var/www/openfrequency-web/releases /opt/openfrequency-web/server
#   sudo chown -R "$USER" /var/www/openfrequency-web /opt/openfrequency-web
#   then deploy/openfrequency-web-leads.service (its header) and deploy/Caddyfile.example.
set -euo pipefail

HOST="${DEPLOY_HOST:?set DEPLOY_HOST, like user@1.2.3.4 or a Host from ~/.ssh/config}"
WWW="${DEPLOY_WWW:-/var/www/openfrequency-web}"
APP="${DEPLOY_APP:-/opt/openfrequency-web}"
cd "$(dirname "$0")/.."

DOMAIN=$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('site.config.json','utf8')).domain||'')")

echo "== build and test"
node build.mjs
node --test test/*.test.mjs >/dev/null
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
if [ "$NEW" != "$OLD" ]; then
  ssh "$HOST" "mkdir -p '$APP/server' && cat > '$APP/server/lead.mjs.new' && chmod a+r '$APP/server/lead.mjs.new' && mv '$APP/server/lead.mjs.new' '$APP/server/lead.mjs' && sudo systemctl restart openfrequency-web-leads" < server/lead.mjs
  echo "changed, restarted"
else
  echo "unchanged"
fi

echo "== check https://$DOMAIN"
sleep 1
for p in / /toran /api/health; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN$p")
  echo "$p $code"
  [ "$code" = 200 ] || { echo "not 200; the previous release is still in $WWW/releases"; exit 1; }
done
echo "deployed $RELEASE"
