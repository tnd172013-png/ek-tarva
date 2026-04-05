"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entry timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(logoRef.current, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1 })
        .fromTo(badgeRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
        .fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9 }, "-=0.4")
        .fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.3");

      // Parallax — content moves up as you scroll past
      gsap.to(contentRef.current, {
        y: -80,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-bg-primary px-6 pt-12 pb-10 md:pt-16"
    >
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
      <div ref={contentRef} className="relative z-10 mt-auto mb-auto flex max-w-4xl flex-col items-center text-center">
        <div ref={logoRef} className="mb-6" style={{ opacity: 0 }}>
          <Image
            src="/images/logo-light.png"
            alt="Ektarva"
            width={340}
            height={115}
            priority
            className="h-auto w-52 opacity-90 md:w-72"
          />
        </div>

        <div
          ref={badgeRef}
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/80"
          style={{ opacity: 0 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
          Live Hiring Event
        </div>

        <h1
          ref={headingRef}
          className="mb-4 text-[clamp(2.8rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.02em] text-white"
          style={{ opacity: 0 }}
        >
          Pitch to{" "}
          <span className="gradient-text">Hire</span>
        </h1>

        <p
          ref={subRef}
          className="mb-8 max-w-lg text-lg font-medium text-white md:text-2xl"
          style={{ opacity: 0 }}
        >
          For frontend developers where 20+ companies pitch.
        </p>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-primary to-transparent" />
    </section>
  );
}
