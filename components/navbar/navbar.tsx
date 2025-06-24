import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full h-16 flex items-center justify-between px-4">
      <h3>Verify</h3>
      <div className="flex h-full items-center gap-4">
        <span>Sign Up</span>
        <span>Login In</span>
      </div>
    </nav>
  );
}
