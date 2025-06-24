"use client";

import { ThemeProvider } from "next-themes";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute={"class"} enableSystem defaultTheme="dark">
      <div className="flex flex-1 flex-col min-h-screen relative w-full pt-8 justify-center items-center dark:bg-[#151314] dark:text-[#dfd7cc]">
        {children}
      </div>
    </ThemeProvider>
  );
}
