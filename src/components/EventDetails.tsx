"use client";

const details = [
  { icon: "🖥", label: "Mode", value: "Online (Live)" },
  { icon: "⏱", label: "Duration", value: "2-3 Hours" },
  { icon: "🏢", label: "Companies", value: "20+ Hiring Teams" },
  { icon: "🎟", label: "Access Fee", value: "₹199" },
];

export default function EventDetails() {
  return (
    <section className="relative bg-bg-primary px-6 py-32 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="mx-auto max-w-4xl">
        <div className="mb-4 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-cobalt">Details</p>
          <h2 className="mb-3 text-3xl font-bold tracking-[-0.02em] text-white md:text-5xl">
            Event Details
          </h2>
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cobalt/20 bg-cobalt/5 px-4 py-1.5 text-sm font-medium text-cobalt">
            <span className="h-1.5 w-1.5 rounded-full bg-cobalt animate-pulse" />
            Date announcement coming soon
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {details.map((d, i) => (
            <div
              key={d.label}
              className="glass group flex flex-col items-center rounded-2xl p-6 text-center transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(0,100,173,0.12)]"
              style={{ animation: `fade-up 0.6s ease-out ${0.1 * i}s both` }}
            >
              <span className="mb-3 text-2xl">{d.icon}</span>
              <span className="mb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-text-muted">
                {d.label}
              </span>
              <span className="text-lg font-bold text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
