"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-bg-primary px-6 pt-12 pb-10 md:pt-16">
      {/* Aurora gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(0,74,173,0.4), transparent), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(79,115,135,0.2), transparent), radial-gradient(ellipse 50% 60% at 50% 90%, rgba(0,74,173,0.3), transparent)",
          }}
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background:
              "linear-gradient(45deg, rgba(0,74,173,0.3), rgba(79,115,135,0.15), rgba(191,217,255,0.1), rgba(0,74,173,0.2))",
            backgroundSize: "400% 400%",
            animation: "aurora 12s ease-in-out infinite",
          }}
        />
      </div>

      {/* Grid pattern */}
      <div className="tech-grid pointer-events-none absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 mt-auto mb-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-6 animate-[fade-up_0.8s_ease-out_both]">
          <Image
            src="/images/logo-light.png"
            alt="Ektarva"
            width={340}
            height={115}
            priority
            className="h-auto w-52 opacity-90 md:w-72"
          />
        </div>

        <div className="mb-3 inline-flex animate-[fade-up_0.8s_ease-out_0.2s_both] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/80">
          <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
          Live Hiring Event
        </div>

        <h1 className="mb-4 animate-[fade-up_1s_ease-out_0.3s_both] text-[clamp(2.8rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.02em] text-white">
          Pitch to{" "}
          <span className="gradient-text">Hire</span>
        </h1>

        <p className="mb-8 max-w-lg animate-[fade-up_0.8s_ease-out_0.5s_both] text-lg font-medium text-white md:text-2xl">
          For frontend developers where 20+ companies pitch.
        </p>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-primary to-transparent" />
    </section>
  );
}
