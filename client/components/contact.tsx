'use client'

import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Contact() {
  return (
    <section id="contact" className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Get In Touch</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Have questions? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Email */}
          <div className="relative group p-8 rounded-2xl bg-card/50 border border-border/40 hover:border-primary/40 transition-all text-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent/50 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Email</h3>
              <p className="text-sm text-muted-foreground">support@campusgpt.edu</p>
            </div>
          </div>

          {/* Phone */}
          <div className="relative group p-8 rounded-2xl bg-card/50 border border-border/40 hover:border-secondary/40 transition-all text-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent/50 flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Phone</h3>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
            </div>
          </div>

          {/* Address */}
          <div className="relative group p-8 rounded-2xl bg-card/50 border border-border/40 hover:border-accent/40 transition-all text-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary/50 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Address</h3>
              <p className="text-sm text-muted-foreground">Main Campus, Building A</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="relative p-8 rounded-2xl bg-card/50 border border-border/40">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5"></div>
            <div className="relative space-y-6">
              <h3 className="text-2xl font-bold text-foreground">Send us a message</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="px-4 py-3 rounded-lg bg-muted/50 border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 transition"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="px-4 py-3 rounded-lg bg-muted/50 border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 transition"
                />
              </div>

              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 transition resize-none"
              ></textarea>

              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0 py-3">
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Background elements */}
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10"></div>
    </section>
  )
}
