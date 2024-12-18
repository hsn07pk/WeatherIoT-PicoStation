import Image from "next/image";
// import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export default function Home() {
  // const words = `Developed by Team 6.`;
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="">
       

        <div>
          <BackgroundBeamsWithCollision className="flex-col">
          <Image className="dark:invert" src="/snow.png" alt="cloudy logo" width={120} height={120} priority />
          <h1 className="text-6xl relative mt-6 z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">-17°</h1>
            <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
              
              <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
              
                <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
                  <span className="">Pressure: 983 Pa</span>
                </div>
              </div>
          
            </h2>
          </BackgroundBeamsWithCollision>
        </div>
      </main>
      {/* <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <TextGenerateEffect words={words} />
      </footer> */}
    </div>
  );
}
