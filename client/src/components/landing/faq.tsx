import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <AccordionItem value={question}>
      <AccordionTrigger className="font-bold text-lg">{question}</AccordionTrigger>
      <AccordionContent className="text-gray-600">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}

export default function FAQ() {
  const faqs = [
    {
      question: "How long does it take to set up CafeRewards?",
      answer: "Most cafe owners are up and running within a day. Our onboarding team will help you configure your reward programs, set up games, and integrate WhatsApp notifications. The basic setup takes as little as 30 minutes if you're ready with your cafe details and preferences.",
    },
    {
      question: "Can I customize the look and feel to match my cafe brand?",
      answer: "Absolutely! With our Professional and Enterprise plans, you can customize colors, logos, fonts, and even the style of games to match your cafe's unique brand identity. The Starter plan offers basic customization options.",
    },
    {
      question: "How does the WhatsApp integration work?",
      answer: "CafeRewards integrates with WhatsApp Business API to send automated notifications about rewards, special offers, and game opportunities. Customers opt-in during registration, and you can send targeted messages based on their activity and preferences. The setup process is simple with our guided integration tool.",
    },
    {
      question: "Can I try before I buy?",
      answer: "Yes! We offer a 14-day free trial on all our plans with no credit card required. You'll get full access to all features during the trial period so you can experience exactly how CafeRewards will work for your business.",
    },
    {
      question: "What types of games and rewards can I create?",
      answer: "CafeRewards offers a variety of gamification options including spin wheels, scratch cards, trivia questions, and punch cards. For rewards, you can create traditional \"buy X get 1 free\" programs, discount vouchers, birthday specials, referral bonuses, and more. The Enterprise plan even allows for fully custom games tailored to your specific needs.",
    },
  ];

  return (
    <section id="faq" className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-poppins">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-gray-600">
            Have questions? We've got answers.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm">
              <FAQItem
                question={faq.question}
                answer={faq.answer}
              />
            </div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
