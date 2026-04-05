"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance { open: () => void; }

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
}

type FormStatus = "idle" | "processing" | "success" | "error";

export default function RegistrationForm() {
  const [form, setForm] = useState<FormData>({
    fullName: "", email: "", phone: "", linkedin: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("processing");
    setErrorMsg("");

    try {
      await loadRazorpayScript();

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const { orderId } = await res.json();

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: 19900,
        currency: "INR",
        name: "Ektarva",
        description: "Pitch to Hire — Event Registration",
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...form,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) setStatus("success");
            else throw new Error("Verification failed");
          } catch {
            setStatus("error");
            setErrorMsg("Payment received but verification failed. Contact support.");
          }
        },
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme: { color: "#0064AD" },
        modal: { ondismiss: () => setStatus("idle") },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
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
            <p className="mb-6 text-white/70">
              Your spot for <strong className="text-white">Pitch to Hire</strong> is confirmed.
            </p>
            <div className="glass rounded-xl p-5 text-left text-sm">
              <p className="text-white/70"><span className="text-white/50">Name:</span> <span className="text-white">{form.fullName}</span></p>
              <p className="text-white/70"><span className="text-white/50">Email:</span> <span className="text-white">{form.email}</span></p>
              <p className="mt-4 text-xs text-white/50">
                We&apos;ll share the event link and details closer to the date. Screenshot this page for your records.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const inputClasses =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:border-cobalt/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(0,74,173,0.15)]";

  return (
    <section id="register" className="relative bg-bg-primary px-6 py-16 md:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 40% 50% at 50% 60%, rgba(0,74,173,0.08), transparent)" }}
      />

      <div className="relative z-10 mx-auto max-w-lg">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/70">Register</p>
          <h2 className="mb-3 text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">
            Secure Your Spot
          </h2>
          <p className="text-white/60">If you&apos;re serious about getting hired, this is for you.</p>
        </div>

        <div className="glass-elevated rounded-3xl p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-white/80">
                Full Name <span className="text-white/40">*</span>
              </label>
              <input type="text" id="fullName" name="fullName" required value={form.fullName} onChange={handleChange} className={inputClasses} placeholder="Your full name" />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/80">
                Email <span className="text-white/40">*</span>
              </label>
              <input type="email" id="email" name="email" required value={form.email} onChange={handleChange} className={inputClasses} placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-white/80">
                Phone Number <span className="text-white/40">*</span>
              </label>
              <input type="tel" id="phone" name="phone" required value={form.phone} onChange={handleChange} className={inputClasses} placeholder="Your phone number" />
            </div>

            <div>
              <label htmlFor="linkedin" className="mb-1.5 block text-sm font-medium text-white/80">
                LinkedIn Profile URL
              </label>
              <input type="url" id="linkedin" name="linkedin" value={form.linkedin} onChange={handleChange} className={inputClasses} placeholder="https://linkedin.com/in/yourname" />
            </div>

            {status === "error" && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{errorMsg}</div>
            )}

            <button
              type="submit"
              disabled={status === "processing"}
              className="w-full rounded-xl bg-cobalt py-4 text-lg font-semibold text-white shadow-[0_0_30px_rgba(0,74,173,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,74,173,0.5)] hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "processing" ? "Processing..." : "Proceed to Payment (₹199)"}
            </button>

            <p className="text-center text-xs text-white/40">Secure payment powered by Razorpay</p>
          </form>
        </div>
      </div>
    </section>
  );
}
