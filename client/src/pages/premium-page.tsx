/**
 * PremiumPage
 * Premium subscription page for PADDOCK20
 */
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  LockKeyhole, 
  Star, 
  Shield, 
  CloudRain, 
  Gauge, 
  Car, 
  Calendar, 
  Trophy, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth, AuthRole } from '@/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: string;
  interval: string;
  features: string[];
  role: AuthRole;
  cta: string;
  popular?: boolean;
}

const PremiumPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Pricing tiers data
  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Driver',
      description: 'Basic access to the PADDOCK20 ecosystem',
      price: 'Free',
      interval: 'forever',
      role: AuthRole.DRIVER,
      features: [
        'Weather-based drive recommendations',
        'Basic vehicle management',
        'Drive journal (5 entries)',
        'Standard dashboard'
      ],
      cta: 'Current Plan'
    },
    {
      id: 'premium',
      name: 'Team Manager',
      description: 'Enhanced features for serious automotive enthusiasts',
      price: billingInterval === 'monthly' ? '$9.99' : '$99.99',
      interval: billingInterval === 'monthly' ? 'month' : 'year',
      role: AuthRole.TEAM_MANAGER,
      features: [
        'All Driver features',
        'Unlimited vehicles',
        'Unlimited drive journal entries',
        'Premium dashboard with advanced telemetry',
        'Podium Pursuit access',
        'Weather forecast optimization',
        'Maintenance schedule tracking',
        'Premium support'
      ],
      cta: 'Upgrade to Premium',
      popular: true
    },
    {
      id: 'team',
      name: 'Team Principal',
      description: 'Complete access for the ultimate automotive experience',
      price: billingInterval === 'monthly' ? '$19.99' : '$199.99',
      interval: billingInterval === 'monthly' ? 'month' : 'year',
      role: AuthRole.TEAM_PRINCIPAL,
      features: [
        'All Team Manager features',
        'Team management for multiple drivers',
        'Advanced analytics dashboard',
        'Priority feature access',
        'White-glove onboarding',
        'Dedicated account manager',
        'API access',
        'Custom branding options'
      ],
      cta: 'Upgrade to Team'
    }
  ];
  
  // Determine current tier based on user role
  const getCurrentTier = () => {
    if (!user) return 'free';
    
    switch (user.role) {
      case AuthRole.TEAM_MANAGER:
        return 'premium';
      case AuthRole.TEAM_PRINCIPAL:
        return 'team';
      default:
        return 'free';
    }
  };
  
  const currentTier = getCurrentTier();
  
  const handleSelectTier = (tierId: string) => {
    if (tierId === currentTier) {
      toast({
        title: 'Current Plan',
        description: 'You are already subscribed to this plan.',
        variant: 'default'
      });
      return;
    }
    
    setSelectedTier(tierId);
  };
  
  const handleUpgrade = async () => {
    if (!selectedTier || selectedTier === currentTier) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get role for selected tier
      const tier = pricingTiers.find(t => t.id === selectedTier);
      if (!tier) throw new Error('Invalid tier selected');
      
      // Update user role (in a real implementation, this would occur after successful payment)
      if (user) {
        await updateUser({ 
          role: tier.role,
          subscriptionTier: (selectedTier === 'free' ? 'free' : selectedTier === 'premium' ? 'premium' : 'team') as 'free' | 'premium' | 'team',
          // Set subscription expiration to 30 days from now (monthly) or 365 days (yearly)
          subscriptionExpiresAt: selectedTier === 'free' 
            ? null 
            : new Date(Date.now() + (billingInterval === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
        });
        
        toast({
          title: 'Subscription Updated',
          description: `You are now subscribed to the ${tier.name} plan. Enjoy your new benefits!`,
          variant: 'default'
        });
      }
      
      // Redirect to dashboard
      setLocation('/the-paddock');
    } catch (error) {
      toast({
        title: 'Subscription Error',
        description: 'There was an error processing your subscription. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-carolina-blue">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-carolina-blue"
              onClick={() => setLocation('/the-paddock')}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Paddock
            </Button>
            
            <h1 className="text-2xl font-bold text-white font-orbitron">
              PADDOCK<span className="text-gotime-green">20</span> <span className="text-amber-500">Premium</span>
            </h1>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-amber-600/20 rounded-full flex items-center justify-center">
                <Star className="h-10 w-10 text-amber-500" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white font-orbitron mb-4">
              Upgrade Your Driving Experience
            </h1>
            
            <p className="text-zinc-300 text-lg max-w-2xl mx-auto">
              Take your automotive journey to the next level with premium features 
              and exclusive access designed for true enthusiasts.
            </p>
          </div>
          
          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <Tabs 
              defaultValue="monthly" 
              value={billingInterval}
              onValueChange={(value) => setBillingInterval(value as 'monthly' | 'yearly')}
              className="w-full max-w-md"
            >
              <TabsList className="grid grid-cols-2 w-full bg-zinc-800 p-1">
                <TabsTrigger 
                  value="monthly"
                  className="data-[state=active]:bg-carolina-blue data-[state=active]:text-white"
                >
                  Monthly Billing
                </TabsTrigger>
                <TabsTrigger 
                  value="yearly"
                  className="data-[state=active]:bg-carolina-blue data-[state=active]:text-white"
                >
                  Yearly Billing <span className="ml-1 text-amber-500 text-xs">Save 15%</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Pricing tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <Card 
                key={tier.id}
                className={`bg-zinc-900 border ${
                  tier.popular 
                    ? 'border-amber-500' 
                    : tier.id === currentTier 
                      ? 'border-carolina-blue' 
                      : 'border-zinc-700'
                } relative`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 mt-4 mr-4">
                    <div className="bg-amber-600 text-white text-xs py-1 px-2 rounded-full font-medium">
                      Popular
                    </div>
                  </div>
                )}
                
                {tier.id === currentTier && (
                  <div className="absolute top-0 right-0 mt-4 mr-4">
                    <div className="bg-carolina-blue text-white text-xs py-1 px-2 rounded-full font-medium">
                      Current Plan
                    </div>
                  </div>
                )}
                
                <CardHeader>
                  <h3 className="text-xl font-bold text-white font-orbitron">
                    {tier.name}
                  </h3>
                  <p className="text-zinc-400 text-sm">{tier.description}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-white">
                      {tier.price}
                      <span className="text-zinc-400 text-sm font-normal">
                        /{tier.interval}
                      </span>
                    </p>
                  </div>
                  
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-gotime-green mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      tier.id === currentTier
                        ? 'bg-carolina-blue hover:bg-carolina-blue/90'
                        : tier.id === 'free'
                          ? 'bg-zinc-700 hover:bg-zinc-600'
                          : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                    disabled={tier.id === currentTier || isProcessing}
                    onClick={() => handleSelectTier(tier.id)}
                  >
                    {tier.id === currentTier 
                      ? 'Current Plan' 
                      : tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Upgrade button */}
          {selectedTier && selectedTier !== currentTier && (
            <div className="mt-10 text-center">
              <Button 
                size="lg" 
                className="bg-amber-600 hover:bg-amber-700 text-white px-8"
                onClick={handleUpgrade}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Star className="h-5 w-5 mr-2" />
                    Confirm Upgrade to {selectedTier === 'premium' ? 'Premium' : 'Team'}
                  </>
                )}
              </Button>
              <p className="text-zinc-400 text-sm mt-2">
                You will be upgraded immediately (demo mode).
              </p>
            </div>
          )}
          
          {/* Feature comparison */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-white font-orbitron mb-8 text-center">
              Premium Features Comparison
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-4 px-4 text-zinc-400">Feature</th>
                    <th className="text-center py-4 px-4 text-zinc-300">Driver</th>
                    <th className="text-center py-4 px-4 text-amber-500">Team Manager</th>
                    <th className="text-center py-4 px-4 text-carolina-blue">Team Principal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-800">
                    <td className="py-4 px-4 text-zinc-300 flex items-center">
                      <Car className="h-4 w-4 mr-2 text-zinc-500" />
                      Vehicle Management
                    </td>
                    <td className="text-center py-4 px-4 text-zinc-400">Basic (2 vehicles)</td>
                    <td className="text-center py-4 px-4 text-zinc-300">Unlimited</td>
                    <td className="text-center py-4 px-4 text-zinc-300">Unlimited + Teams</td>
                  </tr>
                  
                  <tr className="border-b border-zinc-800">
                    <td className="py-4 px-4 text-zinc-300 flex items-center">
                      <CloudRain className="h-4 w-4 mr-2 text-zinc-500" />
                      Weather Paddock
                    </td>
                    <td className="text-center py-4 px-4 text-zinc-400">Basic</td>
                    <td className="text-center py-4 px-4 text-zinc-300">Enhanced</td>
                    <td className="text-center py-4 px-4 text-zinc-300">Premium</td>
                  </tr>
                  
                  <tr className="border-b border-zinc-800">
                    <td className="py-4 px-4 text-zinc-300 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-zinc-500" />
                      Drive Journal
                    </td>
                    <td className="text-center py-4 px-4 text-zinc-400">Limited (5)</td>
                    <td className="text-center py-4 px-4 text-zinc-300">Unlimited</td>
                    <td className="text-center py-4 px-4 text-zinc-300">Unlimited + Analytics</td>
                  </tr>
                  
                  <tr className="border-b border-zinc-800">
                    <td className="py-4 px-4 text-zinc-300 flex items-center">
                      <Gauge className="h-4 w-4 mr-2 text-zinc-500" />
                      Performance Analytics
                    </td>
                    <td className="text-center py-4 px-4 text-zinc-400">Basic</td>
                    <td className="text-center py-4 px-4 text-zinc-300">Advanced</td>
                    <td className="text-center py-4 px-4 text-zinc-300">Professional</td>
                  </tr>
                  
                  <tr className="border-b border-zinc-800">
                    <td className="py-4 px-4 text-zinc-300 flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-zinc-500" />
                      Podium Pursuit
                    </td>
                    <td className="text-center py-4 px-4 text-zinc-400">❌</td>
                    <td className="text-center py-4 px-4 text-amber-500">✓</td>
                    <td className="text-center py-4 px-4 text-carolina-blue">✓</td>
                  </tr>
                  
                  <tr className="border-b border-zinc-800">
                    <td className="py-4 px-4 text-zinc-300 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-zinc-500" />
                      Admin Features
                    </td>
                    <td className="text-center py-4 px-4 text-zinc-400">❌</td>
                    <td className="text-center py-4 px-4 text-zinc-400">❌</td>
                    <td className="text-center py-4 px-4 text-carolina-blue">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* FAQ */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-white font-orbitron mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-2">
                  Can I upgrade or downgrade anytime?
                </h3>
                <p className="text-zinc-400">
                  Yes, you can change your subscription tier at any time. When upgrading, the new 
                  features will be available immediately. When downgrading, your current plan 
                  will remain active until the end of your billing period.
                </p>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-2">
                  What payment methods are accepted?
                </h3>
                <p className="text-zinc-400">
                  We accept all major credit cards, Apple Pay, Google Pay, and PayPal. 
                  All payments are processed securely through our payment provider.
                </p>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-2">
                  Is there a free trial for premium features?
                </h3>
                <p className="text-zinc-400">
                  We offer a 7-day free trial for new premium subscribers. You can cancel anytime 
                  during the trial period and you won't be charged.
                </p>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-2">
                  How do I cancel my subscription?
                </h3>
                <p className="text-zinc-400">
                  You can cancel your subscription at any time from your account settings. 
                  Your premium access will remain active until the end of your current billing period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;