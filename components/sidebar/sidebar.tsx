import React from "react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  return (
    <aside className={` ${isOpen ? "w-42" : "w-16"} h-screen p-2 pt-16`}>
      <h2>{isOpen ? "Sidebar" : "SID"}</h2>
    </aside>
  );
};

export default Sidebar;
