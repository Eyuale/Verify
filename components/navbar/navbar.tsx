import Button from "@/shared/components/button";
import ToggleTheme from "@/theme/component/ToggleTheme";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full h-16 flex items-center justify-between fixed top-0 left-0 px-8">
      <h3 className="font-medium tracking-tight flex items-center gap-0.5">
        Verify
        <BadgeCheck
          size={20}
          className="bg-blue-50 dark:bg-transparent text-blue-600 overflow-hidden rounded-full"
        />
      </h3>
      <div className="flex h-full items-center gap-4">
        <Link href="/products/add">
          <Button
            type="button"
            label="Review a product"
            className="bg-blue-600 dark:bg-white/5 text-white/90"
          />
        </Link>
        <Button
          type="button"
          label="Log In"
          className="bg-black/85 dark:bg-white/5 text-white/90"
        />
        <ToggleTheme />
      </div>
    </nav>
  );
}
