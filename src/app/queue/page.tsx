"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import styles from "../ui.module.css";
import TicketCard, { PriorityPill, StatusPill } from "@/components/TicketCard";
import { clearTickets, loadTickets, subscribe, type StoredTicket } from "@/lib/store";

// useSyncExternalStore needs a stable snapshot between changes.
let cachedRaw = "";
let cached: StoredTicket[] = [];
function getSnapshot(): StoredTicket[] {
  const fresh = loadTickets();
  const raw = JSON.stringify(fresh);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = fresh;
  }
  return cached;
}
const empty: StoredTicket[] = [];

const timeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default function Queue() {
  const tickets = useSyncExternalStore(subscribe, getSnapshot, () => empty);
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      Open: tickets.filter((t) => t.status === "Open").length,
      Escalated: tickets.filter((t) => t.status === "Escalated").length,
      Resolved: tickets.filter((t) => t.status === "Resolved").length,
    }),
    [tickets],
  );

  const selfResolved =
    tickets.length === 0 ? null : Math.round((counts.Resolved / tickets.length) * 100);

  if (tickets.length === 0) {
    return (
      <main className={styles.narrow}>
        <h1 className={styles.pageTitle}>Queue</h1>
        <div className={styles.empty}>
          <p>No tickets yet. Submit one and it will show up here.</p>
          <Link href="/" className={styles.primary}>
            Submit a ticket
          </Link>
        </div>
      </main>
    );
  }

  const selected = tickets.find((t) => t.id === openId) ?? null;

  return (
    <main className={styles.narrow}>
      <div className={styles.queueHead}>
        <h1 className={styles.pageTitle}>Queue</h1>
        <button
          className={styles.secondary}
          onClick={() => {
            if (confirm("Delete every ticket in this browser's queue?")) clearTickets();
          }}
        >
          Clear queue
        </button>
      </div>

      <dl className={styles.stats}>
        <div>
          <dt>Open</dt>
          <dd>{counts.Open}</dd>
        </div>
        <div>
          <dt>Escalated</dt>
          <dd>{counts.Escalated}</dd>
        </div>
        <div>
          <dt>Resolved</dt>
          <dd>{counts.Resolved}</dd>
        </div>
        <div>
          <dt>Resolved without a technician</dt>
          <dd>{selfResolved}%</dd>
        </div>
      </dl>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Ticket</th>
              <th scope="col">Title</th>
              <th scope="col">Priority</th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
              <th scope="col">Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} aria-selected={t.id === openId}>
                <td>
                  <button
                    className={styles.rowLink}
                    onClick={() => setOpenId(t.id === openId ? null : t.id)}
                    aria-expanded={t.id === openId}
                  >
                    {t.id}
                  </button>
                </td>
                <td>{t.triage.title}</td>
                <td>
                  <PriorityPill priority={t.triage.priority} />
                </td>
                <td>{t.triage.category}</td>
                <td>
                  <StatusPill status={t.status} />
                </td>
                <td className={styles.muted}>{timeFormat.format(new Date(t.createdAt))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className={styles.detail}>
          <TicketCard key={selected.id} ticket={selected} onChange={() => {}} />
        </div>
      )}
    </main>
  );
}
