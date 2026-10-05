import { useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, LogOut, Moon, Sun, ArrowLeft, Menu, ChevronsLeft, ChevronsRight, UserCircle,
  Landmark, Calculator, Megaphone, Briefcase, UserCog, Smartphone, Settings, BookOpen,
  BadgeCheck, Receipt, Banknote, CalendarClock, Scale, Wallet, FolderKanban, Gauge,
  LineChart, ShoppingCart, LayoutDashboard, Store, HardHat, ListChecks, Package,
  UserPlus, Target, FolderOpen, ShieldCheck, Headset, SlidersHorizontal, FileUp,
  ClipboardList, Boxes, PieChart, Users, Building2, Truck, FileText, Radio, CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import axios from 'axios';
import { useTheme } from '../hooks/useTheme';
import USBLookupBar from './USBLookupBar';
import { BrandMark } from './BrandMark';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ═══ ROLE-BASED NAVIGATION ═══

const ROLE_NAV = {
  super_admin: [
    { label: 'Finance Board', path: '/finance-board' },
    { label: 'Planning', path: '/planning-board' },
    { label: 'Marketing Board', path: '/marketing-board' },
    { label: 'HR', path: '/hr-portal' },
    { label: 'Users', path: '/users' },
    { label: 'User App', path: '/user-app' },
    { label: 'Settings', path: '/settings' },
  ],
  accountant: [
    { label: 'Cashbook', path: '/accounts-board?tab=cashbook' },
    { label: 'Approvals', path: '/accounts-board?tab=approvals' },
    { label: 'Expense', path: '/accounts-board?tab=cashbook&sub=expense' },
    { label: 'Cheque Management', path: '/accounts-board?tab=cheques' },
    { label: 'Carry Forward', path: '/accounts-board?tab=carry-forward' },
    { label: 'Suspense A/c', path: '/suspense-account' },
    { label: 'Other Accounts', path: '/other-accounts' },
    { label: 'Project Wise', path: '/accounts-board?tab=projects' },
  ],
  general_manager: [
    { label: 'Command Center', path: '/gm-dashboard' },
    { label: 'Projects', path: '/projects' },
    { label: 'Planning Board', path: '/planning-board' },
    { label: 'Financial', path: '/financial-overview' },
    { label: 'Approvals', path: '/approvals' },
    { label: 'Procurement', path: '/procurement-board-v2' },
  ],
  project_manager: [
    { label: 'Dashboard', path: '/pm-dashboard' },
  ],
  planning: [
    { label: 'Planning Board', path: '/planning-board' },
    { label: 'Projects', path: '/projects' },
    { label: 'Vendors', path: '/vendor-management' },
    { label: 'Contractors', path: '/contractor-management' },
    { label: 'BOQ', path: '/planning-board?tab=boq' },
  ],
  planning_person: [
    { label: 'Planning Board', path: '/planning-board' },
  ],
  procurement: [
    { label: 'Procurement', path: '/procurement-board-v2' },
    // Projects + Vendor Management used to live here. They were moved into
    // the Procurement Dashboard sub-tabs (All Projects · Material Vendors)
    // so the operator stays on one page for the entire flow.
    { label: 'Packages', path: '/packages' },
  ],
  cre: [],  // CRE has all sub-tabs inside the CRE Board page; no top nav
  pre_sales: [
    { label: 'Pre-Sales CRM', path: '/crm-pre-sales' },
    { label: 'User App', path: '/user-app' },
  ],
  sales: [
    { label: 'Sales CRM', path: '/crm-sales' },
    { label: 'User App', path: '/user-app' },
  ],
  site_engineer: [
    { label: 'Dashboard', path: '/site-engineer' },
  ],
  architect: [
    { label: 'My Projects', path: '/architect-dashboard' },
  ],
  hr: [
    { label: 'HR Portal', path: '/hr-portal' },
    { label: 'Projects', path: '/projects' },
  ],
  quality_check: [
    { label: 'QC Dashboard', path: '/qc-dashboard' },
  ],
  drawlead_marketing: [
    { label: 'All Projects', path: '/marketing-projects' },
  ],
  prospect: [],  // mobile app uses its own footer nav; AppHeader is hidden
};

// ═══ SUB-MENUS (used by super_admin and accountant) ═══

const ROLE_SUB_MENUS = {
  super_admin: {
    '/projects': [{ label: 'All Projects', path: '/projects' }],
    '/financial-overview': [
      { label: 'Financial Overview', path: '/financial-overview' },
      { label: 'Approvals', path: '/approvals' },
      { label: 'Expenses', path: '/expenses' },
      { label: 'Indirect Costs', path: '/indirect-costs' },
    ],
    '/hr-portal': [
      { label: 'HR Portal', path: '/hr-portal' },
    ],
    '/planning-board': [
      { label: 'Planning Board', path: '/planning-board' },
      { label: 'BOQ', path: '/planning-board?tab=boq' },
      { label: 'Vendors', path: '/vendor-management' },
      { label: 'Contractors', path: '/contractor-management' },
    ],
    '/marketing-board': [
      { label: 'Marketing Board', path: '/marketing-board' },
      { label: 'CRE Board', path: '/cre-board' },
      { label: 'Pre-Sales CRM', path: '/crm-pre-sales' },
      { label: 'Sales CRM', path: '/crm-sales' },
      { label: 'RE Projects', path: '/crm/re-projects' },
      { label: 'Custom Fields', path: '/crm/custom-fields' },
      { label: 'CSV Import', path: '/crm/import-csv' },
    ],
    '/gm-dashboard': [
      { label: 'GM Command Center', path: '/gm-dashboard' },
      { label: 'PM Dashboard', path: '/pm-dashboard' },
      { label: 'QC Dashboard', path: '/qc-dashboard' },
      { label: 'Procurement', path: '/procurement-board-v2' },
      { label: 'Work Orders', path: '/work-order-management' },
    ],
    '/users': [{ label: 'User Management', path: '/users' }],
    '/settings': [
      { label: 'Settings', path: '/settings' },
      { label: 'Materials', path: '/materials' },
      { label: 'Vendors', path: '/vendor-management' },
    ],
  },
  // Accountant has no sub-menus (all items are in the main nav)
};

// Build path-to-module maps per role
function buildPathMap(subMenus) {
  const map = {};
  if (!subMenus) return map;
  Object.entries(subMenus).forEach(([moduleKey, items]) => {
    items.forEach(item => { map[item.path] = moduleKey; });
  });
  return map;
}

function getModuleKey(pathname, role) {
  const subMenus = ROLE_SUB_MENUS[role];
  if (!subMenus) return null;
  const pathMap = buildPathMap(subMenus);
  if (pathMap[pathname]) return pathMap[pathname];
  if (pathname.startsWith('/projects/')) return '/projects';
  if (pathname.startsWith('/boq/')) return '/planning-board';
  return null;
}

// Friendly display label for the role badge (top-left + profile dropdown).
// Falls back to `role.replace('_', ' ')` for any role not mapped here.
const ROLE_LABEL_MAP = {
  planning: 'Planning Head',
  planning_person: 'Planning Person',
  drawlead_marketing: 'Drawlead Marketing',
};
const roleLabel = (r) => (r ? (ROLE_LABEL_MAP[r] || r.replace(/_/g, ' ')) : '…');

// ═══ SHELL PRESENTATION ═══
// Everything below only decides how the navigation above is drawn — routes,
// roles and active-state rules are unchanged.

// Sidebar icon per nav label.
const NAV_ICONS = {
  'Finance Board': Landmark, 'Planning': Calculator, 'Marketing Board': Megaphone, 'HR': Briefcase,
  'Users': UserCog, 'User App': Smartphone, 'Settings': Settings,
  'Cashbook': BookOpen, 'Approvals': BadgeCheck, 'Expense': Receipt, 'Cheque Management': Banknote,
  'Carry Forward': CalendarClock, 'Suspense A/c': Scale, 'Other Accounts': Wallet, 'Project Wise': FolderKanban,
  'Command Center': Gauge, 'GM Command Center': Gauge, 'Projects': FolderKanban, 'All Projects': FolderKanban,
  'Planning Board': ClipboardList, 'Financial': LineChart, 'Financial Overview': LineChart,
  'Procurement': ShoppingCart, 'Dashboard': LayoutDashboard, 'Vendors': Store, 'Contractors': HardHat,
  'BOQ': ListChecks, 'Packages': Package, 'Pre-Sales CRM': UserPlus, 'Sales CRM': Target,
  'My Projects': FolderOpen, 'HR Portal': Briefcase, 'QC Dashboard': ShieldCheck, 'PM Dashboard': LayoutDashboard,
  'CRE Board': Headset, 'RE Projects': Calculator, 'Custom Fields': SlidersHorizontal, 'CSV Import': FileUp,
  'Work Orders': ClipboardList, 'User Management': UserCog, 'Materials': Boxes, 'Expenses': Receipt,
  'Indirect Costs': PieChart,
};
// Pages that pass `customNav` name each item's icon as a string.
const CUSTOM_NAV_ICONS = { Building2, Package, Truck, Users, FileText, Radio };
const iconFor = (item) => CUSTOM_NAV_ICONS[item.icon] || NAV_ICONS[item.label] || CircleDot;

const ACRONYMS = { crm: 'CRM', hr: 'HR', boq: 'BOQ', gm: 'GM', pm: 'PM', qc: 'QC', re: 'RE', dt: 'DT', usb: 'USB' };
// Fallback page title from the URL ("/crm/re-projects" → "RE Projects"), skipping id-like segments.
function titleFromPath(pathname) {
  const segs = pathname.split('/').filter(Boolean).filter((s) => !(/\d/.test(s) && s.length >= 6));
  const seg = segs[segs.length - 1];
  if (!seg) return '';
  return seg.split('-').map((w) => ACRONYMS[w] || (w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
}

const initialsOf = (name) => (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

// Short role names read as acronyms ("hr" → "HR", "cre" → "CRE").
const displayRole = (r) => {
  const label = roleLabel(r);
  return label.length <= 3 ? label.toUpperCase() : label;
};

const COLLAPSE_KEY = 'usb_sidebar_collapsed';
// Remembered choice wins; otherwise start as the icon rail on narrower
// desktops so wide tables keep their room.
const readCollapsed = () => {
  try {
    const saved = window.localStorage.getItem(COLLAPSE_KEY);
    if (saved === '1' || saved === '0') return saved === '1';
  } catch { /* ignore */ }
  return typeof window !== 'undefined' && window.innerWidth < 1280;
};

// Underline tab used by the sub-navigation strips.
const stripTabClass = (active) =>
  `relative -mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors ${
    active
      ? 'border-primary text-foreground'
      : 'border-transparent text-muted-foreground hover:border-ink-300 hover:text-foreground'
  }`;

export function AppHeader({ user, unreadNotifs = 0, customNav, activeCustomNav, onCustomNavChange, headerActions, hideNav = false, backTo = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Embedded mode: hosted inside Finance Board (or another) iframe.
  // - `?embedded=1` alone → render nothing (parent already has its own header).
  // - `?embedded=1&navRole=<role>` → render a slim sub-nav strip using that role's
  //   ROLE_NAV (e.g. show Cashbook/Approvals/Expense for super_admin viewing
  //   /accounts-board through the Finance Board's Accounts tab).
  // - Defense-in-depth: if we are inside an iframe (window.parent !== window)
  //   but the embedded=1 flag was somehow lost (e.g. internal navigate() without
  //   query-string preservation), still suppress the full header — render nothing.
  //   This eliminates the "double header" bug seen on the Super Admin Finance Board.
  let embedded = false;
  let navRole = null;
  if (typeof window !== 'undefined') {
    const qs = new URLSearchParams(window.location.search);
    let inIframe = false;
    try { inIframe = window.self !== window.top; } catch { inIframe = true; }
    if (qs.get('embedded') === '1' || inIframe) {
      embedded = true;
      navRole = qs.get('navRole');
    }
  }

  const handleLogout = async () => {
    try { await axios.post(`${API}/auth/logout`, {}, { withCredentials: true }); } catch {}
    // Clear auth cache
    if (window.__clearAuthCache) window.__clearAuthCache();
    navigate('/login', { replace: true });
  };

  // While the user object is loading on a page, fall back to the cached
  // user from sessionStorage so the nav renders instantly. Avoids the
  // "empty header on /hr-portal until /auth/me resolves" flash.
  let effectiveUser = user;
  if (!effectiveUser && typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem('mhu_user_cache');
      if (raw) effectiveUser = JSON.parse(raw);
    } catch { /* ignore */ }
  }
  const role = effectiveUser?.role;
  const navItems = role ? (ROLE_NAV[role] || []) : [];
  const currentPath = location.pathname;
  const currentSearch = location.search || '';
  const moduleKey = getModuleKey(currentPath, role);
  const subMenus = ROLE_SUB_MENUS[role];
  const subItems = moduleKey && subMenus ? subMenus[moduleKey] : null;
  const hasCustomNav = customNav && customNav.length > 0;

  const isMainActive = (path) => {
    if (subMenus) {
      const mk = getModuleKey(currentPath, role);
      return mk === path;
    }
    // If path contains query string (e.g. ?tab=cashbook), match full path+search
    if (path.includes('?')) {
      return (currentPath + currentSearch) === path;
    }
    // If current URL has a query string but nav item doesn't, this nav is NOT active
    // (prevents e.g. /accounts-board from matching when user is on /accounts-board?tab=approvals)
    if (currentSearch && path === currentPath) return false;
    if (path === currentPath) return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const isSubActive = (path) => currentPath === path || currentPath.startsWith(path + '/');

  // For super_admin, never let a page's customNav replace the main top nav.
  // Instead, render the customNav as a sub-strip below — this way Super Admin's
  // shell (Finance Board · Planning · Marketing · HR · Users · …) is always
  // visible no matter which inner page they're on.
  const customNavAsSub = role === 'super_admin' && hasCustomNav;
  const showMainNav = !hasCustomNav || customNavAsSub;

  // Sidebar entries: a page's customNav replaces the role nav (except for
  // super_admin, see above); a role nav is only shown when it has >1 entry.
  const sidebarItems = hasCustomNav && !customNavAsSub
    ? customNav.map((item) => ({
        key: item.value,
        label: item.label,
        icon: iconFor(item),
        testid: `nav-${item.value.replace(/_/g, '-')}`,
        active: activeCustomNav === item.value,
        onSelect: () => onCustomNavChange?.(item.value),
      }))
    : (showMainNav && navItems.length > 1 ? navItems.map((item) => {
        const children = subMenus?.[item.path];
        return {
          key: item.path,
          path: item.path,
          label: item.label,
          icon: iconFor(item),
          testid: `nav-${item.label.toLowerCase().replace(/\s/g, '-')}`,
          active: isMainActive(item.path),
          onSelect: () => navigate(item.path),
          children: children && children.length > 1 ? children : null,
        };
      }) : []);
  const hasSidebar = !embedded && !hideNav && sidebarItems.length > 0;
  // When the active module's sub-pages are listed in the expanded sidebar,
  // the horizontal sub-nav strip is only needed below the desktop breakpoint.
  const moduleInSidebar = hasSidebar && !collapsed && sidebarItems.some((i) => i.path === moduleKey && i.children);

  const activeMain = navItems.find((i) => isMainActive(i.path));
  const activeSub = subItems ? subItems.find((i) => isSubActive(i.path)) : null;
  const activeCustom = hasCustomNav ? customNav.find((i) => i.value === activeCustomNav) : null;
  const pageTitle = activeCustom?.label || activeSub?.label || activeMain?.label || titleFromPath(currentPath) || 'Home';
  const pageParent = activeMain && activeMain.label !== pageTitle ? activeMain.label : displayRole(role);
  const userName = effectiveUser?.name || '';
  const initials = initialsOf(userName) || <UserCircle className="h-4 w-4" />;
  const goHome = () => navigate(navItems[0]?.path || '/dashboard');

  // Offset the page for the fixed desktop sidebar (see index.css). Removal is
  // deferred so a page → page navigation (old header unmounts, new one
  // mounts in the same commit) doesn't make the layout jump.
  useLayoutEffect(() => {
    if (!hasSidebar) return undefined;
    const root = document.documentElement;
    clearTimeout(window.__appShellRelease);
    root.classList.add('has-app-sidebar');
    return () => {
      window.__appShellRelease = setTimeout(() => root.classList.remove('has-app-sidebar'), 0);
    };
  }, [hasSidebar]);

  useLayoutEffect(() => {
    if (embedded) return;
    document.documentElement.classList.toggle('app-sidebar-collapsed', collapsed);
  }, [collapsed, embedded]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
  };

  if (embedded) {
    const embeddedNav = navRole ? (ROLE_NAV[navRole] || []) : [];
    if (embeddedNav.length === 0) return null;
    const currentFull = location.pathname + (location.search || '');
    const isEmbedActive = (path) => {
      // Strip the embedded= and navRole= params before comparing
      const target = path.includes('?')
        ? `${path}${path.includes('&') ? '&' : '&'}embedded=1&navRole=${navRole}`
        : `${path}?embedded=1&navRole=${navRole}`;
      // Loose match — strip query and compare base path + tab param if present
      const [tp, tq] = target.split('?');
      const [cp, cq] = currentFull.split('?');
      if (tp !== cp) return false;
      const tparams = new URLSearchParams(tq || '');
      const cparams = new URLSearchParams(cq || '');
      // Compare sub too — Cashbook and Expense share tab=cashbook
      return tparams.get('tab') === cparams.get('tab')
        && (tparams.get('sub') || '') === (cparams.get('sub') || '');
    };
    return (
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 px-3 backdrop-blur-md lg:px-6" data-testid="embedded-sub-nav">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {embeddedNav.map((item) => {
            // Preserve embedded flags when navigating between sub-nav items
            const sep = item.path.includes('?') ? '&' : '?';
            const target = `${item.path}${sep}embedded=1&navRole=${navRole}`;
            return (
              <button
                key={item.path}
                data-testid={`embed-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => navigate(target)}
                className={stripTabClass(isEmbedActive(item.path))}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // ── Sidebar building blocks (desktop rail + mobile drawer) ──
  const renderBrand = (rail, withTestId) => (
    <div className={`flex h-14 shrink-0 items-center border-b border-sidebar-border ${rail ? 'justify-center' : 'px-4'}`}>
      <button
        type="button"
        onClick={() => { goHome(); setDrawerOpen(false); }}
        className="flex min-w-0 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        data-testid={withTestId ? 'header-brand' : undefined}
      >
        <BrandMark className="h-8 w-8 shrink-0" />
        {!rail && (
          <span className="min-w-0 leading-tight">
            <span className="block text-[15px] font-bold tracking-tight text-white">Drawlead</span>
            <span className="block text-[11px] font-medium text-sidebar-muted">Construction ERP</span>
          </span>
        )}
      </button>
    </div>
  );

  const renderRoleChip = () => (
    <div className="px-3 pt-4">
      <div className="flex items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2 ring-1 ring-inset ring-primary/20">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_rgba(50,180,111,0.22)]" />
        <span className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-300">{roleLabel(role)}</span>
      </div>
    </div>
  );

  const sectionLabel = (text) => (
    <p className="px-3 pb-2 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted/80">{text}</p>
  );

  const navButtonClass = (active, rail) =>
    `group relative flex w-full items-center gap-3 rounded-lg text-[13.5px] font-medium transition-colors ${
      rail ? 'h-10 justify-center' : 'px-3 py-2'
    } ${
      active
        ? 'bg-primary text-white shadow-[0_8px_20px_-10px_rgba(50,180,111,0.9)]'
        : 'text-sidebar-foreground/80 hover:bg-white/[0.06] hover:text-white'
    }`;

  const renderNav = (inDrawer) => {
    const rail = collapsed && !inDrawer;
    const close = () => { if (inDrawer) setDrawerOpen(false); };
    return (
      <nav
        className={`flex-1 space-y-0.5 overflow-y-auto py-4 ${rail ? 'px-2.5' : 'px-3'}`}
        data-testid={inDrawer ? 'drawer-nav' : 'header-nav'}
      >
        {!rail && sectionLabel('Workspace')}
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const showChildren = item.active && item.children && !rail;
          return (
            <div key={item.key}>
              <button
                type="button"
                data-testid={inDrawer ? `drawer-${item.testid}` : item.testid}
                onClick={() => { item.onSelect(); close(); }}
                title={rail ? item.label : undefined}
                className={navButtonClass(item.active, rail)}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${item.active ? 'text-white' : 'text-sidebar-muted group-hover:text-white'}`} />
                {rail ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
              </button>
              {showChildren && (
                <div className="mb-2 ml-[21px] mt-1 space-y-0.5 border-l border-white/10 pl-3">
                  {item.children.map((child) => {
                    const childActive = isSubActive(child.path);
                    return (
                      <button
                        type="button"
                        key={child.path}
                        data-testid={`${inDrawer ? 'drawer-' : ''}sidenav-${child.label.toLowerCase().replace(/\s/g, '-')}`}
                        onClick={() => { navigate(child.path); close(); }}
                        className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                          childActive ? 'bg-white/[0.07] font-medium text-white' : 'text-sidebar-foreground/65 hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${childActive ? 'bg-primary' : 'bg-white/20'}`} />
                        <span className="truncate">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {inDrawer && (
          <div className="pt-5">
            {sectionLabel('Account')}
            <button type="button" onClick={() => { navigate('/notifications'); close(); }} className={navButtonClass(currentPath === '/notifications', false)} data-testid="drawer-notifications">
              <Bell className="h-[18px] w-[18px] shrink-0 text-sidebar-muted group-hover:text-white" />
              <span className="flex-1 text-left">Notifications</span>
              {unreadNotifs > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">{unreadNotifs}</span>}
            </button>
            <button type="button" onClick={() => { navigate('/profile'); close(); }} className={navButtonClass(currentPath === '/profile', false)} data-testid="drawer-profile">
              <UserCircle className="h-[18px] w-[18px] shrink-0 text-sidebar-muted group-hover:text-white" />
              <span>Profile</span>
            </button>
          </div>
        )}
      </nav>
    );
  };

  const renderFooter = (inDrawer) => {
    const rail = collapsed && !inDrawer;
    return (
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className={`flex items-center gap-3 rounded-xl ${rail ? 'flex-col gap-2' : 'bg-white/[0.04] p-2.5 ring-1 ring-inset ring-white/[0.05]'}`}>
          <button
            type="button"
            onClick={() => { navigate('/profile'); if (inDrawer) setDrawerOpen(false); }}
            title="Profile"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-brand-200 ring-1 ring-inset ring-primary/30 transition-colors hover:bg-primary/30"
          >
            {initials}
          </button>
          <div className={rail ? 'sr-only' : 'min-w-0 flex-1 leading-tight'}>
            <p className="truncate text-sm font-semibold text-white" data-testid={inDrawer ? 'drawer-username' : 'header-username'}>{userName}</p>
            <p className="truncate text-[11px] capitalize text-sidebar-muted">{displayRole(role)}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-muted transition-colors hover:bg-red-500/15 hover:text-red-300"
            data-testid={inDrawer ? 'drawer-logout' : 'header-logout'}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        {!inDrawer && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className={`mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-muted transition-colors hover:bg-white/[0.05] hover:text-white ${rail ? 'justify-center px-0' : ''}`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            data-testid="sidebar-collapse-toggle"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /> Collapse</>}
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {hasSidebar && createPortal(
        <aside
          className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex"
          style={{ width: 'var(--app-sidebar-w)' }}
          data-testid="app-sidebar"
        >
          {renderBrand(collapsed, true)}
          {!collapsed && renderRoleChip()}
          {renderNav(false)}
          {renderFooter(false)}
        </aside>,
        document.body
      )}

      {hasSidebar && (
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent
            side="left"
            className="flex w-[288px] flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground sm:max-w-[288px] [&>button]:text-sidebar-muted [&>button:hover]:bg-white/10 [&>button:hover]:text-white"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Main navigation</SheetDescription>
            {renderBrand(false, false)}
            {renderRoleChip()}
            {renderNav(true)}
            {renderFooter(true)}
          </SheetContent>
        </Sheet>
      )}

      <div className="sticky top-0 z-50">
        <header data-testid="app-header" className="border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
          <div className="flex h-14 items-center gap-2 px-3 sm:px-4 lg:px-6">
            {/* Left: menu (mobile) · brand (when there is no sidebar) · Back · page title */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              {hasSidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDrawerOpen(true)}
                  className="h-9 w-9 shrink-0 lg:hidden"
                  aria-label="Open menu"
                  data-testid="header-menu-btn"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div
                className={`flex shrink-0 cursor-pointer items-center gap-2.5 ${hasSidebar ? 'lg:hidden' : ''}`}
                onClick={goHome}
                data-testid={hasSidebar ? 'header-brand-mobile' : 'header-brand'}
              >
                <BrandMark className="h-8 w-8 shrink-0" />
                <div className={`leading-tight ${backTo ? 'hidden sm:block' : ''}`}>
                  <span className="block text-[15px] font-bold tracking-tight text-foreground">Drawlead</span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-strong">
                    {roleLabel(role)}
                  </span>
                </div>
              </div>
              {backTo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(backTo)}
                  className="h-8 shrink-0 gap-1 rounded-full px-3 text-xs"
                  data-testid="app-header-back-btn"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
              )}
              {hasSidebar && (
                <div className="hidden min-w-0 leading-tight lg:block">
                  <p className="truncate text-[11px] font-medium capitalize text-muted-foreground">{pageParent}</p>
                  <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground" data-testid="header-page-title">{pageTitle}</h1>
                </div>
              )}
            </div>

            {/* Right: lookup · page actions · theme · notifications · profile */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              {role === 'super_admin' && <USBLookupBar />}
              {headerActions}
              {(headerActions || role === 'super_admin') && <div className="mx-1 hidden h-6 w-px bg-border sm:block" />}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                data-testid="header-theme-toggle"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/notifications')}
                className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                data-testid="header-notifications"
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadNotifs > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-background">{unreadNotifs}</span>
                )}
              </Button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="ml-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800 ring-2 ring-transparent transition-shadow hover:ring-brand-200 focus-visible:outline-none focus-visible:ring-primary/40 dark:bg-brand-900/60 dark:text-brand-200"
                data-testid="header-profile"
                title="Profile"
                aria-label="Profile"
              >
                {initials}
              </button>
              {!hasSidebar && (
                <div className="ml-1 hidden items-center gap-2 border-l border-border pl-3 lg:flex">
                  <div className="text-right leading-tight">
                    <p className="text-sm font-semibold text-foreground" data-testid="header-username">{userName}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{roleLabel(role)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-600" data-testid="header-logout" aria-label="Log out">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Sub-navigation strip — for super_admin we surface the page's customNav
            here so the Super Admin shell stays visible at the top. */}
        {!hideNav && customNavAsSub && customNav && customNav.length > 0 && (
          <div className="border-b border-border bg-background/90 px-3 backdrop-blur-md sm:px-4 lg:px-6" data-testid="sub-nav">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {customNav.map((item) => (
                <button
                  key={item.value}
                  data-testid={`subnav-${item.value.replace(/_/g, '-')}`}
                  onClick={() => onCustomNavChange?.(item.value)}
                  className={stripTabClass(activeCustomNav === item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Module sub-pages (roles with sub-menus). On desktop these live in the
            expanded sidebar, so the strip is only needed on smaller screens. */}
        {!hideNav && !hasCustomNav && subItems && subItems.length > 1 && (
          <div className={`border-b border-border bg-background/90 px-3 backdrop-blur-md sm:px-4 lg:px-6 ${moduleInSidebar ? 'lg:hidden' : ''}`} data-testid="sub-nav">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {subItems.map((item) => (
                <button
                  key={item.path}
                  data-testid={`subnav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                  onClick={() => navigate(item.path)}
                  className={stripTabClass(isSubActive(item.path))}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
