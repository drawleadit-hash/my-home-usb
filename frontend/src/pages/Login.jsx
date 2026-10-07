import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/AuthLayout';
import { useBranding } from '@/hooks/useBranding';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function getRoleRedirect(role) {
  const roleRoutes = {
    site_engineer: '/site-engineer',
    sr_site_engineer: '/site-engineer',
    pre_sales: '/crm-pre-sales',
    sales: '/crm-sales',
    general_manager: '/gm-dashboard',
    accountant: '/accounts-board',
    planning: '/planning-board',
    procurement: '/procurement-board-v2',
    cre: '/cre-board',
    project_manager: '/pm-dashboard',
    associate_pm: '/pm-dashboard',
    client: '/client-portal',
    vendor: '/vendor-portal',
    marketing_head: '/marketing-board',
    drawlead_marketing: '/marketing-projects',
    architect: '/architect-dashboard',
    super_architect: '/workflow-master',
    hr: '/hr-portal',
    prospect: '/prospect-app',
    super_admin: '/finance-board'
  };
  return roleRoutes[role] || '/dashboard';
}

const DEMO_USERS = [
  { email: 'admin@constructionos.com', name: 'Super Admin', role: 'super_admin' },
  { email: 'gm@constructionos.com', name: 'General Manager', role: 'general_manager' },
  { email: 'cre@constructionos.com', name: 'CRE', role: 'cre' },
  { email: 'accountant@constructionos.com', name: 'Accountant', role: 'accountant' },
  { email: 'pm@constructionos.com', name: 'Project Manager', role: 'project_manager' },
  { email: 'planning@constructionos.com', name: 'Planning', role: 'planning' },
  { email: 'procurement@constructionos.com', name: 'Procurement', role: 'procurement' },
  { email: 'engineer@constructionos.com', name: 'Site Engineer', role: 'site_engineer' },
  { email: 'presales@constructionos.com', name: 'Pre-Sales', role: 'pre_sales' },
  { email: 'sales@constructionos.com', name: 'Sales', role: 'sales' },
  { email: 'architect@constructionos.com', name: 'Architect', role: 'architect' },
  { email: 'hr@constructionos.com', name: 'HR', role: 'hr' },
  { email: 'raj@client.com', name: 'Mr. Raj (Client)', role: 'client' },
  { email: 'mohan@client.com', name: 'Mr. Mohan (Client)', role: 'client' },
];

export default function Login() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const nextUrl = sp.get('next');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginTab, setLoginTab] = useState('password');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('admin@constructionos.com');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  // Feb 26 2026 — Branding (app name + logo URL) loaded from /api/branding
  // so the Super Admin can change them without a deploy.
  const branding = useBranding();
  useEffect(() => {
    try { document.title = branding.app_name; } catch { /* ignore */ }
  }, [branding.app_name]);
  const [demoMode, setDemoMode] = useState(false);

  // Check if setup is needed
  useEffect(() => {
    axios.get(`${API}/auth/setup-status`).then(res => {
      if (!res.data.setup_complete) {
        navigate('/setup', { replace: true });
      }
      setDemoMode(res.data.demo_mode && !window.location.hostname.includes('myhomeusb.com'));
    }).catch(() => {});
  }, [navigate]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    if (needs2FA && (!totpCode || totpCode.length !== 6)) {
      toast.error('Please enter your 6-digit authenticator code');
      return;
    }
    setIsLoading(true);
    try {
      const payload = { email, password };
      if (needs2FA) payload.totp_code = totpCode;
      const response = await axios.post(`${API}/auth/login`, payload, { withCredentials: true });
      const data = response.data;
      if (data.requires_2fa) {
        setNeeds2FA(true);
        setTotpCode('');
        toast.info('Enter your Google Authenticator code');
        setIsLoading(false);
        return;
      }
      // Invalidate any stale auth cache from a prior session in this browser
      // so the next ProtectedRoute load uses *this* user, not the old one.
      if (window.__clearAuthCache) window.__clearAuthCache();
      // Seed the cache with the freshly authenticated user so the next
      // route hydrates instantly without an extra /auth/me round-trip.
      try { sessionStorage.setItem('mhu_user_cache', JSON.stringify(data)); } catch {}
      // If user came from a protected URL (e.g. /fe/:token), send them back there.
      if (nextUrl && nextUrl.startsWith('/')) {
        navigate(nextUrl, { replace: true });
        return;
      }
      const target = getRoleRedirect(data.role);
      navigate(target, { replace: true });
    } catch (error) {
      toast.error(typeof error.response?.data?.detail === 'string' ? error.response.data.detail : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (emailOverride = null) => {
    const emailToUse = (typeof emailOverride === 'string') ? emailOverride : selectedEmail;
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/auth/demo-login`, { email: emailToUse }, { withCredentials: true });
      const user = response.data;
      if (window.__clearAuthCache) window.__clearAuthCache();
      if (nextUrl && nextUrl.startsWith('/')) {
        navigate(nextUrl, { replace: true });
        return;
      }
      const target = getRoleRedirect(user.role);
      navigate(target, { replace: true });
    } catch (error) {
      toast.error(typeof error.response?.data?.detail === 'string' ? error.response.data.detail : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div data-testid="login-card">
        {/* Header / Branding */}
        <div className="mb-8">
          {branding.logo_url && (
            <img
              src={branding.logo_url}
              alt={branding.app_name}
              className="mb-6 h-16 w-auto max-w-[240px] object-contain object-left"
              data-testid="login-logo"
            />
          )}
          <p
            className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-strong ring-1 ring-inset ring-brand-200/70 dark:bg-brand-950/40 dark:ring-brand-800/60"
            data-testid="login-subtitle"
          >
            Powered by Drawlead
          </p>
          <h1
            className="text-[28px] font-semibold leading-tight tracking-tight text-foreground"
            data-testid="login-title"
          >
            {branding.app_name || 'Drawlead Construction ERP'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Welcome back. Sign in to continue to your workspace.</p>
        </div>

        <Tabs value={loginTab} onValueChange={setLoginTab}>
          <TabsList className={`grid h-11 w-full ${demoMode ? 'grid-cols-2' : 'grid-cols-1'}`} data-testid="login-tabs">
            <TabsTrigger value="password" className="h-9" data-testid="tab-password">Login</TabsTrigger>
            {demoMode && <TabsTrigger value="demo" className="h-9" data-testid="tab-demo">Demo Access</TabsTrigger>}
          </TabsList>

          {/* Password Login Tab */}
          <TabsContent value="password" className="mt-6 space-y-5">
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    data-testid="email-input"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs font-medium text-primary-strong hover:text-brand-800 hover:underline" data-testid="forgot-password-link">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    data-testid="password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl pl-10 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    data-testid="toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 2FA Code Field */}
              {needs2FA && (
                <div className="space-y-2.5 rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-800/60 dark:bg-brand-950/30" data-testid="2fa-login-section">
                  <Label className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-primary" /> Authenticator Code
                  </Label>
                  <Input
                    data-testid="totp-code-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-12 rounded-xl text-center font-mono text-xl tracking-[0.4em]"
                    autoFocus
                  />
                  <p className="text-center text-[11px] text-muted-foreground">Enter the 6-digit code from Google Authenticator</p>
                </div>
              )}

              <Button
                type="submit"
                data-testid="login-submit-btn"
                disabled={isLoading}
                className="h-11 w-full rounded-xl text-[15px]"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Only invited users can login. Contact your admin for access.
            </p>
          </TabsContent>

          {/* Demo Tab */}
          <TabsContent value="demo" className="mt-6">
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Demo Mode</p>

              <div className="space-y-3">
                <Select value={selectedEmail} onValueChange={setSelectedEmail}>
                  <SelectTrigger data-testid="demo-user-select" className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_USERS.map((user) => (
                      <SelectItem key={user.email} value={user.email}>
                        <span className="font-semibold">{user.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{user.email}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  data-testid="demo-login-btn"
                  onClick={() => handleDemoLogin()}
                  disabled={isLoading}
                  className="h-11 w-full rounded-xl text-[15px]"
                >
                  {isLoading ? 'Logging in...' : 'Login as Demo User'}
                </Button>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2.5 text-xs font-medium text-muted-foreground">Quick Access:</p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_USERS.map((quick) => (
                    <Button
                      key={quick.email}
                      data-testid={`quick-${quick.name.toLowerCase().replace(/\s/g, '-')}`}
                      variant="outline"
                      size="sm"
                      className="h-9 justify-start gap-2 rounded-lg px-2.5 text-xs font-medium hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                      onClick={() => handleDemoLogin(quick.email)}
                      disabled={isLoading}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[9px] font-bold text-brand-800 dark:bg-brand-900/60 dark:text-brand-200">
                        {quick.name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                      </span>
                      <span className="truncate">{quick.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthLayout>
  );
}
