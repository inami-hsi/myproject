import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow",
  description:
    "Calm productivity task management with Gantt, Kanban, Calendar, and List views.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-dvh font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
