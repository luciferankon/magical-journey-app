import type { Metadata } from "next";
import { Cinzel, Lora, Inter, IM_Fell_English } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const imFellEnglish = IM_Fell_English({
  variable: "--font-im-fell",
  subsets: ["latin"],
  style: "italic",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Magical Journey — Aethermoor Academy",
  description:
    "A branching narrative game set in a magical academy. Your choices shape the story.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${lora.variable} ${inter.variable} ${imFellEnglish.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-deep text-parchment">
        {children}
      </body>
    </html>
  );
}
