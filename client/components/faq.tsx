'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How accurate is CampusGPT?',
    answer: 'CampusGPT is trained on official university data and updated regularly. Our AI achieves 95%+ accuracy for university-related questions. We continuously improve our knowledge base based on user feedback.',
  },
  {
    question: 'Is CampusGPT free?',
    answer: 'Yes! CampusGPT is completely free for all students. We believe every student should have easy access to university information without any barriers.',
  },
  {
    question: 'Can I use it on mobile?',
    answer: 'Absolutely! CampusGPT works seamlessly on all devices including smartphones, tablets, and desktop computers.',
  },
  {
    question: 'Does it work offline?',
    answer: 'CampusGPT requires an internet connection to function as it accesses live university data. However, we are working on offline capabilities for future releases.',
  },
  {
    question: 'What if I need help?',
    answer: 'Our support team is available 24/7. You can reach out through our contact page or email support.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Frequently Asked</span>
            <br />
            <span className="text-foreground">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about CampusGPT.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <button
              key={idx}
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full text-left group"
            >
              <div className="p-6 rounded-2xl bg-card/50 border border-border/40 hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                      openIndex === idx ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </div>

                {/* Answer */}
                {openIndex === idx && (
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
