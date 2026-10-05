// Drawlead brand mark — a house outline on a brand-green tile.
// Used by the app shell and the auth screens.
export function BrandMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="11" fill="#32B46F" />
      <path d="M10.5 19.5 20 11.5l9.5 8" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 21.5v7h12v-7" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 23.5v5" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

export default BrandMark;
