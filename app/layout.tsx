import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Mona_Sans, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoxAI",
  description: "An AI-powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.variable} ${monaSans.className} antialiased pattern`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}