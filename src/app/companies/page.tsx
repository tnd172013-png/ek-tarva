import Image from "next/image";
import CompanyForm from "@/components/CompanyForm";

export const metadata = {
  title: "For Companies — Pitch to Hire | Ektarva",
  description:
    "Companies, tell us who you're hiring. Pitch your openings at the Pitch to Hire event by Ektarva.",
};

export default function CompaniesPage() {
  return (
    <main className="relative bg-white font-sans">
      <header className="flex items-center justify-between px-6 py-3 md:px-10 md:py-5">
        <Image
          src="/images/logo-cobalt.png"
          alt="Ektarva"
          width={160}
          height={80}
          priority
          className="h-auto w-28 md:w-36"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cobalt md:text-sm">
          Pitch to Hire <span className="font-medium text-cobalt/60">— presented by Ektarva</span>
        </p>
      </header>

      <CompanyForm />

      <footer className="border-t border-cobalt/15 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center text-sm text-cobalt/70">
          <p className="font-semibold text-cobalt">Ektarva</p>
          <p className="italic text-cobalt/60">One Root, Many Branches</p>
          <p>
            For inquiries:{" "}
            <a href="mailto:hello@ektarva.com" className="font-medium text-cobalt underline-offset-4 hover:underline">
              hello@ektarva.com
            </a>
          </p>
          <p className="mt-2 text-xs text-cobalt/50">
            &copy; {new Date().getFullYear()} Ektarva. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
