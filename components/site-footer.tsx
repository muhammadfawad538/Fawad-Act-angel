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
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Row 1: logo, address, email. Stacks on small screens, one row from md up. */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-8">
          <a
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
          </a>
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

        {/* Row 2: the 3 policy links on their own line — right-aligned on desktop, centred
            and wrapping (flex-wrap) on small screens so they never overflow. */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2">
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
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04]">
        <span className="text-sm text-black/20">© 2026 Act Angel AI</span>
      </div>
    </footer>
  )
}
