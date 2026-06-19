"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatEventDate, formatTime12, isFridayOrSaturday, slotCount } from "@/lib/events";

type EventDay = {
  id: string;
  event_date: string;
  weekday: string;
  start_time: string;
  end_time: string;
  slot_duration_min: number;
  is_published: boolean;
  total_slots: number;
  booked: number;
};

export default function AdminEventsPage() {
  const [password, setPassword] = useState("");
  const [events, setEvents] = useState<EventDay[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Create form
  const [date, setDate] = useState("");
  const [start, setStart] = useState("17:30");
  const [end, setEnd] = useState("19:30");
  const [minutes, setMinutes] = useState("10");

  const auth = () => ({ Authorization: `Bearer ${password}` });

  const previewCount =
    date && start && end && Number(minutes) > 0
      ? slotCount(start, end, Number(minutes))
      : 0;
  const dateIsValid = date ? isFridayOrSaturday(date) : true;

  const loadEvents = async () => {
    if (!password) {
      setError("Enter the admin password first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/events", { headers: auth() });
      if (res.status === 401) throw new Error("Wrong password.");
      if (!res.ok) throw new Error(`Server error (${res.status}).`);
      const data = await res.json();
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setBusy(false);
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Enter the admin password first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { ...auth(), "Content-Type": "application/json" },
        body: JSON.stringify({
          event_date: date,
          start_time: start,
          end_time: end,
          slot_duration_min: Number(minutes),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Server error (${res.status}).`);
      setDate("");
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the event.");
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (ev: EventDay) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/events/${ev.id}`, {
        method: "PATCH",
        headers: { ...auth(), "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !ev.is_published }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${res.status}).`);
      }
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the event.");
    } finally {
      setBusy(false);
    }
  };

  const deleteEvent = async (ev: EventDay) => {
    const ok = window.confirm(
      `Delete the event on ${formatEventDate(ev.event_date)}?${
        ev.booked > 0 ? `\n\nThis will also remove ${ev.booked} booking(s).` : ""
      }`
    );
    if (!ok) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/events/${ev.id}`, {
        method: "DELETE",
        headers: auth(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${res.status}).`);
      }
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the event.");
    } finally {
      setBusy(false);
    }
  };

  const exportEvent = async (ev: EventDay) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/events/${ev.id}/export`, { headers: auth() });
      if (res.status === 401) throw new Error("Wrong password.");
      if (!res.ok) throw new Error(`Server error (${res.status}).`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookings-${ev.event_date}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:border-cobalt/50 focus:bg-white/[0.05]";

  return (
    <main className="min-h-screen bg-bg-primary">
      <header className="flex items-center justify-between px-6 py-6 md:px-10">
        <Image
          src="/images/logo-light.png"
          alt="Ektarva"
          width={120}
          height={40}
          priority
          className="h-auto w-24 opacity-80"
        />
        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.15em] text-white/70">
          <Link href="/admin" className="hover:text-white">
            Registrations
          </Link>
          <span className="text-white">Events</span>
        </div>
      </header>

      <section className="relative px-6 py-10">
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
              Event Slots
            </h1>
            <p className="text-sm text-white/60">
              Schedule a Friday or Saturday and the slots are created automatically.
            </p>
          </div>

          {/* Password */}
          <div className="glass-elevated mb-6 rounded-3xl p-6">
            <label className="mb-1.5 block text-sm font-medium text-white/80">
              Admin Password
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Enter the admin password"
                autoComplete="off"
              />
              <button
                onClick={loadEvents}
                disabled={busy}
                className="shrink-0 rounded-xl bg-cobalt px-5 py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_30px_rgba(0,74,173,0.4)] disabled:opacity-40"
              >
                {busy ? "…" : "Load events"}
              </button>
            </div>
          </div>

          {/* Create event */}
          <div className="glass-elevated mb-6 rounded-3xl p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">New event day</h2>
            <form onSubmit={createEvent} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/40">
                  Date (Friday or Saturday)
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                  required
                />
                {!dateIsValid && (
                  <p className="mt-1 text-xs text-amber-400">
                    That date isn&apos;t a Friday or Saturday.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/40">
                  Start time
                </label>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/40">
                  End time
                </label>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/40">
                  Minutes per person
                </label>
                <input
                  type="number"
                  min="1"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="flex items-end">
                <p className="text-sm text-white/70">
                  →{" "}
                  <span className="font-semibold text-white">{previewCount}</span>{" "}
                  slot{previewCount === 1 ? "" : "s"} of {minutes || "?"} min
                </p>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={busy || !dateIsValid || previewCount < 1}
                  className="w-full rounded-xl bg-cobalt py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_30px_rgba(0,74,173,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Create event
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Event list */}
          {events && (
            <div className="space-y-3">
              {events.length === 0 && (
                <p className="text-center text-sm text-white/50">
                  No events yet. Create one above.
                </p>
              )}
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">
                        {formatEventDate(ev.event_date)}
                      </p>
                      <p className="text-sm text-white/60">
                        {formatTime12(ev.start_time)}–{formatTime12(ev.end_time)} (IST) · {ev.total_slots} slots ·{" "}
                        {ev.slot_duration_min} min each
                      </p>
                      <p className="mt-1 text-xs text-white/50">
                        <span className="text-emerald-400">{ev.booked} booked</span>
                        {" · "}
                        {Math.max(ev.total_slots - ev.booked, 0)} open
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        ev.is_published
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-white/5 text-white/50"
                      }`}
                    >
                      {ev.is_published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => togglePublish(ev)}
                      disabled={busy}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white transition hover:border-cobalt/50 hover:bg-cobalt/10 disabled:opacity-40"
                    >
                      {ev.is_published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => exportEvent(ev)}
                      disabled={busy || ev.booked === 0}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white transition hover:border-cobalt/50 hover:bg-cobalt/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Download Excel ({ev.booked})
                    </button>
                    <button
                      onClick={() => deleteEvent(ev)}
                      disabled={busy}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
