'use client'

const stats = [
  {
    value: '50+',
    label: 'Departments',
  },
  {
    value: '500+',
    label: 'Faculty Members',
  },
  {
    value: '20K+',
    label: 'Students',
  },
  {
    value: '24/7',
    label: 'AI Availability',
  },
]

export default function Statistics() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="group relative p-8 rounded-2xl text-center backdrop-blur-sm"
            >
              {/* Animated background */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 group-hover:border-accent/40 transition-all"></div>

              {/* Content */}
              <div className="relative space-y-2">
                <div className="text-3xl md:text-5xl font-bold gradient-text">{stat.value}</div>
                <p className="text-muted-foreground text-sm md:text-base">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
