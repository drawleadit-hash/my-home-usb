import { ChevronRight } from 'lucide-react';
import { Card } from './ui/card';

// Summary card — light gray icon square, uppercase label, large figure, sub-line,
// and a chevron when the card opens something. Shared by the Finance Board's
// Accounts and Payment Schedule tabs so both summary rows look identical.
export function SummaryCard({ label, value, sub, icon: Icon, onClick, title, testId, compact = false }) {
  return (
    <Card
      className={`group rounded-[6px] ${onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}`}
      onClick={onClick}
      title={title}
      data-testid={testId}
    >
      <div className={`flex items-center ${compact ? 'gap-3 p-4' : 'gap-4 p-5'}`}>
        {Icon && (
          <div className={`shrink-0 flex items-center justify-center ${compact ? 'h-11 w-11 rounded-xl' : 'h-14 w-14 rounded-2xl'} bg-gray-100 text-gray-500`}>
            <Icon className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.08em] text-gray-500 truncate">{label}</p>
          <div className={`mt-1 font-bold leading-tight tracking-tight tabular-nums text-gray-900 ${compact ? 'text-xl' : 'text-2xl xl:text-3xl'}`}>{value}</div>
          {sub && <p className={`mt-1 text-gray-500 truncate ${compact ? 'text-xs' : 'text-sm'}`}>{sub}</p>}
        </div>
        {onClick && <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" />}
      </div>
    </Card>
  );
}

export default SummaryCard;
