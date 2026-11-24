"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ROLES } from "@/lib/roles";

gsap.registerPlugin(ScrollTrigger);

const FEE = "₹249";
const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (r: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}
interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", cb: (r: { error?: { description?: string } }) => void) => void;
}
declare global {
  interface Window {
    Razorpay?: new (o: RazorpayOptions) => RazorpayInstance;
  }
}

function loadCheckout(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const el = document.createElement("script");
    el.src = CHECKOUT_SRC;
    el.onload = () => resolve(true);
    el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  rolePreference: string;
  collegeName: string;
  courseYear: string;
  recruitmentType: string;
}

const RECRUITMENT_TYPES = ["Full Time Job", "Internship"] as const;

/** Accepts 10-digit Indian mobiles, with or without +91 / 0 and spaces or dashes. */
function cleanPhone(raw: string): string | null {
  const d = raw.replace(/[\s-]/g, "").replace(/^(\+?91|0)/, "");
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

type FormStatus = "idle" | "processing" | "success" | "error";

export default function RegistrationForm() {
  const [form, setForm] = useState<FormData>({
    fullName: "", email: "", phone: "", linkedin: "", rolePreference: "", collegeName: "", courseYear: "", recruitmentType: "",
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
    setErrorMsg("");

    const phone = cleanPhone(form.phone);
    if (!phone) {
      setStatus("error");
      setErrorMsg("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!form.recruitmentType) {
      setStatus("error");
      setErrorMsg("Choose whether you are looking for a full time job or an internship.");
      return;
    }
    setStatus("processing");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Registration failed");

      if (!(await loadCheckout()) || !window.Razorpay) {
        throw new Error("Could not load the payment window. Check your connection and try again.");
      }

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: "Ektarva",
          description: "Pitch to Hire registration",
          prefill: { name: form.fullName, email: form.email, contact: form.phone },
          theme: { color: "#0064AD" },
          handler: async (r) => {
            try {
              const v = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(r),
              });
              if (!v.ok) throw new Error((await v.json()).error || "Payment could not be verified.");
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment was not completed. You can try again.")) },
        });
        rzp.on("payment.failed", (r) => {
          reject(new Error(r.error?.description || "Payment failed. Please try again."));
        });
        rzp.open();
      });

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
            <h3 className="mb-2 text-2xl font-bold text-white">You&apos;re In!</h3>
            <p className="mb-6 text-white/90">
              Payment received. Your registration for <strong className="text-white">Pitch to Hire</strong> is confirmed. We&apos;ll share the details on WhatsApp.
            </p>
            <div className="glass rounded-xl p-5 text-left text-sm">
              <p className="text-white/90"><span className="text-white/90">Name:</span> <span className="text-white">{form.fullName}</span></p>
              <p className="text-white/90"><span className="text-white/90">Email:</span> <span className="text-white">{form.email}</span></p>
              <p className="text-white/90"><span className="text-white/90">Phone:</span> <span className="text-white">{form.phone}</span></p>
              <p className="text-white/90"><span className="text-white/90">College:</span> <span className="text-white">{form.collegeName}</span></p>
              <p className="text-white/90"><span className="text-white/90">Course:</span> <span className="text-white">{form.courseYear}</span></p>
              <p className="text-white/90"><span className="text-white/90">Looking for:</span> <span className="text-white">{form.recruitmentType}</span></p>
              {form.rolePreference && (
                <p className="text-white/90"><span className="text-white/90">Role:</span> <span className="text-white">{form.rolePreference}</span></p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const inputClasses =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:border-cobalt/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(0,74,173,0.15)]";

  const label = "mb-1.5 block text-sm font-medium text-white/90";
  const sectionTitle = (n: number, text: string) => (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cobalt/20 text-xs font-semibold text-white ring-1 ring-cobalt/40">{n}</span>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/80">{text}</p>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );

  return (
    <section ref={sectionRef} id="register" className="relative bg-bg-primary px-6 py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 50% 50% at 25% 40%, rgba(0,74,173,0.12), transparent)" }}
      />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14">
        {/* ── Left: pitch + fee ── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div ref={headingRef}>
            <p className="word mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/90">Register</p>
            <h2 className="mb-4 text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
              {"Secure Your Spot".split(" ").map((w, i) => (
                <span key={i} className="word inline-block">{w}{i < 2 ? " " : ""}</span>
              ))}
            </h2>
            <p className="word max-w-md text-white/80">If you&apos;re serious about getting hired, this is for you.</p>
          </div>

          <ul className="mt-8 space-y-4">
            {[
              ["Live pitches", "20+ companies pitch their openings to you, one by one."],
              ["You choose", "Hear the role, tech stack and expectations, then pick where to apply."],
              ["Details on WhatsApp", "We message the joining details to the number you give."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-none text-cobalt-light" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-white/70"><span className="font-semibold text-white">{t}.</span> {d}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl border border-cobalt/30 bg-cobalt/[0.07] p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium text-white/90">Registration fee</p>
              <p className="text-3xl font-bold text-white">{FEE}</p>
            </div>
            <p className="mt-2 text-xs text-white/60">
              One-time. You pay securely on the next step with UPI, card or net banking, powered by Razorpay.
            </p>
          </div>
        </aside>

        {/* ── Right: form ── */}
        <div ref={formRef} className="glass-elevated rounded-3xl p-6 sm:p-8 md:p-10" style={{ opacity: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-9">
            <fieldset>
              {sectionTitle(1, "About you")}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className={label}>Full Name <span className="text-white/90">*</span></label>
                  <input type="text" id="fullName" name="fullName" autoComplete="name" required value={form.fullName} onChange={handleChange} className={inputClasses} placeholder="Your full name" />
                </div>
                <div>
                  <label htmlFor="email" className={label}>Email <span className="text-white/90">*</span></label>
                  <input type="email" id="email" name="email" autoComplete="email" inputMode="email" required value={form.email} onChange={handleChange} className={inputClasses} placeholder="you@example.com" />
                </div>
                <div>
                  <label htmlFor="phone" className={label}>WhatsApp Number <span className="text-white/90">*</span></label>
                  <input type="tel" id="phone" name="phone" autoComplete="tel" inputMode="tel" required value={form.phone} onChange={handleChange} className={inputClasses} placeholder="10-digit mobile number" />
                </div>
                <div>
                  <label htmlFor="linkedin" className={label}>LinkedIn Profile <span className="text-xs text-white/50">(optional)</span></label>
                  <input type="url" id="linkedin" name="linkedin" autoComplete="url" value={form.linkedin} onChange={handleChange} className={inputClasses} placeholder="https://linkedin.com/in/yourname" />
                </div>
              </div>
            </fieldset>

            <fieldset>
              {sectionTitle(2, "Your college")}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="collegeName" className={label}>College Name <span className="text-white/90">*</span></label>
                  <input type="text" id="collegeName" name="collegeName" autoComplete="organization" required value={form.collegeName} onChange={handleChange} className={inputClasses} placeholder="Your college name" />
                </div>
                <div>
                  <label htmlFor="courseYear" className={label}>Course &amp; Year <span className="text-white/90">*</span></label>
                  <input type="text" id="courseYear" name="courseYear" required value={form.courseYear} onChange={handleChange} className={inputClasses} placeholder="e.g. BBA - 2nd year" />
                </div>
              </div>
            </fieldset>

            <fieldset>
              {sectionTitle(3, "What you are looking for")}
              <div className="space-y-5">
                <div>
                  <label id="recruitmentTypeLabel" className={label}>Recruitment Type <span className="text-white/90">*</span></label>
                  <div role="radiogroup" aria-labelledby="recruitmentTypeLabel" className="grid grid-cols-2 gap-3">
                    {RECRUITMENT_TYPES.map((t) => {
                      const active = form.recruitmentType === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setForm((prev) => ({ ...prev, recruitmentType: t }))}
                          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                            active
                              ? "border-cobalt bg-cobalt/20 text-white shadow-[0_0_20px_rgba(0,74,173,0.25)]"
                              : "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/30"
                          }`}
                        >
                          <span className={`h-3.5 w-3.5 rounded-full border ${active ? "border-cobalt-light bg-cobalt-light" : "border-white/30"}`} aria-hidden="true" />
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label htmlFor="rolePreference" className={label}>Role Preference <span className="text-white/90">*</span></label>
                  <input type="text" id="rolePreference" name="rolePreference" list="role-options" required value={form.rolePreference} onChange={handleChange} className={inputClasses} placeholder="Pick one or type your own" />
                  <datalist id="role-options">
                    {ROLES.map((r) => <option key={r} value={r} />)}
                  </datalist>
                </div>
              </div>
            </fieldset>

            <div className="space-y-4">
              {status === "error" && (
                <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{errorMsg}</div>
              )}

              <button
                type="submit"
                disabled={status === "processing"}
                className="w-full rounded-xl bg-cobalt py-4 text-lg font-semibold text-white shadow-[0_0_30px_rgba(0,74,173,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,74,173,0.5)] hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "processing" ? "Opening payment..." : `Pay ${FEE} & Register`}
              </button>

              <p className="text-center text-xs text-white/70">Your spot is confirmed as soon as the payment goes through.</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
