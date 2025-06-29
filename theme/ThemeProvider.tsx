"use client";

import ClientWrapper from "@/shared/wrapper/ClientWrapper";
import { ThemeProvider } from "next-themes";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute={"class"} enableSystem defaultTheme="dark">
      <ClientWrapper>{children}</ClientWrapper>
    </ThemeProvider>
  );
}
