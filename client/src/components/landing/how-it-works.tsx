interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold font-dm mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Sign Up & Configure",
      description: "Create your cafe profile, choose your reward structure, and customize games for your customers.",
    },
    {
      number: 2,
      title: "Invite Customers",
      description: "Share your unique QR code in-store or via social media to get customers signed up to your rewards program.",
    },
    {
      number: 3,
      title: "Watch Loyalty Grow",
      description: "As customers earn rewards and engage with games, they'll return more often and spend more.",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-poppins">How CafeRewards Works</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Simple setup process for cafe owners and a delightful experience for your customers.
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step) => (
              <Step
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
