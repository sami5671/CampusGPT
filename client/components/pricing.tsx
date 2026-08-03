'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export default function Pricing() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Simple Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Free for all students. Enhanced features coming soon.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-xl mx-auto">
          <div className="relative group">
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-20 group-hover:opacity-40 blur-xl transition-all"></div>

            <div className="relative p-10 rounded-2xl bg-card border border-primary/30 backdrop-blur-xl">
              {/* Badge */}
              <div className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-medium mb-6">
                ✨ Free Student Plan
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="text-5xl font-bold text-foreground">$0</div>
                <p className="text-muted-foreground mt-2">Forever free for all students</p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Unlimited university questions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Access faculty directory</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Campus navigation tools</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Notice and schedule search</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">24/7 availability</span>
                </div>
              </div>

              {/* CTA */}
              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0 py-6 text-base">
                Start for Free
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
