"use client";

const items = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    title: "The Role",
    desc: "What the position actually involves day-to-day",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "The Expectations",
    desc: "Clear requirements — no hidden surprises",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: "The Tech Stack",
    desc: "Exact technologies you'll work with",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: "What They Want",
    desc: "What they're actually looking for in a candidate",
  },
];

export default function WhatIsPitchToHire() {
  return (
    <section className="relative bg-bg-primary px-6 py-16 md:py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-cobalt/40 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-cobalt">The Concept</p>
          <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">
            What is Pitch to Hire?
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-text-secondary md:text-base">
            A live hiring experience where companies don&apos;t just post jobs —
            they <span className="font-semibold text-light-blue">pitch them</span>.
            You&apos;ll hear directly from hiring teams about:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="glass group rounded-2xl p-5 text-center transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(0,74,173,0.15)]"
              style={{ animation: `fade-up 0.6s ease-out ${0.1 * i}s both` }}
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cobalt/10 text-cobalt transition-all duration-300 group-hover:bg-cobalt group-hover:text-white group-hover:shadow-[0_0_20px_rgba(0,74,173,0.4)]">
                {item.icon}
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-white">{item.title}</h3>
              <p className="text-xs leading-relaxed text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-text-secondary md:text-base">
          No guessing. No endless applying.
          <br />
          <span className="font-semibold text-white">Just clarity — and opportunity.</span>
        </p>
      </div>
    </section>
  );
}
