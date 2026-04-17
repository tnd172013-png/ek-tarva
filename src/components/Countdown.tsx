"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TARGET_DATE = new Date("2026-04-20T17:30:00+05:30").getTime();

function getTimeLeft() {
  const now = Date.now();
  const diff = TARGET_DATE - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown() {
  const [time, setTime] = useState(getTimeLeft);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const boxesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(labelRef.current, { opacity: 0, y: 15 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
      });

      const boxes = boxesRef.current?.children;
      if (boxes) {
        gsap.fromTo(boxes, { opacity: 0, y: 30, scale: 0.9 }, {
          opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.4)",
          scrollTrigger: { trigger: boxesRef.current, start: "top 85%" },
          delay: 0.15,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const units = [
    { label: "Days", value: mounted ? time.days : null },
    { label: "Hours", value: mounted ? time.hours : null },
    { label: "Minutes", value: mounted ? time.minutes : null },
    { label: "Seconds", value: mounted ? time.seconds : null },
  ];

  return (
    <section ref={sectionRef} className="relative bg-bg-primary px-6 py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p ref={labelRef} className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-white" style={{ opacity: 0 }}>
          Event Starts In
        </p>
        <div ref={boxesRef} className="flex items-center justify-center gap-4 md:gap-8">
          {units.map((unit) => (
            <div key={unit.label} className="text-center" style={{ opacity: 0 }}>
              <div className="glass flex h-20 w-20 items-center justify-center rounded-2xl md:h-24 md:w-24">
                <span className="text-3xl font-bold text-white md:text-4xl">
                  {unit.value !== null ? String(unit.value).padStart(2, "0") : "--"}
                </span>
              </div>
              <span className="mt-2 block text-[10px] uppercase tracking-[0.15em] text-white/90">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
