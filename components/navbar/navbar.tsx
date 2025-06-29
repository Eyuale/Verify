import Button from "@/shared/components/button";
import ToggleTheme from "@/theme/component/ToggleTheme";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, PenLineIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  return (
    <nav className="w-full h-14 flex items-center justify-between fixed top-0 left-0 px-4 bg-white dark:bg-[#151314] border-b border-black/10 dark:border-white/10 z-50">
      <div className="flex items-center gap-2">
        <div onClick={toggleSidebar}>
          <Menu size={16} />
        </div>
        <h3 className="font-medium tracking-tight flex items-center gap-0.5">
          <Link href={"/"}>Verify</Link>
          {/* <BadgeCheck
            size={20}
            className="bg-blue-50 dark:bg-transparent text-blue-600 overflow-hidden rounded-full"
          /> */}
        </h3>
      </div>
      <div className="flex h-full items-center gap-4">
        <Link href="/products/add">
          <Button
            type="button"
            label="Write"
            icon={<PenLineIcon size={14} strokeWidth={3} />}
            className="text-blue-800/90 bg-blue-50 dark:text-[#a8c8fb] dark:bg-blue-50/10 gap-1 pr-5"
          />
        </Link>
        <SignedOut>
          <Link href="/sign-in">
            <Button
              type="button"
              label="Log In"
              className="bg-black/85 dark:bg-white/5 text-white/90"
            />
          </Link>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <ToggleTheme />
      </div>
    </nav>
  );
}
