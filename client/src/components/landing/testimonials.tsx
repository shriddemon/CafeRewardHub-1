import { Star, StarHalf } from "lucide-react";

interface TestimonialProps {
  name: string;
  business: string;
  stars: number;
  text: string;
}

function TestimonialCard({ name, business, stars, text }: TestimonialProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="font-bold text-gray-500">{name.charAt(0)}</span>
        </div>
        <div className="ml-3">
          <h4 className="font-bold">{name}</h4>
          <p className="text-sm text-gray-600">{business}</p>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex text-amber-400">
          {[...Array(Math.floor(stars))].map((_, i) => (
            <Star key={i} className="fill-current" />
          ))}
          {stars % 1 !== 0 && <StarHalf className="fill-current" />}
        </div>
      </div>
      <p className="text-gray-700">{text}</p>
    </div>
  );
}

export default function Testimonials() {
  const testimonials = [
    {
      name: "Priya Sharma",
      business: "The Brew House, Mumbai",
      stars: 5,
      text: "Our customer return rate has increased by 40% since implementing CafeRewards. The WhatsApp notifications keep our customers engaged and the games make them excited to come back.",
    },
    {
      name: "Rahul Patel",
      business: "Bean & Brew, Bangalore",
      stars: 4.5,
      text: "The analytics provided by CafeRewards have been game-changing for us. We can now see which products are most popular and target our promotions effectively. Setup was a breeze too.",
    },
    {
      name: "Anjali Mehta",
      business: "Chai Point, Delhi",
      stars: 5,
      text: "We've seen a 30% increase in average order value since customers started working toward rewards. The WhatsApp integration is perfect for our tech-savvy customers in Delhi.",
    },
  ];

  return (
    <section id="testimonials" className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-poppins">What Cafe Owners Say</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from cafe owners who have transformed their business.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              business={testimonial.business}
              stars={testimonial.stars}
              text={testimonial.text}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
