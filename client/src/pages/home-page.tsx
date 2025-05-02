import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import HowItWorks from "@/components/landing/how-it-works";
import Pricing from "@/components/landing/pricing";
import Demo from "@/components/landing/demo";
import Testimonials from "@/components/landing/testimonials";
import FAQ from "@/components/landing/faq";
import CTA from "@/components/landing/cta";
import Footer from "@/components/landing/footer";

export default function HomePage() {
  const { user, isOwner, isCustomer } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect if user is logged in
  useEffect(() => {
    if (user) {
      if (isOwner) {
        setLocation("/owner/dashboard");
      } else if (isCustomer) {
        setLocation("/customer/dashboard");
      }
    }
  }, [user, isOwner, isCustomer, setLocation]);

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Demo />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
