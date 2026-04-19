import YuvaForm from "@/components/YuvaForm";

export const metadata = {
  title: "Yuva Scheme Application — Pitch to Hire | Ektarva",
  description:
    "Company audit & requirement form for CMYKPY / NAPS / NATS schemes by Ektarva.",
};

export default function YuvaPage() {
  return (
    <main className="relative bg-white font-sans">
      <YuvaForm />

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
