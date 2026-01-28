'use client';

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Hero from "@/components/myot/hero";
import HowItWorks from "@/components/myot/how-it-works";
import Personalize from "@/components/myot/personalize";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  return (
    <div className="flex flex-col">
      <Header />
      {/* This outer div creates the scrollable height */}
      <div className="relative h-[1300vh] w-full">
        {/* This main tag will stick to the top */}
        <main className="sticky top-0 h-screen w-full overflow-hidden">
          <Hero scrollY={scrollY} />
          <HowItWorks scrollY={scrollY} />
          <Personalize scrollY={scrollY} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
