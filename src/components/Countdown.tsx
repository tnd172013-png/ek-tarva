"use client";

import { useState, useEffect } from "react";

const TARGET_DATE = new Date("2026-04-10T00:00:00+05:30").getTime();

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

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return (
      <section className="relative bg-bg-primary px-6 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            Event Starts In
          </p>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
              <div key={label} className="text-center">
                <div className="glass flex h-20 w-20 items-center justify-center rounded-2xl md:h-24 md:w-24">
                  <span className="text-3xl font-bold text-white md:text-4xl">--</span>
                </div>
                <span className="mt-2 block text-[10px] uppercase tracking-[0.15em] text-white/50">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <section className="relative bg-bg-primary px-6 py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
          Event Starts In
        </p>
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {units.map((unit) => (
            <div key={unit.label} className="text-center">
              <div className="glass flex h-20 w-20 items-center justify-center rounded-2xl md:h-24 md:w-24">
                <span className="text-3xl font-bold text-white md:text-4xl">
                  {String(unit.value).padStart(2, "0")}
                </span>
              </div>
              <span className="mt-2 block text-[10px] uppercase tracking-[0.15em] text-white/50">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
