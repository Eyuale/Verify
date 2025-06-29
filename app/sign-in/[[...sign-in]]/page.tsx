import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white pt-12 dark:bg-[#151314]">
      <SignIn />
    </div>
  );
}
