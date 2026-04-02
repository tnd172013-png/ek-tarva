"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg-primary px-6 py-24">
      {/* Aurora gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(0,100,173,0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(0,212,255,0.15), transparent), radial-gradient(ellipse 50% 60% at 50% 90%, rgba(0,100,173,0.2), transparent)",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "linear-gradient(45deg, rgba(0,100,173,0.3), rgba(0,212,255,0.1), rgba(191,217,255,0.1), rgba(0,100,173,0.2))",
            backgroundSize: "400% 400%",
            animation: "aurora 12s ease-in-out infinite",
          }}
        />
      </div>

      {/* Grid pattern */}
      <div className="tech-grid pointer-events-none absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
        <div className="mb-8 animate-[fade-up_0.8s_ease-out_both]">
          <Image
            src="/images/logo-light.png"
            alt="Ektarva"
            width={180}
            height={60}
            priority
            className="h-auto w-32 opacity-80 md:w-40"
          />
        </div>

        <div className="mb-6 inline-flex animate-[fade-up_0.8s_ease-out_0.2s_both] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-cyan-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-accent animate-pulse" />
          Live Hiring Event
        </div>

        <h1 className="mb-6 animate-[fade-up_1s_ease-out_0.3s_both] text-[clamp(3rem,10vw,7rem)] font-bold leading-[0.95] tracking-[-0.03em] text-white">
          Pitch to{" "}
          <span className="gradient-text">Hire</span>
        </h1>

        <p className="mb-4 animate-[fade-up_0.8s_ease-out_0.5s_both] text-xl font-medium text-text-secondary md:text-2xl">
          Where companies pitch.
          <br />
          <span className="text-white">You choose where you get hired.</span>
        </p>

        <p className="mb-10 max-w-lg animate-[fade-up_0.8s_ease-out_0.6s_both] text-base text-text-muted md:text-lg">
          A live hiring event for frontend developers to connect directly with
          20+ companies.
        </p>

        <a
          href="#register"
          className="group relative mb-14 inline-flex animate-[fade-up_0.8s_ease-out_0.7s_both] items-center gap-3 overflow-hidden rounded-full bg-cobalt px-10 py-5 text-lg font-semibold text-white shadow-[0_0_30px_rgba(0,100,173,0.4)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,100,173,0.6)] hover:scale-[1.03]"
        >
          <span className="relative z-10">Book Your Spot for ₹199</span>
          <svg
            className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </a>

        {/* Stats */}
        <div className="flex animate-[fade-up_0.8s_ease-out_0.9s_both] flex-wrap items-center justify-center gap-8 md:gap-12">
          {[
            { value: "20+", label: "Companies" },
            { value: "2-3 hrs", label: "Duration" },
            { value: "₹199", label: "Access Fee" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white md:text-3xl">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-[0.1em] text-text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent" />
    </section>
  );
}
