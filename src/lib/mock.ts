import type { Article } from "@/kb/articles";
import type { Triage } from "./triage";

// Offline stand-in for the Claude call, used only when MOCK_TRIAGE=1.
// It lets the UI be developed and tested without an API key.
export function mockTriage(description: string, matched: Article[]): Triage {
  const top = matched[0];
  const security = top?.category === "Security" && top.id === "KB014";

  if (!top) {
    return {
      title: "Unclassified request",
      category: "Other",
      priority: "P4",
      priorityReason: "No matching runbook; needs a technician to review.",
      summary: description.slice(0, 160),
      steps: [],
      escalate: true,
      escalateTo: "Tier 2",
      handoffNote: "No knowledge base article matched. Review the description and contact the user.",
      sources: [],
    };
  }

  return {
    title: top.title,
    category: top.category,
    priority: security ? "P1" : "P3",
    priorityReason: security
      ? "Possible credential compromise; treat as a security incident."
      : "One user affected with self-service steps available.",
    summary: description.slice(0, 160),
    steps: security
      ? [
          { action: "Stop using the device and don't click anything else.", why: "Keeps anything malicious from spreading." },
          { action: "Disconnect from Wi-Fi or unplug the network cable.", why: "Cuts off any remote access while Security investigates." },
        ]
      : top.steps.slice(0, 4).map((s) => ({ action: s, why: "From the matching runbook." })),
    escalate: security,
    escalateTo: security ? "Security" : "Tier 2",
    handoffNote: `Matched ${top.id}. ${top.escalateWhen}`,
    sources: [top.id],
  };
}
