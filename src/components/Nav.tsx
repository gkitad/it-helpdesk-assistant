"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/app/ui.module.css";

const links = [
  { href: "/", label: "New ticket" },
  { href: "/queue", label: "Queue" },
  { href: "/kb", label: "Knowledge base" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={styles.nav}>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={styles.navLink}
          aria-current={pathname === l.href ? "page" : undefined}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
