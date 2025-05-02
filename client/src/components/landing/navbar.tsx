import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";

export default function Navbar() {
  const isMobile = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuItems = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
    { label: "Demo", href: "#demo" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Coffee className="text-white text-xl" />
              </div>
              <span className="ml-2 text-xl font-bold text-dark font-poppins">CafeRewards</span>
            </Link>
          </div>
          
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <a 
                  key={item.label} 
                  href={item.href} 
                  className="text-dark hover:text-primary px-3 py-2 font-medium transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="hidden md:block px-4 py-2 rounded-lg text-dark border border-dark hover:bg-dark hover:text-white transition-all font-medium btn-hover"
              asChild
            >
              <Link href="/auth">Login</Link>
            </Button>
            
            <Button 
              className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-all btn-hover"
              asChild
            >
              <Link href="/auth">Try for Free</Link>
            </Button>
            
            {isMobile && (
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col space-y-4 mt-8">
                    {menuItems.map((item) => (
                      <SheetClose key={item.label} asChild>
                        <a 
                          href={item.href}
                          className="text-lg font-medium text-dark hover:text-primary py-2"
                        >
                          {item.label}
                        </a>
                      </SheetClose>
                    ))}
                    <SheetClose asChild>
                      <Link href="/auth" className="text-lg font-medium text-dark hover:text-primary py-2">
                        Login
                      </Link>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
