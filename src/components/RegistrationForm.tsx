"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ROLES } from "@/lib/roles";

gsap.registerPlugin(ScrollTrigger);

const RAZORPAY_PAYMENT_LINK = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK || "";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  rolePreference: string;
}

type FormStatus = "idle" | "processing" | "success" | "error";

export default function RegistrationForm() {
  const [form, setForm] = useState<FormData>({
    fullName: "", email: "", phone: "", linkedin: "", rolePreference: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = headingRef.current?.querySelectorAll(".word");
      if (words) {
        gsap.fromTo(words, { opacity: 0, y: 15 }, {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
        });
      }

      gsap.fromTo(formRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: formRef.current, start: "top 85%" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("processing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <section id="register" className="bg-bg-primary px-6 py-16 md:py-20">
        <div className="mx-auto max-w-lg">
          <div className="glass-elevated rounded-3xl border border-emerald-500/20 p-10 text-center shadow-[0_0_60px_rgba(16,185,129,0.1)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">Almost There!</h3>
            <p className="mb-6 text-white/90">
              Your details are saved. Complete payment to confirm your spot at <strong className="text-white">Pitch to Hire</strong>.
            </p>
            <div className="glass rounded-xl p-5 text-left text-sm">
              <p className="text-white/90"><span className="text-white/90">Name:</span> <span className="text-white">{form.fullName}</span></p>
              <p className="text-white/90"><span className="text-white/90">Email:</span> <span className="text-white">{form.email}</span></p>
              <p className="text-white/90"><span className="text-white/90">Phone:</span> <span className="text-white">{form.phone}</span></p>
              {form.rolePreference && (
                <p className="text-white/90"><span className="text-white/90">Role:</span> <span className="text-white">{form.rolePreference}</span></p>
              )}
            </div>
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-left text-sm">
              <p className="font-medium text-amber-400">Important</p>
              <p className="mt-1 text-amber-200/70">
                Use the <strong className="text-amber-300">same email &amp; phone number</strong> while making the payment. We verify your registration against your payment details.
              </p>
            </div>
            {RAZORPAY_PAYMENT_LINK && (
              <a
                href={RAZORPAY_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block w-full rounded-xl bg-cobalt py-4 text-center text-lg font-semibold text-white shadow-[0_0_30px_rgba(0,74,173,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,74,173,0.5)] hover:scale-[1.01]"
              >
                Pay ₹199 Now
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  const inputClasses =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-white placeholder:text-white/90 outline-none transition-all duration-300 focus:border-cobalt/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(0,74,173,0.15)]";

  return (
    <section ref={sectionRef} id="register" className="relative bg-bg-primary px-6 py-16 md:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 40% 50% at 50% 60%, rgba(0,74,173,0.08), transparent)" }}
      />

      <div className="relative z-10 mx-auto max-w-lg">
        <div ref={headingRef} className="mb-10 text-center">
          <p className="word mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/90">Register</p>
          {"Secure Your Spot".split(" ").map((w, i) => (
            <span key={i} className="word inline-block text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">
              {w}{i < 2 ? "\u00A0" : ""}
            </span>
          ))}
          <p className="word mt-3 text-white/90">If you&apos;re serious about getting hired, this is for you.</p>
        </div>

        <div ref={formRef} className="glass-elevated rounded-3xl p-8 md:p-10" style={{ opacity: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-white/90">
                Full Name <span className="text-white/90">*</span>
              </label>
              <input type="text" id="fullName" name="fullName" required value={form.fullName} onChange={handleChange} className={inputClasses} placeholder="Your full name" />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/90">
                Email <span className="text-white/90">*</span>
              </label>
              <input type="email" id="email" name="email" required value={form.email} onChange={handleChange} className={inputClasses} placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-white/90">
                Phone Number <span className="text-white/90">*</span>
              </label>
              <input type="tel" id="phone" name="phone" required value={form.phone} onChange={handleChange} className={inputClasses} placeholder="Your phone number" />
            </div>

            <div>
              <label htmlFor="linkedin" className="mb-1.5 block text-sm font-medium text-white/90">
                LinkedIn Profile URL
              </label>
              <input type="url" id="linkedin" name="linkedin" value={form.linkedin} onChange={handleChange} className={inputClasses} placeholder="https://linkedin.com/in/yourname" />
            </div>

            <div>
              <label htmlFor="rolePreference" className="mb-1.5 block text-sm font-medium text-white/90">
                Role Preference <span className="text-white/90">*</span>
              </label>
              <select
                id="rolePreference"
                name="rolePreference"
                required
                value={form.rolePreference}
                onChange={handleChange}
                className={`${inputClasses} ${form.rolePreference ? "" : "text-white/50"}`}
              >
                <option value="" disabled className="text-bg-primary">
                  Select the role you want to be hired for
                </option>
                {ROLES.map((role) => (
                  <option key={role} value={role} className="text-bg-primary">
                    {role}
                  </option>
                ))}
                <option value="Other" className="text-bg-primary">
                  Other
                </option>
              </select>
            </div>

            {status === "error" && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{errorMsg}</div>
            )}

            <button
              type="submit"
              disabled={status === "processing"}
              className="w-full rounded-xl bg-cobalt py-4 text-lg font-semibold text-white shadow-[0_0_30px_rgba(0,74,173,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,74,173,0.5)] hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "processing" ? "Registering..." : "Register & Pay (₹199)"}
            </button>

            <p className="text-center text-xs text-white/90">Secure payment powered by Razorpay</p>
          </form>
        </div>
      </div>
    </section>
  );
}
