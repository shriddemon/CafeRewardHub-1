import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

export default function Hero() {
  const isMobile = useMobile();

  return (
    <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-poppins leading-tight">
              Reward Your <span className="text-primary">Cafe Customers</span> in Style
            </h1>
            <p className="mt-5 text-lg text-gray-600">
              Create engaging reward systems and gamify your cafe experience. Increase customer loyalty and boost sales with our all-in-one SaaS platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button 
                className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-all btn-hover text-center"
                asChild
              >
                <Link href="/auth">Start Free Trial</Link>
              </Button>
              <Button 
                variant="outline"
                className="px-6 py-3 rounded-lg border border-dark text-dark font-medium hover:bg-dark hover:text-white transition-all btn-hover text-center flex items-center justify-center"
              >
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </Button>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-secondary/20 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-accent/20 border-2 border-white"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Trusted by <span className="font-bold text-dark">500+</span> cafe owners across India</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white p-6 rounded-2xl shadow-xl card-shadow relative z-10">
              <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-80">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg font-dm">Customer Rewards</h3>
                  <p className="text-sm text-gray-600">Daily engaging activities</p>
                </div>
                <span className="bg-accent bg-opacity-20 text-accent px-3 py-1 rounded-full text-sm font-medium">5 ★ Rating</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                      <line x1="6" y1="1" x2="6" y2="4"></line>
                      <line x1="10" y1="1" x2="10" y2="4"></line>
                      <line x1="14" y1="1" x2="14" y2="4"></line>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Buy 8 coffees, get 1 free</p>
                    <div className="mt-1 flex space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      ))}
                      {[6, 7, 8].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          {i}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-secondary bg-opacity-10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-secondary">Daily Spin & Win</h4>
                    <span className="text-xs bg-secondary text-white px-2 py-1 rounded">Play Now</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Win exciting rewards every day!</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span className="ml-2 text-sm">WhatsApp notifications enabled</span>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Connected</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-40 h-40 bg-accent rounded-full opacity-20 z-0"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary rounded-full opacity-20 z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
