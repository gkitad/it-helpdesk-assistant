import { articles, type Article } from "@/kb/articles";

// Lexical retrieval with BM25. The knowledge base is small, so an in-memory
// index built once per server instance is fast and needs no vector database.

const STOPWORDS = new Set(
  "a an and are as at be but by can cant do does doesnt dont for from get got has have i im in into is it its ive just me my no not of on or our so that the their them then there this to too up was we were what when where which while who will with won wont you your".split(
    " ",
  ),
);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

// Very light stemming so "syncing", "synced" and "sync" match.
function stem(t: string): string {
  if (t.length > 5 && t.endsWith("ing")) return t.slice(0, -3);
  if (t.length > 4 && t.endsWith("ed")) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

type Doc = { article: Article; tf: Map<string, number>; length: number };

function articleText(a: Article): string {
  // Title and symptoms describe how users phrase problems, so weight them up.
  return [a.title, a.title, a.symptoms, a.symptoms, a.category, ...a.steps].join(" ");
}

const docs: Doc[] = articles.map((article) => {
  const tokens = tokenize(articleText(article));
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return { article, tf, length: tokens.length };
});

const avgLength = docs.reduce((s, d) => s + d.length, 0) / docs.length;

const df = new Map<string, number>();
for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);

function idf(term: string): number {
  const n = df.get(term) ?? 0;
  return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
}

const K1 = 1.2;
// Below this, a match is usually one incidental word in common (like
// "machine"), not the same problem. Tuned with scripts/eval-retrieval.ts.
const MIN_SCORE = 3.5;
const B = 0.75;

export type Match = { article: Article; score: number };

export function retrieve(query: string, limit = 3): Match[] {
  const terms = [...new Set(tokenize(query))];
  if (terms.length === 0) return [];

  const scored = docs.map((d) => {
    let score = 0;
    for (const term of terms) {
      const f = d.tf.get(term);
      if (!f) continue;
      score +=
        (idf(term) * f * (K1 + 1)) /
        (f + K1 * (1 - B + (B * d.length) / avgLength));
    }
    return { article: d.article, score };
  });

  const ranked = scored.filter((m) => m.score > 0).sort((a, b) => b.score - a.score);
  if (ranked.length === 0 || ranked[0].score < MIN_SCORE) return [];

  // Drop weak matches: keep results within half of the best score.
  const best = ranked[0].score;
  return ranked.filter((m) => m.score >= best * 0.5).slice(0, limit);
}
