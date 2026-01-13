import { HeroSection } from "@/components/hero-section"
import { FeaturesGrid } from "@/components/features-grid"
import { AboutSection } from "@/components/about-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesGrid />
      <AboutSection />
    </main>
  )
}
