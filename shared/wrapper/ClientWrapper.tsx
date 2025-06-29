"use client";

import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import { useState, ReactNode } from "react";

const ClientWrapper = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden relative w-full bg-white text-black/90 dark:bg-[#151314] dark:text-[#dfd7cc]">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 max-h-screen overflow-y-scroll">
        <Navbar toggleSidebar={toggleSidebar} />
        {children}
      </div>
    </div>
  );
};

export default ClientWrapper;
