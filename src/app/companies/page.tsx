import Image from "next/image";
import CompanyForm from "@/components/CompanyForm";
import Footer from "@/components/Footer";

export const metadata = {
  title: "For Companies — Pitch to Hire | Ektarva",
  description:
    "Companies, tell us who you're hiring. Pitch your openings at the Pitch to Hire event by Ektarva.",
};

export default function CompaniesPage() {
  return (
    <main className="relative bg-bg-primary">
      <header className="relative flex items-center justify-between px-6 py-6 md:px-10">
        <Image
          src="/images/logo-light.png"
          alt="Ektarva"
          width={120}
          height={40}
          priority
          className="h-auto w-24 opacity-80 md:w-28"
        />
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/70 md:text-sm">
          Pitch to Hire <span className="text-white/40">— presented by Ektarva</span>
        </p>
      </header>

      <CompanyForm />
      <Footer />
    </main>
  );
}
