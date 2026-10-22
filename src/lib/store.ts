"use client";

import type { Triage } from "./triage";

export type TicketStatus = "Open" | "Resolved" | "Escalated";

export type StoredTicket = {
  id: string;
  createdAt: string;
  description: string;
  status: TicketStatus;
  triage: Triage;
  sources: { id: string; title: string }[];
};

// The queue lives in this browser only. It's a demo: nothing is sent
// anywhere except the description you submit for triage.
const KEY = "helpdesk-tickets-v1";
const COUNTER = "helpdesk-counter-v1";
const EVENT = "helpdesk-tickets-changed";

export function loadTickets(): StoredTicket[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredTicket[]) : [];
  } catch {
    return [];
  }
}

function save(tickets: StoredTicket[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tickets));
  } catch {
    // Storage blocked (private mode, etc.) — the current page still works.
  }
  window.dispatchEvent(new Event(EVENT));
}

let memoryCounter = 1000;

export function nextTicketId(): string {
  let n = memoryCounter + 1;
  try {
    n = Number(localStorage.getItem(COUNTER) ?? "1000") + 1;
    localStorage.setItem(COUNTER, String(n));
  } catch {
    // fall back to the in-memory counter
  }
  memoryCounter = n;
  return `INC${n}`;
}

export function addTicket(ticket: StoredTicket) {
  save([ticket, ...loadTickets()]);
}

export function setStatus(id: string, status: TicketStatus) {
  save(loadTickets().map((t) => (t.id === id ? { ...t, status } : t)));
}

export function clearTickets() {
  save([]);
}

export function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
