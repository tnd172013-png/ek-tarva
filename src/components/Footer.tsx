"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = contentRef.current?.children;
      if (els) {
        gsap.fromTo(els, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 90%" },
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative border-t border-white/5 bg-bg-primary px-6 py-14">
      <div ref={contentRef} className="mx-auto max-w-4xl text-center">
        <Image
          src="/images/logo-light.png"
          alt="Ektarva"
          width={120}
          height={40}
          className="mx-auto mb-3 h-auto w-24 opacity-50"
          style={{ opacity: 0 }}
        />
        <p className="mb-8 text-sm italic text-white/40" style={{ opacity: 0 }}>
          One Root, Many Branches
        </p>

        <div className="mb-8 flex items-center justify-center gap-8" style={{ opacity: 0 }}>
          <a
            href="mailto:hello@ektarva.com"
            className="text-sm text-white/50 transition-colors duration-300 hover:text-white"
          >
            Contact
          </a>
          <a
            href="https://www.instagram.com/ektarvaa?igsh=NmR0eTQ5dHJ6eHl6"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/50 transition-colors duration-300 hover:text-white"
          >
            Instagram
          </a>
          <a
            href="https://linkedin.com/company/ektarva"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/50 transition-colors duration-300 hover:text-white"
          >
            LinkedIn
          </a>
        </div>

        <p className="text-xs text-white/40" style={{ opacity: 0 }}>
          &copy; {new Date().getFullYear()} Ektarva. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
