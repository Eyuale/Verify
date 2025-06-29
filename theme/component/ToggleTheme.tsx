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
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    >
      {resolvedTheme === "dark" ? (
        <Moon className="text-sm text-blue-500 dark:text-white/80" size={16} />
      ) : (
        <Sun className="text-blue-500 dark:text-white/80" size={16} />
      )}
    </button>
  );
}
