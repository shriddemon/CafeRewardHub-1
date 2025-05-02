import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  BarChart, 
  Bell, 
  Gift, 
  Gamepad, 
  ShoppingCart 
} from "lucide-react";

interface DemoCardProps {
  title: string;
  description: string;
  features: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  buttonText: string;
  buttonColor: string;
  buttonLink: string;
}

function DemoCard({ title, description, features, buttonText, buttonColor, buttonLink }: DemoCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md">
      <div className="p-6 border-b">
        <h3 className="text-xl font-bold font-dm">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="p-6 bg-gray-50">
        <div className="w-full h-64 bg-gray-200 rounded-lg shadow-sm flex items-center justify-center">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <p className="text-gray-500">Demo Preview</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`${buttonColor === "bg-primary" ? "text-primary" : "text-accent"} text-xl`}>
                {feature.icon}
              </div>
              <div>
                <h4 className="font-medium">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6">
        <Button 
          className={`w-full ${buttonColor} hover:opacity-90 transition-all`}
          asChild
        >
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      </div>
    </div>
  );
}

export default function Demo() {
  const ownerFeatures = [
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Configure Reward Programs",
      description: "Create and customize loyalty programs that match your brand",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Customer Analytics",
      description: "Track engagement, redemption rates, and customer behavior",
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Notification Management",
      description: "Create targeted WhatsApp campaigns and automated messages",
    },
  ];
  
  const customerFeatures = [
    {
      icon: <Gift className="h-6 w-6" />,
      title: "Collect Reward Points",
      description: "Earn points with every purchase and track your progress",
    },
    {
      icon: <Gamepad className="h-6 w-6" />,
      title: "Play Engaging Games",
      description: "Spin wheels, scratch cards, and more to win bonus rewards",
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: "Order Management",
      description: "Place, track, and reorder your favorite items",
    },
  ];

  return (
    <section id="demo" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-poppins">Experience Our Platform</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            See how CafeRewards works from both cafe owner and customer perspectives.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <DemoCard
            title="Cafe Owner Dashboard"
            description="Manage rewards, view analytics, and engage customers"
            features={ownerFeatures}
            buttonText="Try Owner Demo"
            buttonColor="bg-primary"
            buttonLink="/auth"
          />
          
          <DemoCard
            title="Customer Experience"
            description="Earn rewards, play games, and place orders"
            features={customerFeatures}
            buttonText="Try Customer Demo"
            buttonColor="bg-accent text-dark"
            buttonLink="/auth"
          />
        </div>
      </div>
    </section>
  );
}
