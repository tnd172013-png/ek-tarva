"use client";

const audiences = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
    title: "Frontend Developers",
    desc: "Students, freshers, and early-stage developers looking for their first or next opportunity.",
    tag: "Students & Freshers",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: "Portfolio-Ready Devs",
    desc: "You've built projects and have a portfolio or GitHub — now you need the right company to see it.",
    tag: "Show Your Work",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    title: "Tired of Ghosting?",
    desc: "Applied to 50+ jobs and never heard back? Get direct, real-time access to hiring teams.",
    tag: "No More Silence",
  },
];

export default function WhoIsThisFor() {
  return (
    <section className="relative bg-bg-primary px-6 py-16 md:py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-cobalt">For You</p>
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">Who This Is For</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {audiences.map((item, i) => (
            <div key={item.title} className="glass group rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_40px_rgba(0,74,173,0.1)]" style={{ animation: `fade-up 0.6s ease-out ${0.15 * i}s both` }}>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cobalt/10 text-cobalt transition-all duration-300 group-hover:bg-cobalt group-hover:text-white group-hover:shadow-[0_0_20px_rgba(0,74,173,0.4)]">
                {item.icon}
              </div>
              <div className="mb-2 inline-block rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted">{item.tag}</div>
              <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-xs leading-relaxed text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
