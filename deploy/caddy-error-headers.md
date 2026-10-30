# The 404 and try-again pages: the site's headers and compression (PRA-RT-003)

A missing page on openfrequency.co.il answers with none of these headers: Strict-Transport-Security,
Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. It also sends `Server: Caddy` and
arrives uncompressed (the audit's check, 2026-10-28). The reason: a `handle_errors` block is its own route, so the
site's `header {}` and `encode zstd gzip` don't reach it.

The fix is one edit of the live `/etc/caddy/Caddyfile`, in the `openfrequency.co.il` block only. It lives in the server
repository, openfrequency-ops, at `docs/apply.md` step 5, with the block before and after in `docs/caddy-edit/`:
- The site's header set becomes one snippet (`/etc/caddy/of-site-headers.caddy`).
- The block imports the snippet in place of its own `header {}`.
- Both `handle_errors` blocks import the snippet too, and get `encode zstd gzip`.

One copy of the headers means the pages and the error pages can't drift apart. An earlier version of this note copied
the header block into each `handle_errors` instead. Do the openfrequency-ops edit only, never both.

Checked on 2026-10-30, on the server, read-only:
- The live block matches `docs/caddy-edit/before.caddy` in openfrequency-ops.
- The edited Caddyfile passes `caddy validate` on the server's own Caddy (v2.11.4). That ran on a copy in a temporary
  folder, which was deleted afterwards.

After the edit, a missing page should show the five headers, no `Server` and a `Content-Encoding`:

```sh
curl -sI -H 'Accept-Encoding: gzip' https://openfrequency.co.il/no-such-page | grep -iE 'strict-transport|content-security|x-content-type|referrer-policy|permissions-policy|^server|content-encoding'
```
