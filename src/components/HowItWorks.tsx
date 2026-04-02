"use client";

const steps = [
  { num: "01", title: "Join the Live Session", desc: "Log in from anywhere — it's fully online" },
  { num: "02", title: "Companies Pitch", desc: "20+ companies present their openings (15 mins each)" },
  { num: "03", title: "You Choose", desc: "Pick the companies that match your goals" },
  { num: "04", title: "Move Forward", desc: "Get direct access to apply & start the process" },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-bg-elevated px-6 py-32 md:py-40">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-cobalt">
            The Process
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-white md:text-5xl">
            How It Works
          </h2>
        </div>

        <div className="relative mx-auto max-w-2xl">
          {/* Connector line */}
          <div className="absolute left-[27px] top-0 hidden h-full w-px bg-gradient-to-b from-cobalt/50 via-cobalt/20 to-transparent md:left-[31px] md:block" />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="group flex items-start gap-6"
                style={{ animation: `fade-up 0.6s ease-out ${0.15 * i}s both` }}
              >
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center md:h-16 md:w-16">
                  <div className="absolute inset-0 rounded-2xl bg-bg-primary border border-white/10 transition-all duration-300 group-hover:border-cobalt/50 group-hover:shadow-[0_0_25px_rgba(0,100,173,0.3)]" />
                  <span className="relative text-lg font-bold text-cobalt">{step.num}</span>
                </div>
                <div className="glass rounded-2xl px-6 py-5 flex-1 transition-all duration-300 group-hover:bg-white/[0.05]">
                  <h3 className="mb-1.5 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-text-muted">{step.desc}</p>
                  {i === 1 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-cobalt/10 px-3 py-1 text-xs font-medium text-cobalt">
                      <span className="h-1 w-1 rounded-full bg-cobalt" />
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
