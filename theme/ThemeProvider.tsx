"use client";

import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import { ThemeProvider } from "next-themes";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute={"class"} enableSystem defaultTheme="dark">
      <div className="flex h-screen overflow-hidden relative w-full bg-white text-black/90 dark:bg-[#151314] dark:text-[#dfd7cc]">
        <Sidebar />
        <div className="flex-1 max-h-screen overflow-y-scroll">
          <Navbar />
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
