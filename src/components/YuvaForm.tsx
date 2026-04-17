"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const INDUSTRY_TYPES = ["Manufacturing", "Service", "Education", "IT/Startup"];

const DOCUMENT_LIST: { key: keyof FormData["documents"]; label: string }[] = [
  { key: "panCard", label: "PAN Card (Company/Firm)" },
  { key: "gst", label: "GST Registration Certificate" },
  { key: "shopAct", label: "Shop Act / Factory License" },
  { key: "epf", label: "EPF (Provident Fund) Registration" },
  { key: "esic", label: "ESIC Registration Certificate" },
  { key: "udyam", label: "Udyam / MSME Certificate" },
  { key: "cancelledCheque", label: "Cancelled Cheque (Company Bank A/C)" },
];

const EDUCATION_OPTIONS = ["12th", "ITI", "Graduate", "Post-Graduate", "Other"];

type Requirement = { role: string; education: string; count: string };

type FormData = {
  companyName: string;
  address: string;
  contactPerson: string;
  mobile: string;
  email: string;
  establishmentDate: string;
  totalEmployees: string;
  epfEmployees: string;
  industryTypes: string[];
  documents: {
    panCard: boolean;
    gst: boolean;
    shopAct: boolean;
    epf: boolean;
    esic: boolean;
    udyam: boolean;
    cancelledCheque: boolean;
  };
  requirements: Requirement[];
  authorizedSignatory: string;
  date: string;
};

type Status = "idle" | "processing" | "success" | "error";

const emptyReq: Requirement = { role: "", education: "", count: "" };

const initialForm: FormData = {
  companyName: "",
  address: "",
  contactPerson: "",
  mobile: "",
  email: "",
  establishmentDate: "",
  totalEmployees: "",
  epfEmployees: "",
  industryTypes: [],
  documents: {
    panCard: false,
    gst: false,
    shopAct: false,
    epf: false,
    esic: false,
    udyam: false,
    cancelledCheque: false,
  },
  requirements: [{ ...emptyReq }, { ...emptyReq }, { ...emptyReq }],
  authorizedSignatory: "",
  date: "",
};

export default function YuvaForm() {
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

  const toggleIndustry = (value: string) =>
    setForm((prev) => ({
      ...prev,
      industryTypes: prev.industryTypes.includes(value)
        ? prev.industryTypes.filter((v) => v !== value)
        : [...prev.industryTypes, value],
    }));

  const toggleDocument = (key: keyof FormData["documents"]) =>
    setForm((prev) => ({
      ...prev,
      documents: { ...prev.documents, [key]: !prev.documents[key] },
    }));

  const updateRequirement = (idx: number, field: keyof Requirement, value: string) =>
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    }));

  const addRequirement = () =>
    setForm((prev) => ({ ...prev, requirements: [...prev.requirements, { ...emptyReq }] }));

  const removeRequirement = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== idx),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("processing");
    setErrorMsg("");

    try {
      const res = await fetch("/api/yuva-register", {
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
      <section className="bg-white px-6 py-20 font-sans">
        <div className="mx-auto max-w-lg">
          <div className="rounded-3xl border border-cobalt/15 bg-light-blue p-10 text-center shadow-[0_10px_40px_rgba(0,74,173,0.12)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cobalt/10">
              <svg className="h-8 w-8 text-cobalt" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-cobalt">Submitted!</h3>
            <p className="mb-6 text-cobalt/70">
              Your company audit details are in. Our team will review and reach out.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="text-sm text-cobalt/70 underline underline-offset-4 hover:text-cobalt"
            >
              Submit another response
            </button>
          </div>
        </div>
      </section>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-cobalt/20 bg-white px-4 py-3 text-cobalt placeholder:text-cobalt/30 outline-none transition-all duration-200 focus:border-cobalt focus:shadow-[0_0_0_3px_rgba(0,74,173,0.15)]";

  const labelClass = "mb-1.5 block text-sm font-medium text-cobalt";

  const sectionTitle = (num: string, title: string) => (
    <div className="mb-6 flex items-baseline gap-3 border-b border-cobalt/15 pb-3">
      <span className="font-mono text-xs text-cobalt/60">{num}</span>
      <h3 className="text-xl font-bold text-cobalt md:text-2xl">{title}</h3>
    </div>
  );

  return (
    <section ref={sectionRef} className="relative bg-white px-6 pt-4 pb-14 font-sans md:pt-14 md:pb-20">
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-8 text-center md:mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cobalt/70">
            Company Audit &amp; Requirement Form
          </p>
          <h2 className="mb-5 text-3xl font-bold text-cobalt md:text-5xl">
            Yuva Scheme Application
          </h2>
          <p className="mx-auto max-w-xl text-cobalt/70">
            For CMYKPY / NAPS / NATS schemes. Help us understand your eligibility and hiring needs.
          </p>
        </div>

        <div ref={cardRef} className="rounded-3xl bg-light-blue p-6 shadow-[0_20px_60px_rgba(0,74,173,0.12)] md:p-10" style={{ opacity: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-12">

            {/* Company info */}
            <div>
              {sectionTitle("01", "Company Information")}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClass}>Company Name *</label>
                  <input required value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className={inputClass} placeholder="Acme Private Limited" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Address *</label>
                  <textarea required value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass + " min-h-24 resize-y"} placeholder="Full registered address" />
                </div>
                <div>
                  <label className={labelClass}>Contact Person — Name &amp; Designation *</label>
                  <input required value={form.contactPerson} onChange={(e) => update("contactPerson", e.target.value)} className={inputClass} placeholder="e.g. Priya Sharma, HR Manager" />
                </div>
                <div>
                  <label className={labelClass}>Mobile *</label>
                  <input required type="tel" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} className={inputClass} placeholder="+91 ..." />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="contact@company.com" />
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div>
              {sectionTitle("02", "Eligibility Check")}
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Establishment Date *</label>
                  <input required type="date" value={form.establishmentDate} onChange={(e) => update("establishmentDate", e.target.value)} className={inputClass} />
                  <p className="mt-1 text-xs text-cobalt/60">Minimum 3 years old</p>
                </div>
                <div>
                  <label className={labelClass}>Total On-Roll Employees *</label>
                  <input required type="number" min="0" value={form.totalEmployees} onChange={(e) => update("totalEmployees", e.target.value)} className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Employees with EPF *</label>
                  <input required type="number" min="0" value={form.epfEmployees} onChange={(e) => update("epfEmployees", e.target.value)} className={inputClass} placeholder="0" />
                </div>
              </div>

              <div className="mt-6">
                <p className={labelClass}>Industry Type (select all that apply)</p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {INDUSTRY_TYPES.map((t) => (
                    <label key={t} className="flex items-center gap-2 rounded-xl border border-cobalt/15 bg-white px-3 py-2.5 text-sm text-cobalt cursor-pointer hover:border-cobalt/40">
                      <input type="checkbox" checked={form.industryTypes.includes(t)} onChange={() => toggleIndustry(t)} className="h-4 w-4 accent-cobalt" />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              {sectionTitle("03", "Document Checklist")}
              <p className="mb-4 text-sm text-cobalt/70">Tick the documents you currently have available.</p>
              <div className="grid gap-3 md:grid-cols-2">
                {DOCUMENT_LIST.map((d) => (
                  <label key={d.key} className="flex items-center gap-3 rounded-xl border border-cobalt/15 bg-white px-4 py-3 text-sm text-cobalt cursor-pointer hover:border-cobalt/40">
                    <input type="checkbox" checked={form.documents[d.key]} onChange={() => toggleDocument(d.key)} className="h-4 w-4 accent-cobalt" />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              {sectionTitle("04", "Requirement Details")}
              <p className="mb-4 text-sm text-cobalt/70">What roles are you looking to fill?</p>

              <div className="-mx-6 overflow-x-auto md:mx-0">
                <div className="inline-block min-w-full align-middle px-6 md:px-0">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-cobalt/70">
                        <th className="py-2 pr-3 font-medium">#</th>
                        <th className="py-2 pr-3 font-medium">Job Role / Trade</th>
                        <th className="py-2 pr-3 font-medium">Education</th>
                        <th className="py-2 pr-3 font-medium">No. of Candidates</th>
                        <th className="py-2 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.requirements.map((req, idx) => (
                        <tr key={idx} className="border-t border-cobalt/15">
                          <td className="py-2 pr-3 font-medium text-cobalt">{idx + 1}</td>
                          <td className="py-2 pr-3">
                            <input value={req.role} onChange={(e) => updateRequirement(idx, "role", e.target.value)} className={inputClass + " !py-2 !px-3 w-48"} placeholder="e.g. Welder, Accountant" />
                          </td>
                          <td className="py-2 pr-3">
                            <select value={req.education} onChange={(e) => updateRequirement(idx, "education", e.target.value)} className={inputClass + " !py-2 !px-3 w-36"}>
                              <option value="">Select…</option>
                              {EDUCATION_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 pr-3">
                            <input type="number" min="0" value={req.count} onChange={(e) => updateRequirement(idx, "count", e.target.value)} className={inputClass + " !py-2 !px-3 w-24"} placeholder="0" />
                          </td>
                          <td className="py-2">
                            {form.requirements.length > 1 && (
                              <button type="button" onClick={() => removeRequirement(idx)} className="text-xs text-cobalt/50 hover:text-red-600">
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                type="button"
                onClick={addRequirement}
                className="mt-4 rounded-xl border border-cobalt/20 bg-white px-4 py-2 text-sm font-medium text-cobalt hover:border-cobalt/50"
              >
                + Add another role
              </button>
            </div>

            {/* Authorization */}
            <div>
              {sectionTitle("05", "Authorization")}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Authorized Signatory *</label>
                  <input required value={form.authorizedSignatory} onChange={(e) => update("authorizedSignatory", e.target.value)} className={inputClass} placeholder="Name of signatory" />
                </div>
                <div>
                  <label className={labelClass}>Date *</label>
                  <input required type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputClass} />
                </div>
              </div>
              <p className="mt-3 text-xs text-cobalt/60">
                Physical stamp / signed copy can be shared separately over email once submitted.
              </p>
            </div>

            {status === "error" && (
              <div className="rounded-xl border border-red-500/40 bg-red-50 p-4 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "processing"}
              className="w-full rounded-xl bg-cobalt py-4 text-lg font-semibold text-white shadow-[0_4px_20px_rgba(0,74,173,0.3)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_6px_30px_rgba(0,74,173,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "processing" ? "Submitting..." : "Submit Form"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
