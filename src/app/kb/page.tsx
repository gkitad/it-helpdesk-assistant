import type { Metadata } from "next";
import styles from "../ui.module.css";
import { articles } from "@/kb/articles";

export const metadata: Metadata = {
  title: "Knowledge base | Helpdesk Assistant",
};

export default function KnowledgeBase() {
  const categories = [...new Set(articles.map((a) => a.category))];

  return (
    <main className={styles.narrow}>
      <h1 className={styles.pageTitle}>Knowledge base</h1>
      <p className={styles.lede}>
        The runbooks the assistant searches before it answers. Each one covers what the user sees,
        what Tier 1 tries, and when it goes to someone else.
      </p>

      {categories.map((cat) => (
        <section key={cat} className={styles.kbGroup} aria-labelledby={cat}>
          <h2 id={cat}>{cat}</h2>
          {articles
            .filter((a) => a.category === cat)
            .map((a) => (
              <article key={a.id} id={a.id} className={styles.kbArticle}>
                <h3>
                  <span className={styles.kbId}>{a.id}</span> {a.title}
                </h3>
                <p className={styles.muted}>{a.symptoms}</p>
                <ol className={styles.kbSteps}>
                  {a.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <p>
                  <strong>Escalate when:</strong> {a.escalateWhen}
                </p>
              </article>
            ))}
        </section>
      ))}
    </main>
  );
}
