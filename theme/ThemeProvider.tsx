"use client";

import { ThemeProvider } from "next-themes";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute={"class"} enableSystem defaultTheme="dark">
      <div className="flex flex-1 flex-col min-h-screen relative w-full justify-center items-center bg-white text-black/90 dark:bg-[#151314] dark:text-[#dfd7cc] px-4">
        {children}
      </div>
    </ThemeProvider>
  );
}
