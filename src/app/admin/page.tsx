"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Filter = "all" | "pending" | "paid" | "duplicates";
type CsvFilter = "paid" | "pending" | "all";

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

const PAGE_SIZES = [10, 25, 50];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${password}` };

  const load = async () => {
    if (!password) {
      setErrorMsg("Enter the admin password first.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/registrations", { headers: authHeaders });
      if (res.status === 401) throw new Error("Wrong password. Check with the team.");
      if (!res.ok) throw new Error(`Server error (${res.status}). Try again in a moment.`);
      const data = await res.json();
      setRegistrations(data.registrations);
      setAuthed(true);
      setPage(1);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load registrations.");
    } finally {
      setLoading(false);
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
        prev.map((x) => (x.id === r.id ? { ...x, paymentStatus: data.paymentStatus } : x))
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setTogglingId(null);
    }
  };

  const download = async (csvFilter: CsvFilter) => {
    setDownloading(true);
    setErrorMsg("");
    try {
      const url =
        csvFilter === "all" ? "/api/admin/export" : `/api/admin/export?filter=${csvFilter}`;
      const res = await fetch(url, { headers: authHeaders });
      if (!res.ok) throw new Error(`Download failed (${res.status}).`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `registrations-${csvFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const stats = useMemo(() => {
    const verified = registrations.filter((r) => r.paymentStatus === "paid").length;
    const duplicates = registrations.filter((r) => r.duplicateUtr).length;
    return {
      total: registrations.length,
      verified,
      pending: registrations.length - verified,
      duplicates,
    };
  }, [registrations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registrations.filter((r) => {
      if (filter === "pending" && r.paymentStatus !== "pending") return false;
      if (filter === "paid" && r.paymentStatus !== "paid") return false;
      if (filter === "duplicates" && !r.duplicateUtr) return false;
      if (!q) return true;
      return [r.fullName, r.email, r.phone, r.utr ?? "", r.rolePreference ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [registrations, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(safePage * pageSize, filtered.length);

  const setFilterAndReset = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:border-cobalt/50 focus:bg-white/[0.05]";

  const tabClass = (active: boolean) =>
    `rounded-lg px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
      active
        ? "bg-cobalt text-white"
        : "border border-white/10 text-white/50 hover:border-white/25 hover:text-white"
    }`;

  const pagerBtn =
    "rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-cobalt/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30";

  /* ── Login gate ── */
  if (!authed) {
    return (
      <main className="min-h-screen bg-bg-primary">
        <Header />
        <section className="relative flex items-center justify-center px-6 py-24">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,74,173,0.1), transparent)" }}
          />
          <div className="relative z-10 w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-white">Admin</h1>
              <p className="text-sm text-white/60">Enter the admin password to manage registrations.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                load();
              }}
              className="glass-elevated rounded-3xl p-8"
            >
              <label className="mb-1.5 block text-sm font-medium text-white/80">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg("");
                }}
                className={inputClass}
                placeholder="Paste or type the password"
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-cobalt py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,74,173,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Checking…" : "Open Dashboard"}
              </button>
              {errorMsg && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-400">
                  {errorMsg}
                </div>
              )}
              <p className="mt-4 text-center text-xs text-white/40">
                The password is not saved — you&apos;ll need it each time you open this page.
              </p>
            </form>
          </div>
        </section>
      </main>
    );
  }

  /* ── Dashboard ── */
  return (
    <main className="min-h-screen bg-bg-primary pb-20">
      <Header />

      <section className="relative px-4 pt-8 md:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 50% 30% at 50% 0%, rgba(0,74,173,0.08), transparent)" }}
        />

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Title row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">Registrations</h1>
              <p className="mt-1 text-sm text-white/50">
                Check the screenshot &amp; UTR, then mark each payment verified.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={load}
                disabled={loading}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-cobalt/50 hover:bg-cobalt/10 disabled:opacity-40"
              >
                {loading ? "Refreshing…" : "↻ Refresh"}
              </button>
              <div className="group relative">
                <button
                  disabled={downloading}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-cobalt/50 hover:bg-cobalt/10 disabled:opacity-40"
                >
                  {downloading ? "Preparing…" : "⬇ Export CSV"}
                </button>
                <div className="invisible absolute right-0 z-20 mt-1 w-44 rounded-xl border border-white/10 bg-[#0a1628] p-1.5 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                  <button onClick={() => download("all")} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white">Everyone</button>
                  <button onClick={() => download("paid")} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white">Verified only</button>
                  <button onClick={() => download("pending")} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white">Pending only</button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Verified" value={stats.verified} tone="emerald" />
            <StatCard label="Pending" value={stats.pending} tone="amber" />
            <StatCard label="Duplicate UTRs" value={stats.duplicates} tone={stats.duplicates > 0 ? "red" : undefined} />
          </div>

          {/* Toolbar */}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilterAndReset("all")} className={tabClass(filter === "all")}>
                All ({stats.total})
              </button>
              <button onClick={() => setFilterAndReset("pending")} className={tabClass(filter === "pending")}>
                Pending ({stats.pending})
              </button>
              <button onClick={() => setFilterAndReset("paid")} className={tabClass(filter === "paid")}>
                Verified ({stats.verified})
              </button>
              {stats.duplicates > 0 && (
                <button onClick={() => setFilterAndReset("duplicates")} className={tabClass(filter === "duplicates")}>
                  ⚠ Duplicates ({stats.duplicates})
                </button>
              )}
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-cobalt/50 md:w-72"
              placeholder="Search name, email, phone, UTR…"
            />
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-white/40">
                    <th className="px-4 py-3.5 font-medium">Candidate</th>
                    <th className="px-4 py-3.5 font-medium">Role</th>
                    <th className="px-4 py-3.5 font-medium">UTR</th>
                    <th className="px-4 py-3.5 font-medium">Registered</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
                    <th className="px-4 py-3.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-14 text-center text-white/40">
                        {registrations.length === 0
                          ? "No registrations yet."
                          : "Nothing matches this filter or search."}
                      </td>
                    </tr>
                  )}
                  {pageRows.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-white">{r.fullName}</p>
                        <p className="mt-0.5 text-xs text-white/50">{r.email}</p>
                        <p className="text-xs text-white/50">{r.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 text-white/70">{r.rolePreference || "—"}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-white/80">{r.utr || "—"}</span>
                        {r.duplicateUtr && (
                          <span className="ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-400">
                            Dup
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-white/60">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        <span className="block text-white/40">
                          {new Date(r.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {r.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {r.screenshotUrl ? (
                            <a
                              href={r.screenshotUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-cobalt/50 hover:text-white"
                            >
                              Proof
                            </a>
                          ) : (
                            <span className="px-2 text-xs text-white/30">no proof</span>
                          )}
                          <button
                            onClick={() => toggleVerified(r)}
                            disabled={togglingId === r.id}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                              r.paymentStatus === "paid"
                                ? "border border-white/10 text-white/60 hover:border-amber-500/50 hover:text-amber-400"
                                : "bg-emerald-600 text-white hover:bg-emerald-500"
                            }`}
                          >
                            {togglingId === r.id ? "…" : r.paymentStatus === "paid" ? "Unverify" : "Verify"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.02] px-4 py-3">
              <p className="text-xs text-white/50">
                Showing {showingFrom}–{showingTo} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-white/10 bg-[#0a1628] px-2 py-1.5 text-xs text-white/70 outline-none"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>{n} / page</option>
                  ))}
                </select>
                <button onClick={() => setPage(1)} disabled={safePage === 1} className={pagerBtn}>«</button>
                <button onClick={() => setPage(safePage - 1)} disabled={safePage === 1} className={pagerBtn}>‹ Prev</button>
                <span className="px-2 text-xs text-white/60">
                  {safePage} / {totalPages}
                </span>
                <button onClick={() => setPage(safePage + 1)} disabled={safePage === totalPages} className={pagerBtn}>Next ›</button>
                <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className={pagerBtn}>»</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Header() {
  return (
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
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "amber" | "red" }) {
  const toneClass =
    tone === "emerald" ? "text-emerald-400" : tone === "amber" ? "text-amber-400" : tone === "red" ? "text-red-400" : "text-white";
  return (
    <div className="glass rounded-2xl px-5 py-4">
      <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}
