"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formatEventDate, formatTime12 } from "@/lib/events";
import { ROLES } from "@/lib/roles";

gsap.registerPlugin(ScrollTrigger);

type SlotInfo = { index: number; start: string; end: string; available: boolean };
type EventOption = {
  id: string;
  event_date: string;
  weekday: string;
  start_time: string;
  end_time: string;
  slot_duration_min: number;
  slots: SlotInfo[];
  available_count: number;
};

type RoleRow = { count: string; package: string; skills: string };

type OtherDomain = { name: string; count: string; package: string };

const emptyOtherDomain: OtherDomain = { name: "", count: "", package: "" };

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
  otherDomains: OtherDomain[];
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
  otherDomains: [{ ...emptyOtherDomain }],
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
  const [events, setEvents] = useState<EventOption[] | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const loadEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setEvents([]);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const selectedDay = events?.find((e) => e.id === selectedDayId) ?? null;

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

  const updateOtherDomain = (idx: number, field: keyof OtherDomain, value: string) =>
    setForm((prev) => ({
      ...prev,
      otherDomains: prev.otherDomains.map((d, i) => (i === idx ? { ...d, [field]: value } : d)),
    }));

  const addOtherDomain = () =>
    setForm((prev) => ({ ...prev, otherDomains: [...prev.otherDomains, { ...emptyOtherDomain }] }));

  const removeOtherDomain = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      otherDomains: prev.otherDomains.length === 1
        ? [{ ...emptyOtherDomain }]
        : prev.otherDomains.filter((_, i) => i !== idx),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDayId || selectedSlot === null) {
      setStatus("error");
      setErrorMsg("Please pick an event day and a time slot first.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setStatus("processing");
    setErrorMsg("");

    try {
      const filledOtherDomains = form.hireOtherDomain
        ? form.otherDomains.filter((d) => d.name || d.count || d.package)
        : [];
      const join = (vals: string[]) => vals.filter(Boolean).join(" | ");

      const payload = {
        ...form,
        eventDayId: selectedDayId,
        slotIndex: selectedSlot,
        otherDomains: filledOtherDomains,
        otherDomainName: join(filledOtherDomains.map((d) => d.name)),
        otherDomainCount: join(filledOtherDomains.map((d) => d.count)),
        otherDomainPackage: join(filledOtherDomains.map((d) => d.package)),
      };

      const res = await fetch("/api/company-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Slot was taken / day closed — refresh availability so the grid updates.
        if (res.status === 409) {
          setSelectedSlot(null);
          await loadEvents();
        }
        throw new Error(data.error || "Submission failed");
      }

      setStatus("success");
      setForm(initialForm);
      setSelectedSlot(null);
      loadEvents();
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
            <h3 className="mb-2 text-2xl font-bold text-cobalt">Thanks for pitching!</h3>
            <p className="mb-6 text-cobalt/70">
              Your company details are in. Our team will reach out with next steps for the event.
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cobalt/70">For Companies</p>
          <h2 className="mb-5 text-3xl font-bold text-cobalt md:text-5xl">
            Pitch Your Openings
          </h2>
          <p className="mx-auto mb-3 max-w-xl text-lg italic text-cobalt/90 md:text-xl">
            &ldquo;Behind every great product is the right team.&rdquo;
          </p>
          <p className="mx-auto max-w-xl text-cobalt/70">
            Let us help you find yours — start by pitching your roles.
          </p>
        </div>

        <div ref={cardRef} className="rounded-3xl bg-light-blue p-6 shadow-[0_20px_60px_rgba(0,74,173,0.12)] md:p-10" style={{ opacity: 0 }}>
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
                    <label className="mb-1 block text-xs text-cobalt/70">Full Time</label>
                    <input type="number" min="0" value={form.teamFullTime} onChange={(e) => update("teamFullTime", e.target.value)} className={inputClass} placeholder="0" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-cobalt/70">Part Time / Interns</label>
                    <input type="number" min="0" value={form.teamPartTime} onChange={(e) => update("teamPartTime", e.target.value)} className={inputClass} placeholder="0" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-cobalt/70">Freelancing</label>
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
              <p className="mb-4 text-sm text-cobalt/70">
                Fill rows only for the roles you&apos;re hiring. Leave the rest blank.
              </p>

              <div className="-mx-6 overflow-x-auto md:mx-0">
                <div className="inline-block min-w-full align-middle px-6 md:px-0">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-cobalt/70">
                        <th className="py-2 pr-4 font-medium">Role</th>
                        <th className="py-2 pr-3 font-medium">No. of People</th>
                        <th className="py-2 pr-3 font-medium">Package (range)</th>
                        <th className="py-2 font-medium">Skills Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROLES.map((role) => (
                        <tr key={role} className="border-t border-cobalt/15">
                          <td className="py-2 pr-4 font-medium text-cobalt">{role}</td>
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
              <label className="flex items-center gap-3 text-cobalt">
                <input type="checkbox" checked={form.hireOtherDomain} onChange={(e) => update("hireOtherDomain", e.target.checked)} className="h-4 w-4 accent-cobalt" />
                Yes, we&apos;re hiring for another domain
              </label>

              {form.hireOtherDomain && (
                <div className="mt-5 space-y-5">
                  {form.otherDomains.map((d, idx) => (
                    <div key={idx} className="rounded-2xl border border-cobalt/15 bg-white/60 p-4 md:p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-cobalt/70">
                          Domain {idx + 1}
                        </span>
                        {(form.otherDomains.length > 1 || d.name || d.count || d.package) && (
                          <button
                            type="button"
                            onClick={() => removeOtherDomain(idx)}
                            className="text-xs font-medium text-cobalt/60 hover:text-cobalt"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid gap-5 md:grid-cols-3">
                        <div>
                          <label className={labelClass}>Domain</label>
                          <input
                            value={d.name}
                            onChange={(e) => updateOtherDomain(idx, "name", e.target.value)}
                            className={inputClass}
                            placeholder="e.g. Product Management"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>No. of Hiring</label>
                          <input
                            type="number"
                            min="0"
                            value={d.count}
                            onChange={(e) => updateOtherDomain(idx, "count", e.target.value)}
                            className={inputClass}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Package (range)</label>
                          <input
                            value={d.package}
                            onChange={(e) => updateOtherDomain(idx, "package", e.target.value)}
                            className={inputClass}
                            placeholder="e.g. 8-12 LPA"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOtherDomain}
                    className="rounded-xl border border-cobalt/30 bg-white px-4 py-2 text-sm font-medium text-cobalt hover:border-cobalt/60"
                  >
                    + Add another domain
                  </button>
                </div>
              )}
            </div>

            {/* Section 4 — Interns */}
            <div>
              {sectionTitle("04", "Hiring Interns?")}
              <label className="flex items-center gap-3 text-cobalt">
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

            {/* Section 6 — Slot */}
            <div>
              {sectionTitle("06", "Pick Your Slot")}

              {events === null && (
                <p className="text-sm text-cobalt/60">Loading available slots…</p>
              )}

              {events !== null && events.length === 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-800">
                  No event days are open for booking right now. Please check back soon.
                </div>
              )}

              {events !== null && events.length > 0 && (
                <>
                  <p className="mb-3 text-sm text-cobalt/70">
                    Choose a day <span className="text-cobalt/50">(all times in IST)</span>:
                  </p>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {events.map((ev) => {
                      const selected = ev.id === selectedDayId;
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => {
                            setSelectedDayId(ev.id);
                            setSelectedSlot(null);
                          }}
                          className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                            selected
                              ? "border-cobalt bg-cobalt text-white"
                              : "border-cobalt/20 bg-white text-cobalt hover:border-cobalt/50"
                          }`}
                        >
                          <span className="block font-semibold">
                            {formatEventDate(ev.event_date)}
                          </span>
                          <span
                            className={`block text-xs ${
                              selected ? "text-white/80" : "text-cobalt/60"
                            }`}
                          >
                            {formatTime12(ev.start_time)}–{formatTime12(ev.end_time)} · {ev.available_count} open
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedDay && (
                    <>
                      <p className="mb-3 text-sm text-cobalt/70">
                        Choose a {selectedDay.slot_duration_min}-minute slot (IST):
                      </p>
                      {selectedDay.available_count === 0 ? (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-800">
                          This day is fully booked. Please pick another day.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                          {selectedDay.slots.map((s) => {
                            const selected = selectedSlot === s.index;
                            return (
                              <button
                                key={s.index}
                                type="button"
                                disabled={!s.available}
                                onClick={() => setSelectedSlot(s.index)}
                                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                                  selected
                                    ? "border-cobalt bg-cobalt text-white"
                                    : s.available
                                      ? "border-cobalt/20 bg-white text-cobalt hover:border-cobalt/50"
                                      : "cursor-not-allowed border-cobalt/10 bg-cobalt/5 text-cobalt/30 line-through"
                                }`}
                              >
                                {formatTime12(s.start)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {status === "error" && (
              <div className="rounded-xl border border-red-500/40 bg-red-50 p-4 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {selectedSlot !== null && selectedDay && (
              <p className="-mb-6 text-center text-sm text-cobalt/70">
                Booking the{" "}
                <span className="font-semibold text-cobalt">
                  {formatTime12(selectedDay.slots.find((s) => s.index === selectedSlot)?.start ?? "")}–
                  {formatTime12(selectedDay.slots.find((s) => s.index === selectedSlot)?.end ?? "")}
                </span>{" "}
                slot on {formatEventDate(selectedDay.event_date)} (IST).
              </p>
            )}

            <button
              type="submit"
              disabled={status === "processing" || selectedSlot === null}
              className="w-full rounded-xl bg-cobalt py-4 text-lg font-semibold text-white shadow-[0_4px_20px_rgba(0,74,173,0.3)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_6px_30px_rgba(0,74,173,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "processing"
                ? "Submitting..."
                : selectedSlot === null
                  ? "Pick a slot to continue"
                  : "Submit Pitch"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
