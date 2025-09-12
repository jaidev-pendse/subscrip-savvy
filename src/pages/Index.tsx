import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Bell, 
  PieChart,
  Smartphone,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'Visualize your spending patterns with beautiful charts and insights.',
    },
    {
      icon: Bell,
      title: 'Payment Reminders',
      description: 'Never miss a payment with customizable notifications and alerts.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and protected with bank-level security.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Perfect experience on all devices with responsive design.',
    },
  ];

  const benefits = [
    'Track unlimited subscriptions',
    'Multi-currency support',
    'Category-based organization',
    'Spending trend analysis',
    'Payment date notifications',
    'Dark mode support',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-primary p-2 rounded-xl shadow-premium">
              <CreditCard className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SubscripSavvy
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost" className="transition-smooth">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-premium">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit">
                <Star className="h-3 w-3 mr-1" />
                Financial Management Made Easy
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Take Control of Your{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Subscriptions
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Never lose track of your recurring payments again. SubscripSavvy helps you monitor, 
                analyze, and optimize your subscription spending with beautiful insights and timely reminders.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth" className="flex-1 sm:flex-initial">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 transition-smooth shadow-premium text-lg px-8"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="transition-smooth text-lg px-8"
              >
                <PieChart className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-primary">$2,400</div>
                <p className="text-muted-foreground">Average yearly savings</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">50k+</div>
                <p className="text-muted-foreground">Subscriptions tracked</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-3xl blur-3xl"></div>
            <img
              src={heroImage}
              alt="Subscription management dashboard"
              className="relative z-10 rounded-3xl shadow-card w-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Manage Subscriptions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to give you complete control over your recurring expenses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gradient-card shadow-card border-0 hover:shadow-premium transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-primary p-3 rounded-2xl w-fit mx-auto mb-4 shadow-premium">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-card rounded-3xl p-12 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Choose{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  SubscripSavvy?
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of users who have taken control of their subscription spending 
                and saved money with our comprehensive tracking solution.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-primary p-8 rounded-3xl shadow-premium mb-8">
                <CreditCard className="h-16 w-16 text-primary-foreground mx-auto mb-4" />
                <div className="text-primary-foreground">
                  <div className="text-4xl font-bold">100%</div>
                  <div className="text-lg opacity-90">Free to Start</div>
                </div>
              </div>
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-premium text-lg px-8"
                >
                  Create Your Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-primary p-2 rounded-xl shadow-premium">
              <CreditCard className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SubscripSavvy
            </h3>
          </div>
          <p className="text-muted-foreground">
            Take control of your subscriptions. Built with ❤️ for smart spenders.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;