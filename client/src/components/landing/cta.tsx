import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-primary rounded-2xl overflow-hidden shadow-xl">
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-12">
              <h2 className="text-3xl font-bold text-white font-poppins mb-4">Ready to Transform Your Cafe Business?</h2>
              <p className="text-white text-opacity-90 mb-8">
                Join hundreds of successful cafe owners across India who are building customer loyalty with CafeRewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="px-6 py-3 rounded-lg bg-white text-primary font-medium hover:bg-opacity-90 transition-all btn-hover"
                  asChild
                >
                  <Link href="/auth">Start Your Free Trial</Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="px-6 py-3 rounded-lg border border-white text-white font-medium hover:bg-white hover:text-primary transition-all btn-hover"
                >
                  Schedule a Demo
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative h-full min-h-[300px] bg-gradient-to-r from-primary/60 to-accent/60">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-10">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                  <line x1="6" y1="1" x2="6" y2="4"></line>
                  <line x1="10" y1="1" x2="10" y2="4"></line>
                  <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
