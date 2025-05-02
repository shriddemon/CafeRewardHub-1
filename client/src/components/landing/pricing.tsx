import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlanProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}

function PricingCard({ title, description, price, features, isPopular, buttonText }: PlanProps) {
  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${isPopular ? 'shadow-lg relative' : ''}`}>
      {isPopular && (
        <div className="absolute top-0 inset-x-0 flex justify-center">
          <Badge className="bg-accent text-dark px-4 py-1 rounded-b-lg font-medium text-sm">
            Most Popular
          </Badge>
        </div>
      )}
      <div className={`p-6 ${isPopular ? 'pt-10' : ''}`}>
        <h3 className="text-xl font-bold font-dm mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-baseline mb-4">
          <span className="text-4xl font-bold font-poppins">{price}</span>
          <span className="text-gray-600 ml-2">/month</span>
        </div>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="text-green-500 mr-2 h-5 w-5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-6 pb-6">
        <Button 
          variant={isPopular ? "default" : "outline"} 
          className={isPopular ? "w-full bg-primary hover:bg-primary/90" : "w-full text-primary border-primary hover:text-white hover:bg-primary"}
          asChild
        >
          <Link href="/auth">{buttonText}</Link>
        </Button>
      </div>
    </div>
  );
}

export default function Pricing() {
  const plans = [
    {
      title: "Starter",
      description: "Perfect for small cafes just getting started",
      price: "₹999",
      features: [
        "Up to 200 customers",
        "Basic reward templates",
        "2 gamification options",
        "Basic WhatsApp notifications",
        "Email support",
      ],
      buttonText: "Start Free Trial",
    },
    {
      title: "Professional",
      description: "For established cafes looking to grow",
      price: "₹2,499",
      features: [
        "Up to 1,000 customers",
        "Custom reward programs",
        "All gamification options",
        "Advanced WhatsApp integration",
        "Priority support",
        "Basic analytics",
      ],
      isPopular: true,
      buttonText: "Start Free Trial",
    },
    {
      title: "Enterprise",
      description: "For cafe chains and large establishments",
      price: "₹5,999",
      features: [
        "Unlimited customers",
        "Custom branding",
        "Custom game development",
        "Full WhatsApp Business API",
        "Advanced analytics & reporting",
        "Dedicated account manager",
      ],
      buttonText: "Contact Sales",
    },
  ];

  return (
    <section id="pricing" className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-poppins">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Affordable plans designed for cafes of all sizes. No hidden fees.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.title}
              description={plan.description}
              price={plan.price}
              features={plan.features}
              isPopular={plan.isPopular}
              buttonText={plan.buttonText}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
