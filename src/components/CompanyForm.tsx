"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ROLES = [
  "Frontend Developer",
  "Business Development Manager",
  "Full Stack Developer",
  "Graphic Designer",
  "Cyber Security Engineer",
  "Video Editor",
  "Data Analyst",
  "Social Media Manager",
  "AI Engineer",
  "Founder's Office",
];

type RoleRow = { count: string; package: string; skills: string };

type FormData = {
  companyName: string;
  contactName: string;
  location: string;
  teamFullTime: string;
  teamPartTime: string;
  teamFreelance: string;
  mobile: string;
  email: string;
  roles: Record<string, RoleRow>;
  hireOtherDomain: boolean;
  otherDomainName: string;
  otherDomainCount: string;
  otherDomainPackage: string;
  hireInterns: boolean;
  internDomain: string;
  internCount: string;
  internStipend: string;
  internDuration: string;
  notes: string;
};

type Status = "idle" | "processing" | "success" | "error";

const emptyRole: RoleRow = { count: "", package: "", skills: "" };

const initialForm: FormData = {
  companyName: "",
  contactName: "",
  location: "",
  teamFullTime: "",
  teamPartTime: "",
  teamFreelance: "",
  mobile: "",
  email: "",
  roles: Object.fromEntries(ROLES.map((r) => [r, { ...emptyRole }])),
  hireOtherDomain: false,
  otherDomainName: "",
  otherDomainCount: "",
  otherDomainPackage: "",
  hireInterns: false,
  internDomain: "",
  internCount: "",
  internStipend: "",
  internDuration: "",
  notes: "",
};

export default function CompanyForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: cardRef.current, start: "top 85%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateRole = (role: string, field: keyof RoleRow, value: string) =>
    setForm((prev) => ({
      ...prev,
      roles: { ...prev.roles, [role]: { ...prev.roles[role], [field]: value } },
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("processing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/company-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }

      setStatus("success");
      setForm(initialForm);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <section className="bg-bg-primary px-6 py-20">
        <div className="mx-auto max-w-lg">
          <div className="glass-elevated rounded-3xl border border-emerald-500/20 p-10 text-center shadow-[0_0_60px_rgba(16,185,129,0.1)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">Thanks for pitching!</h3>
            <p className="mb-6 text-white/70">
              Your company details are in. Our team will reach out with next steps for the event.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="text-sm text-white/60 underline underline-offset-4 hover:text-white"
            >
              Submit another response
            </button>
          </div>
        </div>
      </section>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:border-cobalt/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(0,74,173,0.15)]";

  const labelClass = "mb-1.5 block text-sm font-medium text-white/80";

  const sectionTitle = (num: string, title: string) => (
    <div className="mb-6 flex items-baseline gap-3 border-b border-white/10 pb-3">
      <span className="font-mono text-xs text-white/40">{num}</span>
      <h3 className="text-xl font-bold text-white md:text-2xl">{title}</h3>
    </div>
  );

  return (
    <section ref={sectionRef} className="relative bg-bg-primary px-6 py-14 md:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,74,173,0.1), transparent)" }}
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/60">For Companies</p>
          <h2 className="mb-3 text-3xl font-bold text-white md:text-5xl">
            Pitch Your <span className="gradient-text">Openings</span>
          </h2>
          <p className="mx-auto max-w-xl text-white/60">
            Tell us who you&apos;re hiring. We&apos;ll line you up with the right developers at the event.
          </p>
        </div>

        <div ref={cardRef} className="glass-elevated rounded-3xl p-6 md:p-10" style={{ opacity: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-12">

            {/* Section 1 — Company */}
            <div>
              {sectionTitle("01", "Company Details")}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Company Name *</label>
                  <input required value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className={inputClass} placeholder="Acme Inc." />
                </div>
                <div>
                  <label className={labelClass}>Founder / HR / Point of Contact *</label>
                  <input required value={form.contactName} onChange={(e) => update("contactName", e.target.value)} className={inputClass} placeholder="Full name" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Location *</label>
                  <input required value={form.location} onChange={(e) => update("location", e.target.value)} className={inputClass} placeholder="e.g. Pune, Mumbai" />
                </div>
              </div>

              <div className="mt-6">
                <p className={labelClass}>Current Team Size</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-white/60">Full Time</label>
                    <input type="number" min="0" value={form.teamFullTime} onChange={(e) => update("teamFullTime", e.target.value)} className={inputClass} placeholder="0" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-white/60">Part Time / Interns</label>
                    <input type="number" min="0" value={form.teamPartTime} onChange={(e) => update("teamPartTime", e.target.value)} className={inputClass} placeholder="0" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-white/60">Freelancing</label>
                    <input type="number" min="0" value={form.teamFreelance} onChange={(e) => update("teamFreelance", e.target.value)} className={inputClass} placeholder="0" />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Mobile Number *</label>
                  <input required type="tel" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} className={inputClass} placeholder="+91 ..." />
                </div>
                <div>
                  <label className={labelClass}>Email ID *</label>
                  <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="contact@company.com" />
                </div>
              </div>
            </div>

            {/* Section 2 — Role pitch */}
            <div>
              {sectionTitle("02", "Current Pitch for Role")}
              <p className="mb-4 text-sm text-white/50">
                Fill rows only for the roles you&apos;re hiring. Leave the rest blank.
              </p>

              <div className="-mx-6 overflow-x-auto md:mx-0">
                <div className="inline-block min-w-full align-middle px-6 md:px-0">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-white/50">
                        <th className="py-2 pr-4 font-medium">Role</th>
                        <th className="py-2 pr-3 font-medium">No. of People</th>
                        <th className="py-2 pr-3 font-medium">Package (range)</th>
                        <th className="py-2 font-medium">Skills Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROLES.map((role) => (
                        <tr key={role} className="border-t border-white/5">
                          <td className="py-2 pr-4 font-medium text-white/90">{role}</td>
                          <td className="py-2 pr-3">
                            <input type="number" min="0" value={form.roles[role].count} onChange={(e) => updateRole(role, "count", e.target.value)} className={inputClass + " !py-2 !px-3 w-24"} placeholder="0" />
                          </td>
                          <td className="py-2 pr-3">
                            <input value={form.roles[role].package} onChange={(e) => updateRole(role, "package", e.target.value)} className={inputClass + " !py-2 !px-3 w-40"} placeholder="e.g. 6-10 LPA" />
                          </td>
                          <td className="py-2">
                            <input value={form.roles[role].skills} onChange={(e) => updateRole(role, "skills", e.target.value)} className={inputClass + " !py-2 !px-3 w-64"} placeholder="React, TypeScript..." />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Section 3 — Other domain */}
            <div>
              {sectionTitle("03", "Any Other Domain You're Hiring?")}
              <label className="flex items-center gap-3 text-white/80">
                <input type="checkbox" checked={form.hireOtherDomain} onChange={(e) => update("hireOtherDomain", e.target.checked)} className="h-4 w-4 accent-cobalt" />
                Yes, we&apos;re hiring for another domain
              </label>

              {form.hireOtherDomain && (
                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  <div>
                    <label className={labelClass}>Domain</label>
                    <input value={form.otherDomainName} onChange={(e) => update("otherDomainName", e.target.value)} className={inputClass} placeholder="e.g. Product Management" />
                  </div>
                  <div>
                    <label className={labelClass}>No. of Hiring</label>
                    <input type="number" min="0" value={form.otherDomainCount} onChange={(e) => update("otherDomainCount", e.target.value)} className={inputClass} placeholder="0" />
                  </div>
                  <div>
                    <label className={labelClass}>Package (range)</label>
                    <input value={form.otherDomainPackage} onChange={(e) => update("otherDomainPackage", e.target.value)} className={inputClass} placeholder="e.g. 8-12 LPA" />
                  </div>
                </div>
              )}
            </div>

            {/* Section 4 — Interns */}
            <div>
              {sectionTitle("04", "Hiring Interns?")}
              <label className="flex items-center gap-3 text-white/80">
                <input type="checkbox" checked={form.hireInterns} onChange={(e) => update("hireInterns", e.target.checked)} className="h-4 w-4 accent-cobalt" />
                Yes, we&apos;re hiring interns
              </label>

              {form.hireInterns && (
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Domain</label>
                    <input value={form.internDomain} onChange={(e) => update("internDomain", e.target.value)} className={inputClass} placeholder="e.g. Frontend, Design" />
                  </div>
                  <div>
                    <label className={labelClass}>No. of Interns</label>
                    <input type="number" min="0" value={form.internCount} onChange={(e) => update("internCount", e.target.value)} className={inputClass} placeholder="0" />
                  </div>
                  <div>
                    <label className={labelClass}>Stipend (₹/month)</label>
                    <input value={form.internStipend} onChange={(e) => update("internStipend", e.target.value)} className={inputClass} placeholder="e.g. 15,000" />
                  </div>
                  <div>
                    <label className={labelClass}>Duration</label>
                    <input value={form.internDuration} onChange={(e) => update("internDuration", e.target.value)} className={inputClass} placeholder="e.g. 3 months" />
                  </div>
                </div>
              )}
            </div>

            {/* Section 5 — Notes */}
            <div>
              {sectionTitle("05", "Observations on Previous Hiring")}
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className={inputClass + " min-h-32 resize-y"}
                placeholder="Anything you've learned, pain points, or what you're looking for this time around..."
              />
            </div>

            {status === "error" && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "processing"}
              className="w-full rounded-xl bg-cobalt py-4 text-lg font-semibold text-white shadow-[0_0_30px_rgba(0,74,173,0.3)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_50px_rgba(0,74,173,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "processing" ? "Submitting..." : "Submit Pitch"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
