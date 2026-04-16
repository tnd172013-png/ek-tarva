"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const details = [
  { icon: "🖥", label: "Mode", value: "Online (Live)" },
  { icon: "⏱", label: "Duration", value: "2-3 Hours" },
  { icon: "🏢", label: "Companies", value: "20+ Hiring Teams" },
  { icon: "🎟", label: "Access Fee", value: "₹199" },
];

export default function EventDetails() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = headingRef.current?.querySelectorAll(".word");
      if (words) {
        gsap.fromTo(words, { opacity: 0, y: 15 }, {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
        });
      }

      const cards = gridRef.current?.children;
      if (cards) {
        gsap.fromTo(cards, { opacity: 0, y: 25, scale: 0.95 }, {
          opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.4)",
          scrollTrigger: { trigger: gridRef.current, start: "top 82%" },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-bg-primary px-6 py-16 md:py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="mx-auto max-w-4xl">
        <div ref={headingRef} className="mb-3 text-center">
          <p className="word mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/70">Details</p>
          {"Event Details".split(" ").map((w, i) => (
            <span key={i} className="word inline-block mb-3 text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">
              {w}{i < 1 ? "\u00A0" : ""}
            </span>
          ))}
          <div className="word mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            April 20, 2026 · 5:30 PM IST
          </div>
        </div>

        <div ref={gridRef} className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {details.map((d) => (
            <div key={d.label} className="glass group flex flex-col items-center rounded-2xl p-5 text-center transition-all duration-300 hover:bg-white/[0.06]" style={{ opacity: 0 }}>
              <span className="mb-2 text-xl">{d.icon}</span>
              <span className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">{d.label}</span>
              <span className="text-base font-bold text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
