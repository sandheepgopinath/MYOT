import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Hero from "@/components/myot/hero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
