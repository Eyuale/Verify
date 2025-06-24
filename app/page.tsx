export default function Home() {
  return (
    <div className="w-full min-h-screen pb-8">
      <div className="w-full grid-cols-2 min-h-screen">
        <div className="w-full h-full">
          <h1 className="text-8xl leading-[90%] tracking-tighter mt-20 font-medium">
            <span className="text-blue-600">Trusted</span> Video <br />
            Product Reviews
          </h1>
          <p className="mt-4 font-normal text-black/60 max-w-1/3 ml-2">
            Your go to site for sellers & consumers helping each other make
            better purchasing decisions.
          </p>
        </div>

        <div></div>
      </div>

      {/* Product lists */}
      <div className="w-full grid-cols-5 gap-4">
        <div className="w-full h-full bg-black/5 rounded-lg p-4">
          <h1>iPhone 16 Pro Max</h1>
          <p className="text-xs opacity-60">
            The most advanced iPhone ever with titanium design, A17 Pro chip,
            and revolutionary camera system.
          </p>
        </div>
      </div>
    </div>
  );
}
