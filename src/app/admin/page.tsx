"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Filter = "paid" | "pending" | "all";
type Status = "idle" | "downloading" | "error";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastDownloaded, setLastDownloaded] = useState<Filter | null>(null);

  const download = async (filter: Filter) => {
    if (!password) {
      setStatus("error");
      setErrorMsg("Enter the admin password first.");
      return;
    }
    setStatus("downloading");
    setErrorMsg("");
    setLastDownloaded(null);

    try {
      const url =
        filter === "all"
          ? "/api/admin/export"
          : `/api/admin/export?filter=${filter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${password}` },
      });

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

        <div className="relative z-10 mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
              Download Registrations
            </h1>
            <p className="text-sm text-white/60">
              Enter the admin password, then pick which list to download.
            </p>
          </div>

          <div className="glass-elevated rounded-3xl p-6 md:p-8">
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

            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-wider text-white/40">
                Download
              </p>
              <div className="flex flex-col gap-2 md:flex-row">
                <button
                  onClick={() => download("paid")}
                  disabled={status === "downloading"}
                  className={downloadBtnClass}
                >
                  {status === "downloading" ? "…" : "Paid Only"}
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

          <p className="mt-6 text-center text-xs text-white/40">
            The password is not saved — you&apos;ll need to enter it each time you open this page.
          </p>
        </div>
      </section>
    </main>
  );
}
