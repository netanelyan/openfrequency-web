# The 404 and try-again pages: the site's headers and compression (PRA-RT-003)

A missing page on openfrequency.co.il answers with no Strict-Transport-Security, Content-Security-Policy,
X-Content-Type-Options, Referrer-Policy or Permissions-Policy, with `Server: Caddy`, and uncompressed (the audit's
check, 2026-10-28). The reason: a `handle_errors` block is its own route, and the site's `header {}` and
`encode zstd gzip` don't reach it.

The fix is an edit of the live `/etc/caddy/Caddyfile`, in the `openfrequency.co.il` block only. That file is written by
hand and also serves brickdeal and tiyul (SERVER-FACTS.md), so it is never replaced by `Caddyfile.example`.

## The edit

In the `openfrequency.co.il { ... }` block there are two `handle_errors` blocks (SERVER-FACTS.md, 2026-10-29):

```caddy
	handle_errors 404 {
		rewrite * /404.html
		file_server
	}

	handle_errors 502 503 504 {
		rewrite * /try-again/index.html
		file_server
	}
```

Into each one, before its `rewrite`, put `encode zstd gzip` and a copy of the same block's own `header { ... }` block,
exactly as it stands a few lines above in the live file (its values are not repeated here, so nothing differs from
what the pages already send):

```caddy
	handle_errors 404 {
		encode zstd gzip
		header {
			<the lines of the site's own header block, copied as they are>
		}
		rewrite * /404.html
		file_server
	}

	handle_errors 502 503 504 {
		encode zstd gzip
		header {
			<the same lines>
		}
		rewrite * /try-again/index.html
		file_server
	}
```

Nothing else in the file changes.

## Steps on the server

```sh
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.$(date +%Y%m%d-%H%M)   # a dated copy, beside the earlier ones
sudoedit /etc/caddy/Caddyfile                                             # the edit above, in the openfrequency.co.il block
sudo caddy validate --config /etc/caddy/Caddyfile
sudo caddy reload --config /etc/caddy/Caddyfile --force                  # how it is reloaded (SERVER-FACTS.md)
```

## Checking it

```sh
curl -sI https://openfrequency.co.il/no-such-page | grep -iE '^(strict-transport|content-security|x-content-type|referrer-policy|permissions-policy|server):'
curl -s -o /dev/null -w '%{size_download}\n' -H 'Accept-Encoding: gzip' https://openfrequency.co.il/no-such-page
```

The first should list the five headers and no `Server`; the second should be far under the uncompressed 94,811 bytes
the audit measured. To undo: copy the dated file back and reload.

UNVERIFIED until it is done on the server: that `caddy validate` accepts it (no Caddy on the laptop to try it), and the
exact indentation of the live block (`sudo sed -n '/^openfrequency.co.il {/,/^}/p' /etc/caddy/Caddyfile`).
