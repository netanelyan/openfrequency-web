// A whole page in one picture, as a visitor would see each part of it. The page is scrolled through once first, so
// lazy pictures load and each section rises in the way it does for a reader; then the wallpaper (fixed to the screen
// in the real page) is pinned to the document and the page is captured from the top.
export async function preparePage(pg) {
  await pg.evaluate(async () => {
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await pause(140); }
    scrollTo(0, 0);
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
    document.querySelectorAll('[data-rise], .drift').forEach((e) => e.classList.add('in'));
  });
  await pg.addStyleTag({ content: 'body{position:relative} body::before{position:absolute}' });
  await pg.waitForTimeout(1200);
}

export async function capturePage(pg, file) {
  await preparePage(pg);
  await pg.screenshot({ path: file, fullPage: true });
}
