'use client';

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import TShirtSelector from "@/components/myot/tshirt-selector";

export default function CraftPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header scrollY={100} /> {/* Always show header background */}
            <main className="flex-grow pt-20">
                <TShirtSelector />
            </main>
            <Footer />
        </div>
    );
}
