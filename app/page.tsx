import { About } from "@/components/About";
import { Events } from "@/components/Events";
import { Hero } from "@/components/Hero";
import { Locations } from "@/components/Locations";
import { MenuSection } from "@/components/MenuSection";

export default function Home() {
  return (
    <main id="main" className="flex-1">
        <Hero />
        <MenuSection />
        <Locations />
        <Events />
        <About />
    </main>
  );
}
