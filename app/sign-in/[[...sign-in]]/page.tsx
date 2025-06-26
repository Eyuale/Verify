import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-[#151314] pt-12">
      <SignIn />
    </div>
  );
}
