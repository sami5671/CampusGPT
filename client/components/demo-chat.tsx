'use client'

import { Send } from 'lucide-react'

export default function DemoChat() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">See It In Action</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Watch how CampusGPT simplifies finding information.
          </p>
        </div>

        {/* Chat Demo */}
        <div className="relative">
          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent/50 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"></div>
          
          <div className="relative rounded-2xl bg-card border border-border/40 overflow-hidden shadow-2xl">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/40 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/bot-avatar.jpg"
                  alt="CampusGPT Bot"
                  className="w-8 h-8 rounded-full object-cover border border-primary/40 shadow-sm"
                />
                <h3 className="font-semibold text-foreground">CampusGPT Assistant</h3>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-6 space-y-6 min-h-96">
              {/* Message 1 */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-3xl rounded-tr-md px-6 py-3 max-w-xs">
                  <p className="text-foreground">Where is Registration Office?</p>
                </div>
              </div>

              {/* Response 1 */}
              <div className="flex justify-start gap-3 items-start">
                <img
                  src="/bot-avatar.jpg"
                  alt="Bot"
                  className="w-8 h-8 rounded-full object-cover border border-primary/40 shadow-sm flex-shrink-0 mt-1"
                />
                <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30 rounded-3xl rounded-tl-md px-6 py-3 max-w-sm space-y-3">
                  <div>
                    <p className="font-semibold text-secondary mb-1">Registration Office</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>📍 Building-3, Floor-4, Room-405</p>
                      <p>📧 registration@university.edu</p>
                      <p>📞 +1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message 2 */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-3xl rounded-tr-md px-6 py-3 max-w-xs">
                  <p className="text-foreground">Show CSE 8th Semester routine</p>
                </div>
              </div>

              {/* Response 2 */}
              <div className="flex justify-start gap-3 items-start">
                <img
                  src="/bot-avatar.jpg"
                  alt="Bot"
                  className="w-8 h-8 rounded-full object-cover border border-primary/40 shadow-sm flex-shrink-0 mt-1"
                />
                <div className="bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 rounded-3xl rounded-tl-md px-6 py-3 max-w-sm">
                  <p className="font-semibold text-accent mb-3">CSE 8th Semester Schedule</p>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-card/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Mon-Wed</p>
                        <p className="text-foreground font-medium">Data Science</p>
                      </div>
                      <div className="bg-card/50 rounded p-2">
                        <p className="text-xs text-muted-foreground">Tue-Thu</p>
                        <p className="text-foreground font-medium">AI/ML</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border/40 bg-gradient-to-r from-card/50 to-background/50 p-4">
              <div className="flex gap-3 items-center bg-muted/30 border border-border/40 rounded-full px-4 py-3">
                <input
                  type="text"
                  placeholder="Ask anything about your university..."
                  className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm"
                  disabled
                />
                <button className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center hover:shadow-lg hover:shadow-primary/30 transition-all">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
