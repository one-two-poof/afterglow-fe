import type { Metadata } from "next";
import { LoginModal } from "@/components";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Afterglow",
  description: "Afterglow frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {children}
          <LoginModal />
        </Providers>
      </body>
    </html>
  );
}
