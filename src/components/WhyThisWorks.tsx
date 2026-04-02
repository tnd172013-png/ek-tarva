"use client";

const painPoints = ["Applying to 50+ jobs blindly", "Zero responses for weeks", "No clarity on what companies want"];
const gains = ["Direct interaction with hiring teams", "Clear expectations before applying", "Faster, more relevant opportunities"];

export default function WhyThisWorks() {
  return (
    <section className="relative bg-bg-elevated px-6 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-light-blue">The Difference</p>
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">Why This Works</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
                <svg className="h-3.5 w-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-red-400">Instead of this...</h3>
            </div>
            <ul className="space-y-3">
              {painPoints.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/50" />
                  <span className="text-sm text-text-secondary">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-emerald-400">You get this</h3>
            </div>
            <ul className="space-y-3">
              {gains.map((g) => (
                <li key={g} className="flex items-start gap-3">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-text-secondary">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
