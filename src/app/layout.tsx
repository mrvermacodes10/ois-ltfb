import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  return {
    title: `${settings?.leagueName ?? "OIS Lunchtime Footy"} (${settings?.shortName ?? "LTFB"})`,
    description: settings?.heroSubtitle ?? "The home of everything LTFB.",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
