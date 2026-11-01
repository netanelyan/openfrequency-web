// The support export as a file: what Toran needs to answer OpenFrequency's own support (src/support.mjs has what is in
// it and why), for syncing by hand.
//
//   node scripts/support-export.mjs [out.json]      (npm run support -- out.json; stdout without a file)
//
// Toran reads the file with `npm run company -- sync <file>` (openfrequency-toran, docs/company.md). It does not need
// to any more once its TORAN_SUPPORT_EXPORT_URL names https://<domain>/support.json, which the real build publishes
// from the same function and Toran reads by itself once a day; this stays for a sync before a deploy, or on a machine
// that has no site. Like the real build, it stops while a fact in site.config.json is empty, or while one of
// support.json's answers has no question on /faq left.
import fs from 'node:fs';
import { readConfig } from '../src/lib.mjs';
import { supportExport } from '../src/support.mjs';

const cfg = readConfig(false);
// readConfig has every empty fact by now, used or not, as the real build reads them.
if (cfg.missing.size) {
  console.error(`Not exported. Empty in site.config.json:\n${[...cfg.missing].map(([k, l]) => `  ${k} (${l})`).join('\n')}`);
  process.exit(1);
}
let out;
try {
  out = supportExport(cfg);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const json = JSON.stringify(out, null, 2) + '\n';
const file = process.argv[2];
if (file) {
  fs.writeFileSync(file, json);
  console.error(`Exported to ${file}: ${out.plans.length} plans, ${out.faq.length} questions (${out.faq.filter((f) => f.today != null).length} with today's answer), ${out.pages.length} pages.`);
} else process.stdout.write(json);
