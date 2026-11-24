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
              {w}{i < 2 ? " " : ""}
            </span>
          ))}
          <p className="word mt-3 text-white/90">If you&apos;re serious about getting hired, this is for you.</p>
        </div>

        <div ref={formRef} className="glass-elevated rounded-3xl p-8 md:p-10" style={{ opacity: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">About you</p>
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-white/90">
                Full Name <span className="text-white/90">*</span>
              </label>
              <input type="text" id="fullName" name="fullName" autoComplete="name" required value={form.fullName} onChange={handleChange} className={inputClasses} placeholder="Your full name" />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/90">
                Email <span className="text-white/90">*</span>
              </label>
              <input type="email" id="email" name="email" autoComplete="email" inputMode="email" required value={form.email} onChange={handleChange} className={inputClasses} placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-white/90">
                Phone Number <span className="text-white/90">*</span>
              </label>
              <input type="tel" id="phone" name="phone" autoComplete="tel" inputMode="tel" required value={form.phone} onChange={handleChange} className={inputClasses} placeholder="10-digit mobile number" />
              <p className="mt-1.5 text-xs text-white/60">We share event details on WhatsApp, so use your WhatsApp number.</p>
            </div>

            <div>
              <label htmlFor="linkedin" className="mb-1.5 block text-sm font-medium text-white/90">
                LinkedIn Profile URL <span className="text-xs text-white/50">(optional)</span>
              </label>
              <input type="url" id="linkedin" name="linkedin" autoComplete="url" value={form.linkedin} onChange={handleChange} className={inputClasses} placeholder="https://linkedin.com/in/yourname" />
            </div>

            <p className="pt-2 text-xs font-medium uppercase tracking-[0.18em] text-white/50">Your college</p>
            <div>
              <label htmlFor="collegeName" className="mb-1.5 block text-sm font-medium text-white/90">
                College Name <span className="text-white/90">*</span>
              </label>
              <input type="text" id="collegeName" name="collegeName" autoComplete="organization" required value={form.collegeName} onChange={handleChange} className={inputClasses} placeholder="Your college name" />
            </div>

            <div>
              <label htmlFor="courseYear" className="mb-1.5 block text-sm font-medium text-white/90">
                Course &amp; Year <span className="text-white/90">*</span>
              </label>
              <input type="text" id="courseYear" name="courseYear" required value={form.courseYear} onChange={handleChange} className={inputClasses} placeholder="e.g. BBA - 2nd year" />
            </div>

            <p className="pt-2 text-xs font-medium uppercase tracking-[0.18em] text-white/50">What you are looking for</p>
            <div>
              <label id="recruitmentTypeLabel" className="mb-1.5 block text-sm font-medium text-white/90">
                Recruitment Type <span className="text-white/90">*</span>
              </label>
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
                      className={`rounded-xl border px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                        active
                          ? "border-cobalt bg-cobalt/20 text-white shadow-[0_0_20px_rgba(0,74,173,0.25)]"
                          : "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/30"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="rolePreference" className="mb-1.5 block text-sm font-medium text-white/90">
                Role Preference <span className="text-white/90">*</span>
              </label>
              <input type="text" id="rolePreference" name="rolePreference" list="role-options" required value={form.rolePreference} onChange={handleChange} className={inputClasses} placeholder="Pick one or type your own" />
              <datalist id="role-options">
                {ROLES.map((r) => <option key={r} value={r} />)}
              </datalist>
            </div>

            {/* ── Payment ── */}
            <div className="rounded-2xl border border-cobalt/30 bg-cobalt/[0.06] p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-white/90">Registration fee</p>
                <p className="text-2xl font-bold text-white">{FEE}</p>
              </div>

              <p className="mt-3 text-xs text-white/60">
                You pay securely on the next step with UPI, card or net banking, powered by Razorpay.
              </p>
            </div>

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

            <p className="text-center text-xs text-white/90">Your spot is confirmed as soon as the payment goes through.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
