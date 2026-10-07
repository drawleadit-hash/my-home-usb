import { Card, CardContent } from './ui/card';

// Summary / KPI tile — the design-system "kpi_tile" (ink surface, accent icon).
// Shared by the Finance Board's Accounts and Payment Schedule tabs so both
// summary rows look identical. Tailwind needs literal class names, so each
// accent maps to full strings here instead of being built from a colour name.
const ACCENTS = {
  brand:  { icon: '[&_svg]:text-brand-400',  bar: 'bg-brand-400' },
  red:    { icon: '[&_svg]:text-red-400',    bar: 'bg-red-400' },
  blue:   { icon: '[&_svg]:text-blue-400',   bar: 'bg-blue-400' },
  orange: { icon: '[&_svg]:text-orange-400', bar: 'bg-orange-400' },
  amber:  { icon: '[&_svg]:text-amber-400',  bar: 'bg-amber-400' },
  indigo: { icon: '[&_svg]:text-indigo-400', bar: 'bg-indigo-400' },
};

export function KpiTile({ label, value, sub, icon: Icon, accent = 'brand', onClick, title, testId }) {
  const a = ACCENTS[accent] || ACCENTS.brand;
  return (
    <Card
      className={`relative overflow-hidden bg-gray-900 text-white border-0 ring-1 ring-inset ring-white/10 shadow-lg ${a.icon} ${onClick ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl' : ''}`}
      onClick={onClick}
      title={title}
      data-testid={testId}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${a.bar}`} aria-hidden="true" />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60 truncate">{label}</p>
            <div className="text-2xl font-bold mt-1.5 tabular-nums text-white truncate">{value}</div>
            {sub && <p className="text-xs text-white/50 mt-1 truncate">{sub}</p>}
          </div>
          {Icon && (
            <div className="h-10 w-10 shrink-0 rounded-xl bg-white/[0.08] ring-1 ring-inset ring-white/10 flex items-center justify-center">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default KpiTile;
