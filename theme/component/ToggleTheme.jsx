"use client";
import React, { useEffect, useState } from "react";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ToggleTheme() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return;

  return (
    <button
      className="w-8 h-8 flex items-center justify-center cursor-pointer dark:hover:bg-white/10 rounded-full hover:bg-black/5"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    >
      {resolvedTheme === "dark" ? (
        <Moon className="dark:text-white/80 text-blue-500  text-sm" size={16} />
      ) : (
        <Sun className="dark:text-white/80  text-blue-500 " size={16} />
      )}
    </button>
  );
}
