"use client";

import { useRef, useState } from "react";
import styles from "./ui.module.css";
import TicketCard from "@/components/TicketCard";
import { addTicket, nextTicketId, type StoredTicket } from "@/lib/store";

const examples = [
  "My VPN won't connect from home since this morning, it just says authentication failed.",
  "Outlook freezes every time I open it and then closes by itself.",
  "I got an email from our CEO asking for gift cards and I clicked the link and typed my password.",
  "My second monitor shows no signal when I plug my laptop into the dock.",
];

const MAX = 1500;

export default function NewTicket() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<StoredTicket | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Triage failed. Try again in a moment.");
        return;
      }
      const created: StoredTicket = {
        id: nextTicketId(),
        createdAt: new Date().toISOString(),
        description,
        status: data.ticket.escalate ? "Escalated" : "Open",
        triage: data.ticket,
        sources: data.sources,
      };
      addTicket(created);
      setTicket(created);
      setDescription("");
      // On narrow screens the ticket renders below the form; bring it into view.
      if (window.matchMedia("(max-width: 820px)").matches) {
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ block: "start" }));
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.split}>
      <section className={styles.intake}>
        <h1 className={styles.pageTitle}>What&apos;s going wrong?</h1>
        <p className={styles.lede}>
          Describe the problem the way you&apos;d tell a coworker. It files a ticket, sets the
          priority and walks you through fixes from the help desk&apos;s runbooks. If it can&apos;t be
          fixed from your desk, it goes to a technician with notes.
        </p>

        <form onSubmit={submit} className={styles.form}>
          <label htmlFor="description" className={styles.srOnly}>
            Problem description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX}
            rows={6}
            placeholder="e.g. My laptop has been really slow since yesterday's update"
            className={styles.textarea}
            disabled={loading}
          />
          <div className={styles.formFoot}>
            <span className={styles.muted}>
              {description.length} / {MAX}
            </span>
            <button
              type="submit"
              className={styles.primary}
              disabled={loading || description.trim().length < 10}
            >
              {loading ? "Triaging…" : "Submit ticket"}
            </button>
          </div>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </form>

        <div className={styles.examples}>
          <p className={styles.muted}>Or try one of these:</p>
          <ul>
            {examples.map((ex) => (
              <li key={ex}>
                <button type="button" onClick={() => setDescription(ex)} disabled={loading}>
                  {ex}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section ref={resultRef} className={styles.result} aria-label="Ticket">
        {ticket ? (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onChange={(status) => setTicket({ ...ticket, status })}
          />
        ) : loading ? (
          <div className={`${styles.placeholder} ${styles.pending}`}>
            <p>Searching the knowledge base and triaging your ticket…</p>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <h2>How it works</h2>
            <ol className={styles.how}>
              <li>
                <span className={styles.stepNum}>1</span>
                <p>
                  Your description is matched against the knowledge base with BM25 search to find
                  the closest runbooks.
                </p>
              </li>
              <li>
                <span className={styles.stepNum}>2</span>
                <p>
                  Claude reads the description and those runbooks, and returns a structured ticket:
                  priority, category, safe self-service steps and a technician handoff note.
                </p>
              </li>
              <li>
                <span className={styles.stepNum}>3</span>
                <p>
                  You confirm whether the steps worked. The ticket closes, or it escalates with the
                  note attached. Every ticket lands in the queue.
                </p>
              </li>
            </ol>
          </div>
        )}
      </section>
    </main>
  );
}
