import { ChevronRight } from 'lucide-react';
import { Card } from './ui/card';

// Icon chip + sub-line colours per tone.
const TONES = {
  neutral: { chip: 'bg-muted text-muted-foreground', sub: 'text-muted-foreground', dot: 'bg-ink-400' },
  positive: { chip: 'bg-brand-50 text-brand-600', sub: 'text-primary-strong', dot: 'bg-primary' },
  negative: { chip: 'bg-red-50 text-red-600', sub: 'text-red-600', dot: 'bg-red-500' },
  warning: { chip: 'bg-amber-50 text-amber-600', sub: 'text-amber-700', dot: 'bg-amber-500' },
  info: { chip: 'bg-blue-50 text-blue-600', sub: 'text-blue-700', dot: 'bg-blue-500' },
  violet: { chip: 'bg-violet-50 text-violet-600', sub: 'text-violet-700', dot: 'bg-violet-500' },
};

const keyActivate = (fn) => (ev) => {
  if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(ev); }
};

// Summary card — uppercase label with a tinted icon chip on the right, a large
// figure, and a sub-line. A chevron shows when the card opens something.
// `active` marks the selected card in a row of filter cards; `children` render
// under the sub-line (e.g. a progress bar).
//
// `hero` draws the dark Executive Balance style — use it for at most one
// headline figure per page.
export function SummaryCard({
  label, value, sub, icon: Icon, tone = 'neutral', onClick, title, testId,
  compact = false, active = false, hero = false, badge, className = '', children,
}) {
  const t = TONES[tone] || TONES.neutral;
  const interactive = onClick
    ? { role: 'button', tabIndex: 0, onClick, onKeyDown: keyActivate(onClick) }
    : {};

  if (hero) {
    return (
      <div
        className={`group relative overflow-hidden rounded-3xl bg-[#0B0B0C] text-white shadow-lg ${compact ? 'p-5' : 'p-6'} ${onClick ? 'cursor-pointer transition-shadow hover:shadow-xl' : ''} ${className}`}
        title={title}
        data-testid={testId}
        {...interactive}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3">
          <span className="truncate rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-300 ring-1 ring-inset ring-primary/30">{label}</span>
          {badge ? <span className="shrink-0 text-xs text-white/50">{badge}</span> : (Icon && <Icon className="h-5 w-5 shrink-0 text-brand-400" />)}
        </div>
        <div className={`relative font-bold leading-tight tracking-tight tabular-nums ${compact ? 'mt-4 text-[28px]' : 'mt-5 text-[34px] sm:text-[38px]'}`}>{value}</div>
        {(sub || onClick) && (
          <div className="relative mt-1 flex items-center justify-between gap-3">
            {sub ? <p className="truncate text-sm text-white/60">{sub}</p> : <span />}
            {onClick && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        )}
        {children && <div className="relative mt-4">{children}</div>}
      </div>
    );
  }

  return (
    <Card
      className={`group ${onClick ? 'cursor-pointer transition-[box-shadow,border-color] hover:border-ink-300 hover:shadow-md' : ''} ${active ? 'border-primary ring-2 ring-primary/20 hover:border-primary' : ''} ${className}`}
      title={title}
      data-testid={testId}
      {...interactive}
    >
      <div className={compact ? 'p-4' : 'p-5'}>
        {/* Fixed height keeps figures aligned whether a card has an icon chip or a dot. */}
        <div className={`flex items-start justify-between gap-3 ${compact ? 'min-h-7' : 'min-h-8'}`}>
          <p className="line-clamp-2 min-w-0 pt-1 text-[11px] font-semibold uppercase leading-snug tracking-[0.12em] text-muted-foreground">
            {/* Without an icon, a dot carries the tone colour. */}
            {!Icon && tone !== 'neutral' && <span className={`mr-1.5 inline-block h-2 w-2 rounded-full align-[1px] ${t.dot}`} />}
            {label}
          </p>
          {badge}
          {Icon && !badge && (
            <span className={`flex shrink-0 items-center justify-center rounded-lg ${compact ? 'h-7 w-7' : 'h-8 w-8'} ${t.chip}`}>
              <Icon className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className={`font-bold leading-tight tracking-tight tabular-nums text-foreground ${compact ? 'mt-2 text-xl' : 'mt-3 text-2xl xl:text-[26px]'}`}>{value}</div>
        {(sub || onClick) && (
          <div className="mt-1.5 flex items-center justify-between gap-2">
            {sub ? <p className={`truncate font-medium ${compact ? 'text-xs' : 'text-[13px]'} ${t.sub}`}>{sub}</p> : <span />}
            {onClick && <ChevronRight className="h-4 w-4 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" />}
          </div>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </Card>
  );
}

// Channel card — coloured dot + uppercase label, a figure, optional
// label/value rows and a bar (the Account Liquidity Matrix style). `danger`
// tints it red (e.g. overdrawn); `dark` is the black total card; `compact`
// suits dense strips of four or more.
export function ChannelCard({
  label, value, dot = 'bg-primary', badge, rows, pct, onClick, title, testId,
  danger = false, dark = false, compact = false, className = '', children,
}) {
  const interactive = onClick
    ? { role: 'button', tabIndex: 0, onClick, onKeyDown: keyActivate(onClick) }
    : {};
  const surface = dark
    ? 'border-transparent bg-[#0B0B0C] text-white shadow-sm'
    : danger
      ? 'border-red-200 bg-red-50/50 dark:border-red-500/30 dark:bg-red-500/10'
      : `border-border bg-card ${onClick ? 'hover:border-ink-300' : ''}`;
  return (
    <div
      className={`rounded-2xl border ${compact ? 'p-3' : 'p-4'} ${surface} ${onClick ? 'cursor-pointer transition-[box-shadow,border-color] hover:shadow-md' : ''} ${className}`}
      title={title}
      data-testid={testId}
      {...interactive}
    >
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${danger ? 'bg-red-500' : dot}`} />
        <span className={`truncate text-[11px] font-semibold uppercase tracking-[0.06em] ${dark ? 'text-white/80' : 'text-foreground'}`}>{label}</span>
        {badge && <span className="ml-auto flex shrink-0 items-center gap-1">{badge}</span>}
      </div>
      <div className={`break-words font-bold tracking-tight tabular-nums ${compact ? 'mt-2 text-base' : 'mt-3 text-xl'} ${dark ? (danger ? 'text-red-300' : 'text-white') : danger ? 'text-red-600' : 'text-foreground'}`}>{value}</div>
      {rows?.length > 0 && (
        <div className={`mt-3 space-y-1 border-t pt-3 text-[13px] ${dark ? 'border-white/10' : 'border-border/70'}`}>
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-2">
              <span className={dark ? 'text-white/55' : 'text-muted-foreground'}>{r.label}</span>
              <span className={`font-semibold ${r.className || (dark ? 'text-white' : 'text-foreground')}`}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
      {pct != null && (
        <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-muted'}`}>
          <div className={`h-full rounded-full ${danger ? 'bg-red-500' : dot}`} style={{ width: `${Math.max(0, Math.min(100, Number(pct) || 0))}%` }} />
        </div>
      )}
      {children}
    </div>
  );
}

// Thin progress bar in a tone colour, for use as SummaryCard children.
export function SummaryBar({ pct, tone = 'positive', className = '' }) {
  const t = TONES[tone] || TONES.positive;
  const w = Math.max(0, Math.min(100, Number(pct) || 0));
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-muted ${className}`}>
      <div className={`h-full rounded-full ${t.dot}`} style={{ width: `${w}%` }} />
    </div>
  );
}

export default SummaryCard;
