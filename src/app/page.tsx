import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Hero from "@/components/myot/hero";
import Customizer from "@/components/myot/customizer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Hero />
        <div className="container mx-auto px-4">
          <Customizer />
        </div>
      </main>
      <Footer />
    </div>
  );
}
