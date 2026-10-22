// Checks that sample tickets retrieve the expected knowledge base article.
// Run with: npm run eval:retrieval
import { retrieve } from "../src/lib/retrieve";

const cases: [string, string | null][] = [
  ["My VPN won't connect from home", "KB003"],
  ["Outlook keeps crashing every time I open it", "KB005"],
  ["I clicked a link in an email and typed my password", "KB014"],
  ["Got a new phone and can't approve the sign-in", "KB002"],
  ["My second monitor says no signal when I plug into the dock", "KB010"],
  ["Laptop is super slow since this morning", "KB011"],
  ["Printer says offline and nothing prints", "KB009"],
  ["Files in OneDrive have a red X", "KB008"],
  ["Nobody can hear me in Teams meetings", "KB007"],
  ["I'm locked out of my account", "KB001"],
  ["BitLocker is asking for a recovery key", "KB013"],
  ["Can't open the S: drive, access denied", "KB015"],
  ["Wi-Fi says connected but no internet", "KB004"],
  ["The coffee machine is broken", null],
];

let pass = 0;
for (const [query, expected] of cases) {
  const top = retrieve(query)[0]?.article.id ?? null;
  const ok = top === expected;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${query}  ->  ${top ?? "no match"}${ok ? "" : ` (expected ${expected ?? "no match"})`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
