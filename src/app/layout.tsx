import type { Metadata } from "next";
import "@fontsource-variable/schibsted-grotesk/wght.css";
import "./globals.css";
import styles from "./ui.module.css";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Helpdesk Assistant",
  description:
    "Describe an IT problem in plain words and get a triaged ticket: priority, category, troubleshooting steps from a knowledge base, and a handoff note for Tier 2. Built by Anthony Jaimez with the Claude API.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.brand}>
              Helpdesk Assistant
            </Link>
            <Nav />
          </div>
        </header>
        <div className={styles.shell}>{children}</div>
        <footer className={styles.footer}>
          <p>
            A portfolio project by{" "}
            <a href="https://www.anthonyjaimez.com/">Anthony Jaimez</a>. Triage
            runs on the Claude API; tickets stay in your browser.{" "}
            <a href="https://github.com/gkitad/it-helpdesk-assistant">Source on GitHub</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
