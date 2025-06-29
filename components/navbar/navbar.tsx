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
    <nav className="fixed top-0 left-0 z-50 flex h-14 w-full items-center justify-between bg-white px-4 dark:bg-[#151314]">
      <div className="flex items-center gap-2">
        <div
          onClick={toggleSidebar}
          className="cursor-pointer rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Menu size={16} />
        </div>
        <h3 className="flex items-center gap-0.5 font-medium tracking-tight">
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
            className="gap-1 bg-blue-50 pr-5 text-blue-800/90 dark:bg-blue-50/10 dark:text-[#a8c8fb]"
          />
        </Link>
        <SignedOut>
          <Link href="/sign-in">
            <Button
              type="button"
              label="Log In"
              className="bg-black/85 text-white/90 dark:bg-white/5"
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
