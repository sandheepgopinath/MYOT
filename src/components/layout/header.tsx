import { Shirt } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Shirt className="h-8 w-8 text-primary group-hover:animate-pulse" />
          <h1 className="text-3xl font-headline font-bold text-foreground tracking-wider">
            MYOT
          </h1>
        </Link>
        <nav>
          {/* Future nav links can go here */}
        </nav>
      </div>
    </header>
  );
}
