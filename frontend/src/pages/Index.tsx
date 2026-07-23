import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PhilosophySection } from "@/components/PhilosophySection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { SubjectsSection } from "@/components/SubjectsSection";
import { LearningDNASection } from "@/components/LearningDNASection";
import { RollingExperienceWall } from "@/components/RollingExperienceWall";
import { CTASection } from "@/components/CTASection";
import { LegalPopupSection } from "@/components/LegalPopupSection";
import { Footer } from "@/components/Footer";
import { NotificationBanner } from "@/components/NotificationBanner";
import { CookieConsent } from "@/components/CookieConsent";
import { SupportChatWidget } from "@/components/chat/SupportChatWidget";
import { AgeGate } from "@/components/AgeGate";

const Index = () => {
  return (
    <div 
      className="min-h-screen bg-background flex flex-col"
      style={{
        // Fluid container with clamp for responsive sizing
        maxWidth: 'clamp(100%, 90vw, 1920px)',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <AgeGate />
      <NotificationBanner />
      <Navbar />
      <main 
        id="main-content" 
        className="flex-1 w-full"
        style={{
          // Fluid spacing for main content
          padding: 'clamp(1rem, 2vw, 2rem)',
        }}
      >
        <HeroSection />
        <LegalPopupSection />
        <RollingExperienceWall />
        <HowItWorksSection />
        <SubjectsSection />
        <PhilosophySection />
        <LearningDNASection />
        <CTASection />
      </main>
      <Footer />
      <CookieConsent />
      <SupportChatWidget />
    </div>
  );
};

export default Index;
