import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CreditCard, 
  Plus, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  LogOut, 
  Settings, 
  PieChart,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  Image as ImageIcon,
  Tv,
  Music,
  Cloud,
  Gamepad2,
  Code,
  Zap,
  Mail,
  Phone,
  FileText,
  Shield,
  Globe,
  Users,
  Camera,
  Video,
  Headphones,
  Cpu,
  Database,
  Monitor,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AddSubscriptionDialog } from '@/components/AddSubscriptionDialog';
import { EditSubscriptionDialog } from '@/components/EditSubscriptionDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Subscription {
  id: string;
  name: string;
  cost: number;
  currency: string;
  billing_cycle: string;
  category: string;
  next_payment_date: string;
  is_active: boolean;
  description?: string;
  icon_url?: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  default_currency: string;
}

const presetIcons = {
  'netflix': Tv,
  'spotify': Music,
  'youtube': Video,
  'prime': Tv,
  'disney': Tv,
  'hulu': Tv,
  'apple-music': Headphones,
  'dropbox': Cloud,
  'google-drive': Cloud,
  'adobe': Code,
  'figma': Code,
  'github': Code,
  'slack': Mail,
  'zoom': Video,
  'office365': FileText,
  'notion': FileText,
  'trello': Calendar,
  'steam': Gamepad2,
  'xbox': Gamepad2,
  'playstation': Gamepad2,
  'aws': Database,
  'vercel': Globe,
  'mailchimp': Mail,
  'canva': Camera,
};

const currencies = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹', 'CAD': 'C$',
  'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'SEK': 'kr', 'NZD': 'NZ$',
  'MXN': '$', 'SGD': 'S$', 'HKD': 'HK$', 'NOK': 'kr', 'KRW': '₩',
  'TRY': '₺', 'RUB': '₽', 'BRL': 'R$', 'ZAR': 'R', 'PLN': 'zł'
};

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    streaming: Tv,
    music: Headphones,
    software: Code,
    communication: Mail,
    gaming: Gamepad2,
    cloud: Cloud,
    design: Camera,
    productivity: FileText,
    finance: DollarSign,
    security: Shield,
    other: Globe,
  };
  
  const IconComponent = iconMap[category.toLowerCase()] || Globe;
  return <IconComponent className="h-5 w-5 text-primary" />;
};

const Dashboard = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate]);

  // Refresh data when returning from settings
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchProfile();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // Listen for instant profile updates (e.g., avatar/currency changes)
  useEffect(() => {
    const handler = (e: any) => {
      const updated = e.detail as Profile;
      setProfile(updated);
    };
    window.addEventListener('profile-updated' as any, handler as any);
    return () => window.removeEventListener('profile-updated' as any, handler as any);
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchSubscriptions(), fetchProfile()]);
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('next_payment_date', { ascending: true });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      toast({
        title: 'Error loading subscriptions',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderSubscriptionIcon = (subscription: Subscription) => {
    if (subscription.icon_url) {
      if (subscription.icon_url.startsWith('http')) {
        return (
          <img 
            src={subscription.icon_url} 
            alt={subscription.name} 
            className="h-8 w-8 rounded object-cover"
          />
        );
      } else {
        const IconComponent = presetIcons[subscription.icon_url as keyof typeof presetIcons] || CreditCard;
        return <IconComponent className="h-6 w-6 text-primary" />;
      }
    }
    return <CreditCard className="h-6 w-6 text-primary" />;
  };

  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast({
        title: 'Subscription deleted',
        description: 'Your subscription has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error deleting subscription',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const currencySymbol = currencies[profile?.default_currency as keyof typeof currencies] || '$';

  // Calculate statistics
  const totalMonthly = subscriptions
    .filter(sub => sub.billing_cycle === 'monthly')
    .reduce((sum, sub) => sum + sub.cost, 0);

  const totalYearly = subscriptions
    .filter(sub => sub.billing_cycle === 'yearly')
    .reduce((sum, sub) => sum + sub.cost, 0);

  const monthlyEquivalent = totalMonthly + (totalYearly / 12);
  const yearlyEquivalent = (totalMonthly * 12) + totalYearly;

  const exportPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Subscriptions Report', 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`User: ${profile?.full_name || user?.email || ''}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Monthly total: ${currencySymbol}${monthlyEquivalent.toFixed(2)}`, 14, 42);
    doc.text(`Yearly total: ${currencySymbol}${yearlyEquivalent.toFixed(2)}`, 90, 42);

    autoTable(doc, {
      startY: 50,
      head: [['Name', 'Category', 'Billing', 'Cost', 'Next Payment']],
      body: subscriptions.map((s) => [
        s.name,
        s.category,
        s.billing_cycle,
        `${currencySymbol}${Number(s.cost).toFixed(2)}`,
        new Date(s.next_payment_date).toLocaleDateString(),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: 'striped',
    });

    doc.save(`subscriptions_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  const upcomingPayments = subscriptions
    .filter(sub => {
      const paymentDate = new Date(sub.next_payment_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return paymentDate <= thirtyDaysFromNow;
    })
    .sort((a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime());

  // Category breakdown
  const categorySpending = subscriptions.reduce((acc, sub) => {
    const monthlyAmount = sub.billing_cycle === 'yearly' ? sub.cost / 12 : sub.cost;
    acc[sub.category] = (acc[sub.category] || 0) + monthlyAmount;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-primary p-2 rounded-xl shadow-premium">
              <CreditCard className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">SubscripSavvy</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {profile?.full_name || user?.email}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={exportPdf}
              variant="outline"
              className="transition-smooth"
              disabled={subscriptions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-premium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card border-0" style={{ background: '#3E1E68' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Monthly Total</CardTitle>
              <DollarSign className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currencySymbol}{monthlyEquivalent.toFixed(2)}</div>
              <p className="text-xs text-white/70">
                Per month average
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0" style={{ background: '#5D2F77' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Yearly Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currencySymbol}{yearlyEquivalent.toFixed(2)}</div>
              <p className="text-xs text-white/70">
                Annual spending
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0" style={{ background: '#E45A92' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{subscriptions.length}</div>
              <p className="text-xs text-white/70">
                Services tracked
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0" style={{ background: '#FFACAC' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Upcoming Payments</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{upcomingPayments.length}</div>
              <p className="text-xs text-gray-600">
                Next 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Payments */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card shadow-card border-0 h-[500px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Payments
                  </div>
                  {upcomingPayments.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllPayments(!showAllPayments)}
                      className="h-auto p-1"
                    >
                      {showAllPayments ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Your next subscription renewals
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {upcomingPayments.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-center">
                      No upcoming payments in the next 30 days
                    </p>
                  </div>
                ) : (
                  <div className="h-full">
                    {/* First 2 items always visible */}
                    <div className="space-y-4 mb-4">
                      {upcomingPayments.slice(0, 2).map((subscription) => {
                        const daysUntil = Math.ceil(
                          (new Date(subscription.next_payment_date).getTime() - new Date().getTime()) / 
                          (1000 * 60 * 60 * 24)
                        );
                        
                        return (
                          <div key={subscription.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shadow-sm">
                                {renderSubscriptionIcon(subscription)}
                              </div>
                              <div>
                                <p className="font-medium">{subscription.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{currencySymbol}{subscription.cost}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {subscription.billing_cycle}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Scrollable area for remaining items */}
                    {upcomingPayments.length > 2 && showAllPayments && (
                      <ScrollArea className="h-[240px]">
                        <div className="space-y-4 pr-4">
                          {upcomingPayments.slice(2).map((subscription) => {
                            const daysUntil = Math.ceil(
                              (new Date(subscription.next_payment_date).getTime() - new Date().getTime()) / 
                              (1000 * 60 * 60 * 24)
                            );
                            
                            return (
                              <div key={subscription.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shadow-sm">
                                    {renderSubscriptionIcon(subscription)}
                                  </div>
                                  <div>
                                    <p className="font-medium">{subscription.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">{currencySymbol}{subscription.cost}</p>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {subscription.billing_cycle}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <div>
            <Card className="bg-gradient-card shadow-card border-0 h-[500px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Category Breakdown
                </CardTitle>
                <CardDescription>
                  Monthly spending by category
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {Object.keys(categorySpending).length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-center">
                      No subscriptions to analyze
                    </p>
                  </div>
                ) : (
                  <div className="h-full">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-4">
                        {Object.entries(categorySpending)
                          .sort(([,a], [,b]) => b - a)
                          .map(([category, amount]) => {
                            const percentage = (amount / monthlyEquivalent) * 100;
                            const categoryIcon = getCategoryIcon(category);
                            return (
                              <div key={category} className="p-4 rounded-lg bg-secondary/50 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      {categoryIcon}
                                    </div>
                                    <div>
                                      <p className="font-medium capitalize">{category}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {percentage.toFixed(1)}% of total
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{currencySymbol}{amount.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">per month</p>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Progress 
                                    value={percentage} 
                                    className="h-2 bg-secondary" 
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Subscriptions */}
        <Card className="mt-8 bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
            <CardDescription>
              Manage your active subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No subscriptions yet</p>
                <p className="text-muted-foreground mb-4">
                  Add your first subscription to start tracking your expenses
                </p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-premium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subscription
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptions.map((subscription) => (
                  <Card key={subscription.id} className="border bg-secondary/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                            {renderSubscriptionIcon(subscription)}
                          </div>
                          <div>
                            <CardTitle className="text-base">{subscription.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {subscription.category}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingSubscription(subscription); setShowEditDialog(true); }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteSubscription(subscription.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                         <div className="flex justify-between items-center">
                           <span className="text-2xl font-bold">{currencySymbol}{subscription.cost}</span>
                           <Badge>{subscription.billing_cycle}</Badge>
                         </div>
                        <p className="text-sm text-muted-foreground">
                          Next payment: {new Date(subscription.next_payment_date).toLocaleDateString()}
                        </p>
                        {subscription.description && (
                          <p className="text-sm text-muted-foreground">{subscription.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddSubscriptionDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSubscriptionAdded={fetchSubscriptions}
      />

      <EditSubscriptionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        subscription={editingSubscription}
        onSubscriptionUpdated={fetchSubscriptions}
      />
    </div>
  );
};

export default Dashboard;