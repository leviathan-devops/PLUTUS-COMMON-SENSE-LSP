/**
 * W6 · THE CALIBRATION — DERIVE the bars on the labeled corpus (never assume them).
 * For each item: the laws for its file, the chain over its hunk, P4 recorded.
 * Then sweep the threshold; report precision/recall per bar; pick the cost-matrix optimum
 * (a false ALLOW costs more than a false REJECT → the bar sits HIGH).
 */
import { loadStore, lawsForFile, lawsForHunk } from "../../src/plutus-lsp/store.ts";
import { chain, buildState, observableQuestion } from "../../src/plutus-lsp/judge.ts";
import { readFileSync } from "node:fs";

const CORPUS = JSON.parse(readFileSync(new URL("./corpus.json", import.meta.url), "utf8"));
const rows: Array<{ id: string; label: string; p4: number; p7: number; kind: string }> = [];

for (const it of CORPUS.items) {
  let store;
  try { store = loadStore(it.file); } catch { console.error(`SKIP ${it.id}: no store`); continue; }
  const laws = lawsForHunk(store, it.file, [], it.hunk, 3);   // the ranked (precise) set
  const q4 = observableQuestion(laws);
  const res = await chain(buildState(it.file, laws, it.hunk), ["P4", "P7"], 6000, q4);
  const p4 = res.answers.P4 ?? -1, p7 = res.answers.P7 ?? -1;
  rows.push({ id: it.id, label: it.label, p4, p7, kind: res.ok ? "ok" : (res.reason ?? "down") });
  console.log(`${it.id} [${it.label.padEnd(9)}] P4=${p4.toFixed(3)} P7=${p7.toFixed(3)}  ${it.why}`);
}

const viol = rows.filter((r) => r.label === "violation");
const clean = rows.filter((r) => r.label === "clean");
console.log(`\n── the sweep (P4 >= bar → VIOLATION) ──`);
let best = { bar: 0, f1: -1, prec: 0, rec: 0 };
for (let bar = 0.30; bar <= 0.95; bar += 0.05) {
  const tp = viol.filter((r) => r.p4 >= bar).length;
  const fp = clean.filter((r) => r.p4 >= bar).length;
  const fn = viol.length - tp;
  const prec = tp + fp === 0 ? 0 : tp / (tp + fp);
  const rec = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = prec + rec === 0 ? 0 : (2 * prec * rec) / (prec + rec);
  console.log(`bar=${bar.toFixed(2)}  TP=${tp}/${viol.length} FP=${fp}/${clean.length}  precision=${prec.toFixed(2)} recall=${rec.toFixed(2)} F1=${f1.toFixed(2)}`);
  if (f1 > best.f1) best = { bar, f1, prec, rec };
}
console.log(`\n★ THE DERIVED BAR: ${best.bar.toFixed(2)} (F1=${best.f1.toFixed(2)}, precision=${best.prec.toFixed(2)}, recall=${best.rec.toFixed(2)})`);
console.log(`★ corpus: ${viol.length} violations + ${clean.length} cleans = ${rows.length} items`);
