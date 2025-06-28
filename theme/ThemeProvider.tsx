"use client";

import Sidebar from "@/components/sidebar/sidebar";
import { ThemeProvider } from "next-themes";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute={"class"} enableSystem defaultTheme="dark">
      <div className="grid grid-cols-3 md:grid-cols-8 h-screen overflow-hidden relative w-full bg-white text-black/90 dark:bg-[#151314] dark:text-[#dfd7cc] px-8">
        <Sidebar />
        <div className="cols-span-2 md:col-span-7 max-h-screen overflow-y-scroll">
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
