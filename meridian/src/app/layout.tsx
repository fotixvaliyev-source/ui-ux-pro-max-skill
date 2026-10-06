import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { THEME_SCRIPT } from "@/components/brand/theme-toggle";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Meridian: your circle, finally organized", template: "%s | Meridian" },
  description: "A private workspace for small groups of experienced professionals who support each other's careers and ventures.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
