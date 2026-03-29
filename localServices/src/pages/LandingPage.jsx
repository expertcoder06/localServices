import HeroSection from '../components/HeroSection'
import ServicesSection from '../components/ServicesSection'
import HowItWorks from '../components/HowItWorks'
import TopProfessionals from '../components/TopProfessionals'
import AppPromo from '../components/AppPromo'
import PricingSection from '../components/PricingSection'
import CtaSection from '../components/CtaSection'

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <HowItWorks />
      <TopProfessionals />
      <AppPromo />
      <PricingSection />
      <CtaSection />
    </main>
  )
}
