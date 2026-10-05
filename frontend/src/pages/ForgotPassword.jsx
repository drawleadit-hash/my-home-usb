import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/AuthLayout';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setIsLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSent(true);
    } catch (error) {
      toast.error(typeof error.response?.data?.detail === 'string' ? error.response.data.detail : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="border-0 bg-transparent shadow-none" data-testid="forgot-password-card">
        <CardHeader className="px-0 pb-6 pt-0">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 ring-1 ring-inset ring-brand-200 dark:bg-brand-950/40 dark:ring-brand-800/60">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-[28px] font-semibold tracking-tight">Reset Password</CardTitle>
          <CardDescription>
            {sent ? 'Check your email for the reset link' : 'Enter your email to receive a reset link'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {sent ? (
            <div className="text-center space-y-4" data-testid="reset-sent-message">
              <CheckCircle className="mx-auto h-14 w-14 text-primary" />
              <p className="text-sm text-muted-foreground">
                If an account exists with <strong>{email}</strong>, we've sent a password reset link. Check your inbox.
              </p>
              <p className="text-xs text-muted-foreground">
                Don't see it? Check your spam folder. If you still can't find it, contact your administrator.
              </p>
              <Link to="/login">
                <Button variant="outline" className="mt-4" data-testid="back-to-login-btn">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    data-testid="forgot-email-input"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" data-testid="send-reset-btn" disabled={isLoading} className="h-11 w-full rounded-xl text-[15px]">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-primary hover:underline" data-testid="back-link">
                  <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
