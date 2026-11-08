import { About } from "@/components/About";
import { Events } from "@/components/Events";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Locations } from "@/components/Locations";
import { MenuSection } from "@/components/MenuSection";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <Hero />
        <MenuSection />
        <Locations />
        <Events />
        <About />
      </main>
      <Footer />
    </>
  );
}
