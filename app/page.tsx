import { FeatureGrid } from "@/components/sections/feature-grid";
import { HeroSection } from "@/components/sections/hero";
import { HomeStats } from "@/components/sections/home-stats";

export default function Home() {
  return (
    <>
      <HeroSection />
      <HomeStats />
      <FeatureGrid />
    </>
  );
}
