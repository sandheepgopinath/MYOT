import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 absolute top-0 w-full z-20">
      <div className="container mx-auto flex items-center justify-between text-white">
        <Link href="/">
          <h1 className="text-xl font-bold tracking-widest uppercase">
            MAKE MY TEE.
          </h1>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="#" className="text-sm font-medium hover:underline hidden md:block">
            MENU
          </Link>
          <div className="w-px h-6 bg-white/50 hidden md:block"></div>
          <Button variant="outline" asChild className="border-white text-white hover:bg-white hover:text-black rounded-sm">
            <a href="#customizer">Start crafting</a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
