import Link from "next/link"

// Copied from the homepage's footer (app/page.tsx) so secondary pages render an identical
// footer instead of drifting from it. The "contact" id is kept as-is even though it only
// makes sense in a homepage context; the logo's href is "/" rather than "#" precisely
// because this footer also renders on other pages, where "#" would just jump to the top of
// whatever page you're already on instead of going home.
export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="py-10 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-8">
        <Link
          href="/"
          aria-label="Act Angel AI — go to homepage"
          className="flex items-center gap-2 font-pixel text-xs tracking-[0.25em] text-black/50"
        >
          <img
            src="/images/logo.png"
            alt=""
            aria-hidden="true"
            className="h-10 w-auto"
          />
        </Link>
        <a href="#m" className="text-sm text-black/35 hover:text-black/70 transition-colors tracking-widest">
          One Boston Place, # 2600, Boston, MA, 02108
        </a>
        <a
          href="mailto:hello@actangel.com"
          className="text-sm text-black/35 hover:text-black/70 transition-colors tracking-widest"
        >
          hello@actangel.com
        </a>
      </div>

      {/* Copyright bar: policy links share this row and stay left-aligned.
          flex-col-reverse (not flex-col) is what puts the links ABOVE the copyright line when
          stacked on small screens — column-reverse renders the last DOM child (the links)
          first, while md:flex-row switches back to plain left-to-right, so the copyright
          (first in DOM) stays below the links. Same trick, no JS. */}
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04] flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
        <span className="text-sm text-black/20">© 2026 Act Angel AI</span>
        <div className="flex flex-wrap items-center justify-start md:justify-end gap-x-6 gap-y-2">
          <a
            href="/privacy"
            target="_blank"
            className="text-sm text-black/35 hover:text-black/70 transition-colors tracking-widest"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            target="_blank"
            className="text-sm text-black/35 hover:text-black/70 transition-colors tracking-widest"
          >
            Terms &amp; Conditions
          </a>
          <a
            href="/cookies"
            target="_blank"
            className="text-sm text-black/35 hover:text-black/70 transition-colors tracking-widest"
          >
            Cookies Policy
          </a>
        </div>
      </div>
    </footer>
  )
}
