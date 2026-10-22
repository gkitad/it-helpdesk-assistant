"use client";

import Link from "next/link";
import styles from "@/app/ui.module.css";
import { setStatus, type StoredTicket, type TicketStatus } from "@/lib/store";

const statusClass: Record<TicketStatus, string> = {
  Open: styles.statusOpen,
  Resolved: styles.statusResolved,
  Escalated: styles.statusEscalated,
};

export function StatusPill({ status }: { status: TicketStatus }) {
  return <span className={`${styles.pill} ${statusClass[status]}`}>{status}</span>;
}

export function PriorityPill({ priority }: { priority: string }) {
  const cls = {
    P1: styles.p1,
    P2: styles.p2,
    P3: styles.p3,
    P4: styles.p4,
  }[priority];
  return <span className={`${styles.pill} ${cls}`}>{priority}</span>;
}

export default function TicketCard({
  ticket,
  onChange,
}: {
  ticket: StoredTicket;
  onChange: (status: TicketStatus) => void;
}) {
  const t = ticket.triage;
  const showHandoff = ticket.status === "Escalated";

  function update(status: TicketStatus) {
    setStatus(ticket.id, status);
    onChange(status);
  }

  return (
    <article className={`${styles.ticket} ${styles[`edge${ticket.status}`]}`} aria-live="polite">
      <div className={styles.ticketTop}>
        <span className={styles.ticketId}>{ticket.id}</span>
        <StatusPill status={ticket.status} />
      </div>

      <h2 className={styles.ticketTitle}>{t.title}</h2>

      <dl className={styles.fields}>
        <div>
          <dt>Priority</dt>
          <dd>
            <PriorityPill priority={t.priority} /> <span className={styles.muted}>{t.priorityReason}</span>
          </dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{t.category}</dd>
        </div>
        <div>
          <dt>Summary</dt>
          <dd>{t.summary}</dd>
        </div>
        {t.escalateTo !== "None" && (
          <div>
            <dt>Routes to</dt>
            <dd>{t.escalateTo}</dd>
          </div>
        )}
      </dl>

      {t.steps.length > 0 && (
        <section className={styles.steps}>
          <h3>{t.escalate ? "Do this right now" : "Try these steps"}</h3>
          <ol>
            {t.steps.map((s, i) => (
              <li key={i}>
                <span className={styles.stepNum}>{i + 1}</span>
                <div>
                  <p>{s.action}</p>
                  <p className={styles.muted}>{s.why}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {ticket.sources.length > 0 && (
        <p className={styles.sources}>
          Based on{" "}
          {ticket.sources.map((s, i) => (
            <span key={s.id}>
              {i > 0 && ", "}
              <Link href={`/kb#${s.id}`}>
                {s.id} {s.title}
              </Link>
            </span>
          ))}
        </p>
      )}

      {ticket.status === "Open" && (
        <div className={styles.decision}>
          <p>Did this fix it?</p>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={() => update("Resolved")}>
              Yes, close the ticket
            </button>
            <button className={styles.secondary} onClick={() => update("Escalated")}>
              No, send to a technician
            </button>
          </div>
        </div>
      )}

      {ticket.status === "Resolved" && (
        <p className={styles.closing}>Ticket closed as resolved. It stays in your queue for reference.</p>
      )}

      {showHandoff && (
        <section className={styles.handoff}>
          <h3>Handoff note for {t.escalateTo === "None" ? "Tier 2" : t.escalateTo}</h3>
          <p>{t.handoffNote}</p>
        </section>
      )}
    </article>
  );
}
