import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import MobileBottomNav from '../components/MobileBottomNav';
import {
  Wallet,
  LogOut,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Briefcase,
  Calculator,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Coins,
  Shield,
  Eye,
  Plus,
  RefreshCw
} from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { SummaryCard, ChannelCard } from '../components/SummaryCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AccountantDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectFinancials, setProjectFinancials] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const [userRes, dashboardRes, projectsRes] = await Promise.all([
        axios.get(`${API}/auth/me`),
        axios.get(`${API}/accountant/comprehensive-dashboard`),
        axios.get(`${API}/projects`)
      ]);
      
      if (!['accountant', 'super_admin'].includes(userRes.data.role)) {
        toast.error('Access denied. Only Accounts can access this page.');
        window.location.href = '/dashboard';
        return;
      }
      
      setUser(userRes.data);
      setDashboard(dashboardRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectFinancials = async (projectId) => {
    try {
      const res = await axios.get(`${API}/accountant/project-financials/${projectId}`);
      setProjectFinancials(res.data);
      setSelectedProject(projectId);
    } catch (error) {
      toast.error('Failed to fetch project financials');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    }
    window.location.href = '/login';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatLargeNumber = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return formatCurrency(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-lg font-semibold text-gray-700">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const incomeByMethod = dashboard?.income_by_method || {};
  const projectFinancialsList = dashboard?.project_financials || [];
  const hrSummary = dashboard?.hr_summary || {};
  const chequeSummary = dashboard?.cheque_summary || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <AppHeader user={user} />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {/* Summary Cards - Financial Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            label="Total Income"
            value={formatLargeNumber(summary.total_income)}
            sub="All projects combined"
            icon={TrendingUp}
            tone="positive"
            testId="total-income-card"
          />
          <SummaryCard
            label="Total Expense"
            value={formatLargeNumber(summary.total_expense)}
            sub="Material + Labour + Services"
            icon={TrendingDown}
            tone="negative"
            testId="total-expense-card"
          />
          <SummaryCard
            label="Net Profit"
            value={<span className={summary.total_profit < 0 ? 'text-red-600' : ''}>{formatLargeNumber(summary.total_profit)}</span>}
            sub={`Margin: ${summary.profit_margin || 0}%`}
            icon={PieChart}
            tone={summary.total_profit >= 0 ? 'positive' : 'negative'}
            testId="total-profit-card"
          />
          <SummaryCard
            label="Pending Requests"
            value={dashboard?.pending_payment_requests || 0}
            sub="Require action"
            icon={Clock}
            tone="warning"
            testId="pending-requests-card"
          />
        </div>

        {/* Income by Payment Method */}
        <Card className="mb-6" data-testid="income-by-method-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-600" />
              Income by Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <ChannelCard label="Cash" dot="bg-violet-500" value={formatLargeNumber(incomeByMethod.cash || 0)} />
              <ChannelCard label="Cheque" dot="bg-ink-700" value={formatLargeNumber(incomeByMethod.cheque || 0)} />
              <ChannelCard label="Bank Transfer" dot="bg-primary" value={formatLargeNumber(incomeByMethod.bank_transfer || 0)} />
              <ChannelCard label="Escrow" dot="bg-blue-500" value={formatLargeNumber(incomeByMethod.upi || 0)} />
              <ChannelCard label="Credit Card" dot="bg-orange-500" value={formatLargeNumber(incomeByMethod.credit_card || 0)} />
            </div>
          </CardContent>
        </Card>

        {/* HR & Cheque Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* HR Summary */}
          <Card data-testid="hr-summary-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                HR & Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-violet-700">{hrSummary.total_staff || 0}</p>
                  <p className="text-sm text-violet-600">Total Staff</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{hrSummary.pending_payroll || 0}</p>
                  <p className="text-sm text-orange-500">Pending Payroll</p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary-hover"
                  onClick={() => window.location.href = '/hr-portal'}
                >
                  <Users className="h-4 w-4 mr-1" /> Manage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cheque Summary */}
          <Card data-testid="cheque-summary-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Cheque Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-amber-700">{chequeSummary.pending_cheques || 0}</p>
                  <p className="text-sm text-amber-600">Pending Cheques</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">{chequeSummary.bounced_cheques || 0}</p>
                  <p className="text-sm text-red-500">Bounced</p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-secondary hover:bg-secondary/90"
                  onClick={() => window.location.href = '/cheque-management'}
                >
                  <FileText className="h-4 w-4 mr-1" /> View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project-wise Financials */}
        <Card data-testid="project-financials-card">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Project-wise Income & Expense
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">PROJECT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">CLIENT</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">PROJECT VALUE</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 text-green-600">INCOME</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 text-red-600">EXPENSE</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">PROFIT</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">MARGIN</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {projectFinancialsList.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No project data available
                      </td>
                    </tr>
                  ) : (
                    projectFinancialsList.map((proj) => (
                      <tr key={proj.project_id} className="hover:bg-gray-50" data-testid={`project-row-${proj.project_id}`}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{proj.project_name}</p>
                            {proj.project_code && (
                              <p className="text-xs text-gray-500">{proj.project_code}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{proj.client_name}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(proj.total_value)}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-green-600">{formatCurrency(proj.income)}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{formatCurrency(proj.expense)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-bold ${proj.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(proj.profit)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge 
                            variant="outline" 
                            className={`${proj.profit_margin >= 20 ? 'bg-green-100 text-green-700 border-green-300' : 
                              proj.profit_margin >= 10 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 
                              proj.profit_margin >= 0 ? 'bg-orange-100 text-orange-700 border-orange-300' : 
                              'bg-red-100 text-red-700 border-red-300'}`}
                          >
                            {proj.profit_margin}%
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => fetchProjectFinancials(proj.project_id)}
                            data-testid={`view-details-${proj.project_id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        {dashboard?.recent_transactions?.length > 0 && (
          <Card className="mt-6" data-testid="recent-transactions-card">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {dashboard.recent_transactions.map((txn, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${txn.transaction_type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {txn.transaction_type === 'income' ? 
                          <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-sm">{txn.party_name || txn.description || 'Transaction'}</p>
                        <p className="text-xs text-gray-500">{txn.category || txn.transaction_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${txn.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.transaction_type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(txn.payment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <Button 
            className="bg-primary hover:bg-primary-hover h-auto py-4 flex-col gap-2"
            onClick={() => window.location.href = '/income'}
            data-testid="quick-income-btn"
          >
            <IndianRupee className="h-6 w-6" />
            <span>Record Income</span>
          </Button>
          
          <Button 
            className="bg-secondary hover:bg-secondary/90 h-auto py-4 flex-col gap-2"
            onClick={() => window.location.href = '/expense-management'}
            data-testid="quick-expense-btn"
          >
            <Receipt className="h-6 w-6" />
            <span>View Expenses</span>
          </Button>
          
          <Button 
            className="bg-primary hover:bg-primary-hover h-auto py-4 flex-col gap-2"
            onClick={() => window.location.href = '/indirect-costs'}
            data-testid="quick-indirect-btn"
          >
            <Building2 className="h-6 w-6" />
            <span>Indirect Costs</span>
          </Button>
          
          <Button 
            className="bg-orange-600 hover:bg-orange-700 h-auto py-4 flex-col gap-2"
            onClick={() => window.location.href = '/suspense-account'}
            data-testid="quick-suspense-btn"
          >
            <AlertTriangle className="h-6 w-6" />
            <span>Suspense A/C</span>
          </Button>
          
          <Button 
            className="bg-pink-600 hover:bg-pink-700 h-auto py-4 flex-col gap-2"
            onClick={() => window.location.href = '/hr-portal'}
            data-testid="quick-payroll-btn"
          >
            <Briefcase className="h-6 w-6" />
            <span>HR & Payroll</span>
          </Button>
          
          <Button 
            className="bg-primary hover:bg-primary-hover h-auto py-4 flex-col gap-2"
            onClick={() => window.location.href = '/accounts-board'}
            data-testid="quick-approvals-btn"
          >
            <CheckCircle className="h-6 w-6" />
            <span>Approvals</span>
          </Button>
        </div>
      </div>

      {/* Project Financial Details Dialog */}
      <Dialog open={!!projectFinancials} onOpenChange={() => setProjectFinancials(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              {projectFinancials?.project?.name} - Financial Details
            </DialogTitle>
          </DialogHeader>
          
          {projectFinancials && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-green-600">Total Income</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(projectFinancials.income?.total || 0)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-red-600">Total Expense</p>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(projectFinancials.expenses?.grand_total || 0)}</p>
                  </CardContent>
                </Card>
                <Card className={`${projectFinancials.profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
                  <CardContent className="p-4 text-center">
                    <p className={`text-sm ${projectFinancials.profit >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>Net Profit</p>
                    <p className={`text-2xl font-bold ${projectFinancials.profit >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                      {formatCurrency(projectFinancials.profit)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Expense Breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-xs text-amber-600">Material</p>
                      <p className="text-lg font-bold text-amber-700">{formatCurrency(projectFinancials.expenses?.material?.total || 0)}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600">Labour</p>
                      <p className="text-lg font-bold text-green-700">{formatCurrency(projectFinancials.expenses?.labour?.total || 0)}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-purple-600">Vendor Services</p>
                      <p className="text-lg font-bold text-purple-700">{formatCurrency(projectFinancials.expenses?.vendor?.total || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              {projectFinancials.transactions?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y max-h-60 overflow-y-auto">
                      {projectFinancials.transactions.slice(0, 10).map((txn, idx) => (
                        <div key={idx} className="py-2 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{txn.description || txn.party_name}</p>
                            <p className="text-xs text-gray-500">{new Date(txn.payment_date).toLocaleDateString()}</p>
                          </div>
                          <span className={`font-bold ${txn.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(txn.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectFinancials(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <MobileBottomNav user={user} />
    </div>
  );
}
