import { FolderKanban, Wallet, ShoppingCart } from 'lucide-react';
import { AppMark } from './BrandMark';
import { useBranding } from '../hooks/useBranding';

const HIGHLIGHTS = [
  { icon: FolderKanban, title: 'Projects & planning', text: 'BOQ, stages and site progress on one timeline.' },
  { icon: Wallet, title: 'Cashbook & approvals', text: 'Every payment in and out, reconciled daily.' },
  { icon: ShoppingCart, title: 'Procurement', text: 'Orders, vendors and site receipts in sync.' },
];

// Split-screen shell for the signed-out screens: brand panel on the left
// (desktop only), the form column on the right.
export function AuthLayout({ children, footer = null }) {
  const branding = useBranding();
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-[#07110B] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#32B46F]/25 blur-[120px]" />
          <div className="absolute -bottom-48 right-[-120px] h-[480px] w-[480px] rounded-full bg-[#32B46F]/10 blur-[110px]" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse at 30% 40%, black 20%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at 30% 40%, black 20%, transparent 75%)',
            }}
          />
        </div>

        <div className="relative flex items-center gap-3">
          <AppMark branding={branding} className="h-10 w-10 shrink-0" />
          <div className="min-w-0 leading-tight">
            <p className="text-lg font-bold tracking-tight">{branding.app_name}</p>
            <p className="text-xs text-white/50">Powered by Drawlead</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Construction operations, end to end
          </p>
          <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight xl:text-[44px]">
            Every project, payment and purchase — <span className="text-primary">in one place.</span>
          </h2>
          <ul className="mt-10 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-inset ring-white/10">
                  <Icon className="h-[18px] w-[18px] text-brand-300" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-sm text-white/55">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} Drawlead</p>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center gap-2.5 lg:hidden">
          <AppMark branding={branding} className="h-9 w-9 shrink-0" />
          <span className="truncate text-base font-bold tracking-tight text-foreground">{branding.app_name}</span>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
        {footer}
      </main>
    </div>
  );
}

export default AuthLayout;
