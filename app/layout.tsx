import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "universe-diary | 기록으로 만드는 나만의 우주",
  description: "하루의 기록이 별이 되는 감성 다이어리",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
