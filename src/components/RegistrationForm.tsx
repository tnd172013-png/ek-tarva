"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The UPI ID is a public receiving address (already shown to every visitor),
// so hardcoding it is safe. Env vars still win if set, e.g. to switch accounts.
const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "9158214594-3@ybl";
const UPI_PHONE = process.env.NEXT_PUBLIC_UPI_PHONE || "9158214594";
const FEE = "₹249";

const UTR_RE = /^[A-Za-z0-9-]{8,30}$/;
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  rolePreference: string;
  utr: string;
}

type FormStatus = "idle" | "processing" | "success" | "error";

export default function RegistrationForm() {
  const [form, setForm] = useState<FormData>({
    fullName: "", email: "", phone: "", linkedin: "", rolePreference: "", utr: "",
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScreenshot(e.target.files?.[0] || null);
  };

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the ID is still selectable.
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!UTR_RE.test(form.utr.trim())) {
      setStatus("error");
      setErrorMsg("The UTR / transaction ID looks invalid. Copy it from your payment app (8–30 letters and digits).");
      return;
    }
    if (!screenshot) {
      setStatus("error");
      setErrorMsg("Attach your payment screenshot.");
      return;
    }
    if (screenshot.size > MAX_SCREENSHOT_BYTES) {
      setStatus("error");
      setErrorMsg("Screenshot must be under 5 MB.");
      return;
    }

    setStatus("processing");

    try {
      const body = new window.FormData();
      body.append("fullName", form.fullName);
      body.append("email", form.email);
      body.append("phone", form.phone);
      body.append("linkedin", form.linkedin);
      body.append("rolePreference", form.rolePreference);
      body.append("utr", form.utr.trim());
      body.append("screenshot", screenshot);

      const res = await fetch("/api/register", { method: "POST", body });

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
            <h3 className="mb-2 text-2xl font-bold text-white">You&apos;re In!</h3>
            <p className="mb-6 text-white/90">
              Your registration for <strong className="text-white">Pitch to Hire</strong> is submitted. We&apos;ll verify your payment and confirm on WhatsApp within 48 hours.
            </p>
            <div className="glass rounded-xl p-5 text-left text-sm">
              <p className="text-white/90"><span className="text-white/90">Name:</span> <span className="text-white">{form.fullName}</span></p>
              <p className="text-white/90"><span className="text-white/90">Email:</span> <span className="text-white">{form.email}</span></p>
              <p className="text-white/90"><span className="text-white/90">Phone:</span> <span className="text-white">{form.phone}</span></p>
              {form.rolePreference && (
                <p className="text-white/90"><span className="text-white/90">Role:</span> <span className="text-white">{form.rolePreference}</span></p>
              )}
              <p className="text-white/90"><span className="text-white/90">UTR:</span> <span className="text-white">{form.utr}</span></p>
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
              <input type="text" id="rolePreference" name="rolePreference" required value={form.rolePreference} onChange={handleChange} className={inputClasses} placeholder="The role you want to be hired for" />
            </div>

            {/* ── Payment ── */}
            <div className="rounded-2xl border border-cobalt/30 bg-cobalt/[0.06] p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-white/90">Registration fee</p>
                <p className="text-2xl font-bold text-white">{FEE}</p>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wider text-white/60">Pay via UPI</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 select-all break-all rounded-lg bg-black/30 px-3 py-2 font-mono text-sm text-white">
                    {UPI_ID || "UPI ID not configured"}
                  </code>
                  {UPI_ID && (
                    <button
                      type="button"
                      onClick={copyUpi}
                      className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:border-cobalt/50 hover:bg-cobalt/10"
                    >
                      {copied ? "Copied!" : "Copy ID"}
                    </button>
                  )}
                </div>
                {UPI_PHONE && (
                  <p className="mt-2 text-xs text-white/60">
                    or pay to number <b className="text-white/90">{UPI_PHONE}</b>
                  </p>
                )}
              </div>

              <p className="mt-3 text-xs text-white/60">
                Pay {FEE} from any UPI app, then enter the transaction ID and attach the screenshot below. We verify every payment manually.
              </p>

              <div className="mt-4">
                <label htmlFor="utr" className="mb-1.5 block text-sm font-medium text-white/90">
                  Transaction ID / UTR <span className="text-white/90">*</span>
                </label>
                <input
                  type="text" id="utr" name="utr" required value={form.utr} onChange={handleChange}
                  minLength={8} maxLength={30}
                  className={inputClasses + " font-mono"}
                  placeholder="e.g. 415236789012"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="screenshot" className="mb-1.5 block text-sm font-medium text-white/90">
                  Payment Screenshot <span className="text-white/90">*</span>
                </label>
                <input
                  type="file" id="screenshot" name="screenshot" required
                  accept="image/*,application/pdf"
                  onChange={handleFile}
                  className="w-full cursor-pointer rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-3.5 text-sm text-white/80 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-cobalt file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
                />
                <p className="mt-1.5 text-xs text-white/50">Image or PDF, max 5 MB.</p>
              </div>
            </div>

            {status === "error" && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{errorMsg}</div>
            )}

            <button
              type="submit"
              disabled={status === "processing"}
              className="w-full rounded-xl bg-cobalt py-4 text-lg font-semibold text-white shadow-[0_0_30px_rgba(0,74,173,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,74,173,0.5)] hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "processing" ? "Submitting..." : `Submit Registration (${FEE})`}
            </button>

            <p className="text-center text-xs text-white/90">Payments are verified manually within 48 hours.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
