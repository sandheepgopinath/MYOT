import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 absolute top-0 w-full z-20 border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between text-white">
        <Link href="/">
          <h1 className="text-xl font-bold tracking-widest uppercase">
            MAKE MY TEE.
          </h1>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="#" className="flex items-center gap-2 text-sm uppercase tracking-wider hover:text-white/80 transition-colors">
            <Sun className="h-4 w-4" />
            How it works
          </Link>
          <Button className="bg-white text-black hover:bg-gray-200 rounded-sm uppercase">
            Start Crafting
          </Button>
        </nav>
      </div>
    </header>
  );
}
