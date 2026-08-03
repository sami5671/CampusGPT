'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-gradient-to-t from-card/30 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-bold text-lg text-foreground">CampusGPT</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your AI-powered university assistant, available 24/7.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="text-muted-foreground hover:text-foreground transition">Features</Link></li>
              <li><Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">How It Works</Link></li>
              <li><Link href="#faq" className="text-muted-foreground hover:text-foreground transition">FAQ</Link></li>
              <li><Link href="#contact" className="text-muted-foreground hover:text-foreground transition">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Follow Us</h4>
            <div className="flex gap-3">
              <Link
                href="#"
                className="w-10 h-10 rounded-lg bg-card border border-border/40 flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition text-lg"
              >
                ⚙️
              </Link>
              <Link
                href="#"
                className="w-10 h-10 rounded-lg bg-card border border-border/40 flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition text-lg"
              >
                𝕏
              </Link>
              <Link
                href="#"
                className="w-10 h-10 rounded-lg bg-card border border-border/40 flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition text-lg"
              >
                f
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/40 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2026 CampusGPT. All rights reserved.</p>
            <p>Made with ❤️ for students</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
