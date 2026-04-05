"use client";

const steps = [
  { num: "01", title: "Join the Live Session", desc: "Log in from anywhere — it's fully online" },
  { num: "02", title: "Companies Pitch", desc: "20+ companies present their openings (15 mins each)" },
  { num: "03", title: "You Choose", desc: "Pick the companies that match your goals" },
  { num: "04", title: "Move Forward", desc: "Get direct access to apply & start the process" },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-bg-elevated px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/70">The Process</p>
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">How It Works</h2>
        </div>

        <div className="relative mx-auto max-w-2xl">
          <div className="absolute left-[23px] top-0 hidden h-full w-px bg-gradient-to-b from-white/30 via-white/10 to-transparent md:left-[27px] md:block" />

          <div className="space-y-5">
            {steps.map((step, i) => (
              <div key={step.num} className="group flex items-start gap-5" style={{ animation: `fade-up 0.6s ease-out ${0.15 * i}s both` }}>
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center md:h-14 md:w-14">
                  <div className="absolute inset-0 rounded-xl bg-bg-primary border border-white/10 transition-all duration-300 group-hover:border-cobalt/50 group-hover:shadow-[0_0_25px_rgba(0,74,173,0.3)]" />
                  <span className="relative text-sm font-bold text-white md:text-base">{step.num}</span>
                </div>
                <div className="glass rounded-xl px-5 py-4 flex-1 transition-all duration-300 group-hover:bg-white/[0.05]">
                  <h3 className="mb-1 text-base font-semibold text-white md:text-lg">{step.title}</h3>
                  <p className="text-xs text-white/70 md:text-sm">{step.desc}</p>
                  {i === 1 && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/80">
                      <span className="h-1 w-1 rounded-full bg-white/80" />
                      15 mins per company
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
