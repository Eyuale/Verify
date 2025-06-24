import Button from "@/shared/components/button";
import ToggleTheme from "@/theme/component/ToggleTheme";
import { BadgeCheck } from "lucide-react";
import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full h-16 flex items-center justify-between">
      <h3 className="font-medium tracking-tight flex items-center gap-0.5">
        Verify{" "}
        <BadgeCheck
          size={20}
          className="bg-blue-50 dark:bg-transparent text-blue-600 overflow-hidden rounded-full"
        />
      </h3>
      <div className="flex h-full items-center gap-4">
        <ToggleTheme />
        <Button
          label="Sign Up"
          className="border-black/50  text-black/90 dark:text-white/90"
        />
        <Button
          label="Log In"
          className="bg-black/90 dark:bg-black/50 text-white/90 border-black/90"
        />
      </div>
    </nav>
  );
}
