import { useState, useRef, useEffect } from "react";
import {
  locales,
  localeNames,
  type Locale,
  localizedPath,
} from "../i18n/config";

interface Props {
  currentLocale: Locale;
}

export default function LocaleSwitcher({ currentLocale }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: globalThis.MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchTo(locale: Locale) {
    document.cookie = `mycafe_locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    // Use live pathname (not .astro wrapper's stripped currentPath) so en URL
    // → zh-Hans correctly drops the /en prefix. Locale detection on the
    // destination side is driven by the cookie via middleware.
    const pathname = window.location.pathname;
    let stripped = pathname;
    for (const l of locales) {
      if (stripped === `/${l}` || stripped.startsWith(`/${l}/`)) {
        stripped = stripped === `/${l}` ? "/" : stripped.slice(l.length + 1);
        break;
      }
    }
    const target = localizedPath(locale, stripped);
    window.location.href = target;
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-sans bg-bg-base text-text-primary border border-text-primary/30 rounded-md hover:border-accent-500 hover:text-accent-700 transition-colors shadow-sm"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <svg
          className="w-4 h-4 text-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
          />
        </svg>
        <span className="text-text-primary">{localeNames[currentLocale]}</span>
        <svg
          className={`w-3 h-3 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-48 bg-bg-elevated border border-text-muted/20 rounded-md shadow-natural-lg overflow-hidden z-50"
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === currentLocale}
                onClick={() => switchTo(l)}
                className={`w-full text-left px-4 py-2.5 text-sm font-sans hover:bg-bg-base transition-colors ${
                  l === currentLocale
                    ? "bg-bg-base text-accent-700 font-medium"
                    : "text-text-primary"
                }`}
              >
                <span className="block">{localeNames[l]}</span>
                <span className="block text-xs text-text-muted mt-0.5">
                  {l}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
