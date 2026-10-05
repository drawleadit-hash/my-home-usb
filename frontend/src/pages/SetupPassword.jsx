import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/AuthLayout';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SetupPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); setError('No invitation token'); return; }
    const verify = async () => {
      try {
        const res = await axios.get(`${API}/auth/verify-invitation/${token}`);
        setInviteData(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Invalid invitation link');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setIsSubmitting(true);
    try {
      await axios.post(`${API}/auth/setup-password`, { token, name: name.trim(), password });
      setDone(true);
      toast.success('Account setup complete!');
    } catch (err) {
      toast.error(typeof err.response?.data?.detail === 'string' ? err.response.data.detail : 'Setup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      </AuthLayout>
    );
  }

  if (error || !token) {
    return (
      <AuthLayout>
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <p className="font-semibold">Invalid Invitation</p>
            <p className="text-sm text-muted-foreground">{error || 'This link is invalid or has expired.'}</p>
            <p className="text-xs text-muted-foreground">Contact your administrator for a new invitation.</p>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="border-0 bg-transparent shadow-none" data-testid="setup-password-card">
        <CardHeader className="px-0 pb-6 pt-0">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 ring-1 ring-inset ring-brand-200 dark:bg-brand-950/40 dark:ring-brand-800/60">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-[28px] font-semibold tracking-tight">Set Up Your Account</CardTitle>
          <CardDescription>
            {inviteData?.invited_by_name} invited you as {inviteData?.role?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {done ? (
            <div className="text-center space-y-4" data-testid="setup-success">
              <CheckCircle className="mx-auto h-14 w-14 text-primary" />
              <p className="font-semibold">Account Ready!</p>
              <p className="text-sm text-muted-foreground">Your account has been set up. You can now login.</p>
              <Link to="/login"><Button className="h-11 w-full rounded-xl text-[15px]" data-testid="goto-login-btn">Go to Login</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-xl bg-brand-50 p-3 text-center ring-1 ring-inset ring-brand-200/70 dark:bg-brand-950/40 dark:ring-brand-800/60">
                <p className="text-sm text-muted-foreground">Setting up account for</p>
                <p className="font-semibold">{inviteData?.email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Your Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    data-testid="setup-name-input"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    data-testid="setup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    data-testid="setup-confirm-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 rounded-xl pl-10"
                    required
                    minLength={8}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button type="submit" data-testid="setup-submit-btn" disabled={isSubmitting} className="h-11 w-full rounded-xl text-[15px]">
                {isSubmitting ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
