import React from "react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  return (
    <aside
      className={` ${
        isOpen ? "w-56" : "w-18"
      } h-screen border-r border-black/10 dark:border-white/10 p-2 pt-16`}
    >
      <h2>{isOpen ? "Sidebar" : "SID"}</h2>
    </aside>
  );
};

export default Sidebar;
