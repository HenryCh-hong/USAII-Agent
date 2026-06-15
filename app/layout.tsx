import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forked Futures — Rehearse your future before you commit to it",
  description:
    "An evidence-grounded, uncertainty-aware future simulator that helps students and early professionals compare possible life and career paths, understand hidden tradeoffs, and turn uncertainty into a first real-world experiment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="relative min-h-screen">{children}</div>
      </body>
    </html>
  );
}
