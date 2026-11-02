import { ChevronRight } from 'lucide-react';
import { Card } from './ui/card';

// Icon chip + sub-line colours per tone.
const TONES = {
  neutral: { chip: 'bg-muted text-muted-foreground', sub: 'text-muted-foreground' },
  positive: { chip: 'bg-brand-50 text-brand-600', sub: 'text-primary-strong' },
  negative: { chip: 'bg-red-50 text-red-600', sub: 'text-red-600' },
  warning: { chip: 'bg-amber-50 text-amber-600', sub: 'text-amber-700' },
};

// Summary card — uppercase label with a tinted icon chip on the right, a large
// figure, and a sub-line. A chevron shows when the card opens something.
// Shared by the Finance Board's Accounts and Payment Schedule tabs so both
// summary rows look identical.
export function SummaryCard({ label, value, sub, icon: Icon, tone = 'neutral', onClick, title, testId, compact = false }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <Card
      className={`group ${onClick ? 'cursor-pointer transition-[box-shadow,border-color] hover:border-ink-300 hover:shadow-md' : ''}`}
      onClick={onClick}
      title={title}
      data-testid={testId}
    >
      <div className={compact ? 'p-4' : 'p-5'}>
        <div className="flex items-start justify-between gap-3">
          <p className="truncate pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          {Icon && (
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
      </div>
    </Card>
  );
}

export default SummaryCard;
