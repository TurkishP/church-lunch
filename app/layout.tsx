import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-body-ko",
  weight: ["400", "500", "600", "700"]
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-display-ko",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Sunday Lunch Groups",
  description: "Mobile-first lunch group organizer for a small church community."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} ${notoSerifKr.variable}`}>
        {children}
      </body>
    </html>
  );
}
