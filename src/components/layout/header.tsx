import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 absolute top-0 w-full z-20">
      <div className="container mx-auto flex items-center justify-between text-white">
        <Link href="/">
          <h1 className="text-xl font-bold tracking-widest uppercase">
            MAKE YOUR OWN TEE.
          </h1>
        </Link>
        <nav className="flex items-center gap-6">
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black rounded-sm uppercase">
            Start
          </Button>
        </nav>
      </div>
    </header>
  );
}
