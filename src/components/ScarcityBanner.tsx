"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScarcityBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = contentRef.current?.children;
      if (els) {
        gsap.fromTo(els, { opacity: 0, y: 25 }, {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden px-6 py-14">
      <div className="absolute inset-0 bg-bg-elevated" />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,74,173,0.15), transparent)" }} />

      <div ref={contentRef} className="relative z-10 mx-auto max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-amber-400" style={{ opacity: 0 }}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          Limited Availability
        </div>

        <h3 className="mb-3 text-xl font-bold text-white md:text-2xl" style={{ opacity: 0 }}>Registrations are limited.</h3>
        <p className="mb-8 text-sm text-white/60" style={{ opacity: 0 }}>
          To keep the experience focused and valuable, once it&apos;s full, entries are closed.
        </p>

        <a
          href="#register"
          className="group relative inline-flex items-center gap-3 rounded-full bg-cobalt px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.03]"
          style={{ opacity: 0, animation: "none" }}
        >
          <span>Secure Your Spot Now</span>
          <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
