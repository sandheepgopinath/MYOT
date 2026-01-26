'use client';

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Hero from "@/components/myot/hero";
import HowItWorks from "@/components/myot/how-it-works";

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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero scrollY={scrollY} />
        <HowItWorks scrollY={scrollY} />
      </main>
      <Footer />
    </div>
  );
}
