// Ports a test server may use. fetch() refuses a list of ports outright ("bad port", the Fetch standard's port
// blocking, which Node's undici follows), and on this kind of machine the system can hand a listener on port 0 any port
// from 1024 up, so now and then a test's own server took one of them and every request to it failed: the lead test's
// fixed ports (4790 to 5589) reach 5060 and 5061, and a deploy stopped on it on 2026-11-02 ("tests failed: nothing
// was uploaded"). The same list and the same answer as openfrequency-teder's test/helpers.js.

/** The ports fetch refuses (the Fetch standard's bad ports; checked against Node 24's fetch by test/ports.test.mjs). */
export const BAD_PORTS = new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79, 87, 95, 101, 102, 103, 104, 109, 110, 111, 113, 115, 117, 119,
  123, 135, 137, 139, 143, 161, 179, 389, 427, 465, 512, 513, 514, 515, 526, 530, 531, 532, 540, 548, 554, 556, 563, 587, 601, 636, 989,
  990, 993, 995, 1719, 1720, 1723, 2049, 3659, 4045, 4190, 5060, 5061, 6000, 6566, 6665, 6666, 6667, 6668, 6669, 6679, 6697, 10080,
]);

/**
 * Listen on a port the system picks, and again while it picks one fetch refuses. Resolves to the port. Gives up after
 * `tries`, which a machine never reaches by chance (82 ports of 64511).
 */
export async function listenFree(server, host = '127.0.0.1', { tries = 20 } = {}) {
  for (let i = 0; i < tries; i++) {
    await new Promise((ok, fail) => {
      server.once('error', fail);
      server.listen(0, host, () => (server.off('error', fail), ok()));
    });
    const { port } = server.address();
    if (!BAD_PORTS.has(port)) return port;
    await new Promise((ok) => server.close(() => ok()));
  }
  throw new Error(`no port fetch accepts after ${tries} tries`);
}

/**
 * A base port from `from` to `from + span - 1`, picked at random, such that the base plus each of `offsets` is a port
 * fetch accepts: for a test that starts servers on fixed steps from one base.
 */
export function basePort(from, span, offsets = [0], random = Math.random) {
  const ok = Array.from({ length: span }, (_, i) => from + i).filter((p) => offsets.every((o) => !BAD_PORTS.has(p + o)));
  if (!ok.length) throw new Error(`no base from ${from} to ${from + span - 1} keeps every step clear of fetch's bad ports`);
  return ok[Math.floor(random() * ok.length)];
}
