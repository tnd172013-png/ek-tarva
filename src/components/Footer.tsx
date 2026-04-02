import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-bg-primary px-6 py-14">
      <div className="mx-auto max-w-4xl text-center">
        <Image
          src="/images/logo-light.png"
          alt="Ektarva"
          width={120}
          height={40}
          className="mx-auto mb-3 h-auto w-24 opacity-50"
        />
        <p className="mb-8 text-sm italic text-text-ghost">
          One Root, Many Branches
        </p>

        <div className="mb-8 flex items-center justify-center gap-8">
          <a
            href="mailto:hello@ektarva.com"
            className="text-sm text-text-muted transition-colors duration-300 hover:text-white"
          >
            Contact
          </a>
          <a
            href="https://instagram.com/ektarva"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted transition-colors duration-300 hover:text-white"
          >
            Instagram
          </a>
          <a
            href="https://linkedin.com/company/ektarva"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted transition-colors duration-300 hover:text-white"
          >
            LinkedIn
          </a>
        </div>

        <p className="text-xs text-text-ghost">
          &copy; {new Date().getFullYear()} Ektarva. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
