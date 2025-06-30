import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/theme/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import FontAwesomeConfig from "./fontawesome";

export const metadata: Metadata = {
  title: "Verify",
  description: "Trusted Video Product Reviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>  
      <html lang="en" suppressHydrationWarning>
        <head>
          <FontAwesomeConfig />
        </head>
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
