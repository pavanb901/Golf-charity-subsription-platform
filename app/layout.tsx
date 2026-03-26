import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { DemoProvider } from "@/components/providers/demo-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "FairChance Club",
  description: "Golf performance meets charity impact and monthly prize draws."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
