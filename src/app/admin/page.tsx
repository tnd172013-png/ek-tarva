"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Filter = "paid" | "pending" | "all";
type Status = "idle" | "downloading" | "loading" | "error";

interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  rolePreference: string | null;
  utr: string | null;
  paymentStatus: "paid" | "pending";
  createdAt: string;
  screenshotUrl: string | null;
  duplicateUtr: boolean;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastDownloaded, setLastDownloaded] = useState<Filter | null>(null);
  const [registrations, setRegistrations] = useState<Registration[] | null>(null);
  const [listFilter, setListFilter] = useState<Filter>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${password}` };

  const requirePassword = () => {
    if (!password) {
      setStatus("error");
      setErrorMsg("Enter the admin password first.");
      return false;
    }
    return true;
  };

  const loadRegistrations = async () => {
    if (!requirePassword()) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/registrations", { headers: authHeaders });
      if (res.status === 401) throw new Error("Wrong password. Check with the team.");
      if (!res.ok) throw new Error(`Server error (${res.status}). Try again in a moment.`);
      const data = await res.json();
      setRegistrations(data.registrations);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to load registrations.");
    }
  };

  const toggleVerified = async (r: Registration) => {
    setTogglingId(r.id);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/registrations/${r.id}/verify`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ verified: r.paymentStatus !== "paid" }),
      });
      if (!res.ok) throw new Error("Update failed. Try again.");
      const data = await res.json();
      setRegistrations((prev) =>
        prev?.map((x) => (x.id === r.id ? { ...x, paymentStatus: data.paymentStatus } : x)) ?? null
      );
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setTogglingId(null);
    }
  };

  const download = async (filter: Filter) => {
    if (!requirePassword()) return;
    setStatus("downloading");
    setErrorMsg("");
    setLastDownloaded(null);

    try {
      const url =
        filter === "all"
          ? "/api/admin/export"
          : `/api/admin/export?filter=${filter}`;

      const res = await fetch(url, { headers: authHeaders });

      if (res.status === 401) {
        throw new Error("Wrong password. Check with the team.");
      }
      if (!res.ok) {
        throw new Error(`Server error (${res.status}). Try again in a moment.`);
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      a.href = blobUrl;
      a.download = `registrations-${filter}-${today}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);

      setStatus("idle");
      setLastDownloaded(filter);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Download failed.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:border-cobalt/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(0,74,173,0.15)]";

  const downloadBtnClass =
    "flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:border-cobalt/50 hover:bg-cobalt/10 disabled:cursor-not-allowed disabled:opacity-40";

  const filterBtnClass = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
      active ? "bg-cobalt text-white" : "border border-white/10 text-white/60 hover:text-white"
    }`;

  const visible = registrations?.filter(
    (r) => listFilter === "all" || r.paymentStatus === listFilter
  );

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
          <span className="text-white">Registrations</span>
          <Link href="/admin/events" className="hover:text-white">
            Events
          </Link>
        </div>
      </header>

      <section className="relative px-6 py-14">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,74,173,0.1), transparent)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
              Registrations
            </h1>
            <p className="text-sm text-white/60">
              Enter the admin password to review payments or download lists.
            </p>
          </div>

          <div className="glass-elevated mx-auto max-w-lg rounded-3xl p-6 md:p-8">
            <label className="mb-1.5 block text-sm font-medium text-white/80">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              className={inputClass}
              placeholder="Paste or type the password"
              autoComplete="off"
            />

            <button
              onClick={loadRegistrations}
              disabled={status === "loading"}
              className="mt-4 w-full rounded-xl bg-cobalt py-3 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,74,173,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Loading…" : registrations ? "Refresh List" : "Load Registrations"}
            </button>

            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-wider text-white/40">
                Download CSV
              </p>
              <div className="flex flex-col gap-2 md:flex-row">
                <button
                  onClick={() => download("paid")}
                  disabled={status === "downloading"}
                  className={downloadBtnClass}
                >
                  {status === "downloading" ? "…" : "Verified Only"}
                </button>
                <button
                  onClick={() => download("pending")}
                  disabled={status === "downloading"}
                  className={downloadBtnClass}
                >
                  {status === "downloading" ? "…" : "Pending Only"}
                </button>
                <button
                  onClick={() => download("all")}
                  disabled={status === "downloading"}
                  className={downloadBtnClass}
                >
                  {status === "downloading" ? "…" : "Everyone"}
                </button>
              </div>
            </div>

            {status === "error" && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            {lastDownloaded && status !== "error" && (
              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
                Downloaded the <strong>{lastDownloaded}</strong> list. Check your downloads folder.
              </div>
            )}
          </div>

          {registrations && (
            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-white/60">
                  {visible?.length ?? 0} of {registrations.length} registrations
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setListFilter("all")} className={filterBtnClass(listFilter === "all")}>All</button>
                  <button onClick={() => setListFilter("pending")} className={filterBtnClass(listFilter === "pending")}>Pending</button>
                  <button onClick={() => setListFilter("paid")} className={filterBtnClass(listFilter === "paid")}>Verified</button>
                </div>
              </div>

              <div className="space-y-3">
                {visible?.length === 0 && (
                  <p className="py-8 text-center text-sm text-white/40">Nothing here.</p>
                )}
                {visible?.map((r) => (
                  <div key={r.id} className="glass rounded-2xl p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">{r.fullName}</p>
                          {r.paymentStatus === "paid" ? (
                            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">Verified</span>
                          ) : (
                            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">Pending</span>
                          )}
                          {r.duplicateUtr && (
                            <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">Duplicate UTR</span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-sm text-white/60">
                          {r.email} · {r.phone}
                          {r.rolePreference ? ` · ${r.rolePreference}` : ""}
                        </p>
                        <p className="mt-1 font-mono text-xs text-white/50">
                          UTR: {r.utr || "—"} · {new Date(r.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {r.screenshotUrl && (
                          <a
                            href={r.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:border-cobalt/50 hover:bg-cobalt/10"
                          >
                            Screenshot
                          </a>
                        )}
                        <button
                          onClick={() => toggleVerified(r)}
                          disabled={togglingId === r.id}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                            r.paymentStatus === "paid"
                              ? "border border-white/10 text-white/70 hover:border-amber-500/50 hover:text-amber-400"
                              : "bg-emerald-600 text-white hover:bg-emerald-500"
                          }`}
                        >
                          {togglingId === r.id ? "…" : r.paymentStatus === "paid" ? "Unverify" : "Mark Verified"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-white/40">
            The password is not saved — you&apos;ll need to enter it each time you open this page.
          </p>
        </div>
      </section>
    </main>
  );
}
