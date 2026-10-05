import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/AuthLayout';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <AuthLayout>
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <p className="font-semibold">Invalid Reset Link</p>
            <p className="text-sm text-muted-foreground">This link is invalid or has expired.</p>
            <Link to="/forgot-password"><Button variant="outline">Request New Link</Button></Link>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setIsLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { token, new_password: password });
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error(typeof error.response?.data?.detail === 'string' ? error.response.data.detail : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="border-0 bg-transparent shadow-none" data-testid="reset-password-card">
        <CardHeader className="px-0 pb-6 pt-0">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 ring-1 ring-inset ring-brand-200 dark:bg-brand-950/40 dark:ring-brand-800/60">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-[28px] font-semibold tracking-tight">Set New Password</CardTitle>
          <CardDescription>Choose a strong password for your account</CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {done ? (
            <div className="text-center space-y-4" data-testid="reset-success">
              <CheckCircle className="mx-auto h-14 w-14 text-primary" />
              <p className="font-semibold">Password Reset Complete!</p>
              <Link to="/login"><Button className="h-11 w-full rounded-xl text-[15px]" data-testid="goto-login-btn">Go to Login</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    data-testid="new-password-input"
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
                    data-testid="confirm-password-input"
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

              <Button type="submit" data-testid="reset-submit-btn" disabled={isLoading} className="h-11 w-full rounded-xl text-[15px]">
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
