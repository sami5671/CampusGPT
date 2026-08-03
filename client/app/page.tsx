'use client'

import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Features from '@/components/features'
import HowItWorks from '@/components/how-it-works'
import Statistics from '@/components/statistics'
import DemoChat from '@/components/demo-chat'
import Testimonials from '@/components/testimonials'
import Pricing from '@/components/pricing'
import FAQ from '@/components/faq'
import Contact from '@/components/contact'
import Footer from '@/components/footer'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Statistics />
      <DemoChat />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  )
}
