"use client";

export default function ScarcityBanner() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="absolute inset-0 bg-bg-elevated" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,100,173,0.15), transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          Limited Availability
        </div>

        <h3 className="mb-4 text-2xl font-bold text-white md:text-4xl">
          Registrations are limited.
        </h3>
        <p className="mb-10 text-text-muted">
          To keep the experience focused and valuable, once it&apos;s full,
          entries are closed.
        </p>

        <a
          href="#register"
          className="group relative inline-flex items-center gap-3 rounded-full bg-cobalt px-10 py-5 text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.03]"
          style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
        >
          <span>Secure Your Spot Now</span>
          <svg
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
