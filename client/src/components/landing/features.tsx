import { Award, Gamepad, Coffee, BookOpen, ShoppingBag, UserPlus } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-xl mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold font-dm mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function Features() {
  const features = [
    {
      icon: <Award className="h-6 w-6" />,
      title: "Customizable Rewards",
      description: "Create tailored reward programs that match your cafe's unique personality and customer preferences.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: <Gamepad className="h-6 w-6" />,
      title: "Gamification",
      description: "Engage customers with fun games and challenges that make earning rewards exciting and addictive.",
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: <Coffee className="h-6 w-6" />,
      title: "WhatsApp Integration",
      description: "Send automated reward notifications directly to your customers' WhatsApp with one simple integration.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Owner Dashboard",
      description: "Comprehensive analytics and management tools to monitor customer engagement and reward program performance.",
      color: "bg-green-100 text-green-700",
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Order Management",
      description: "Seamlessly handle both dine-in and online orders with a user-friendly interface for staff and customers.",
      color: "bg-red-100 text-red-700",
    },
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: "Customer Profiles",
      description: "Detailed customer insights including preferences, visit history, and reward status to personalize your service.",
      color: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <section id="features" className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-poppins">Powerful Features for Your Cafe Business</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to create engaging reward systems and keep your customers coming back.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
