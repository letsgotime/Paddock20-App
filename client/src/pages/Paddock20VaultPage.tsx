import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Star, Award, Calendar, Map, Wrench, HeartHandshake, 
  Check, X, ChevronRight, Crown, Clock, Gift, Info, 
  DollarSign, TrendingUp, Briefcase, Trophy, Zap,
  Car, Watch, Camera, Flag, Bookmark
} from 'lucide-react';
import ExportOptions from '../components/ExportOptions';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  idealFor: string;
  features: {
    name: string;
    included: boolean;
    tooltip?: string;
  }[];
  highlight: boolean;
  color: string;
  icon: React.ReactNode;
}

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  role: string;
  content: string;
  tier: string;
}

const Paddock20VaultPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [showFAQ, setShowFAQ] = useState<number | null>(null);

  const membershipTiers: MembershipTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingPeriod === 'month' ? 47 : 499,
      period: billingPeriod,
      description: 'Entry-level access to the Paddock20 ecosystem for automotive enthusiasts.',
      idealFor: 'Entry-point flippers, culture-first members',
      features: [
        { name: 'Flip Forecasts™', included: true, tooltip: 'Get insights on potential flips and market trends' },
        { name: 'Community Chat Access', included: true, tooltip: 'Connect with other enthusiasts' },
        { name: 'Early Event Access', included: true, tooltip: 'Be first to know about upcoming events' },
        { name: 'Basic Vehicle Tracking', included: true, tooltip: 'Track up to 3 vehicles' },
        { name: 'Concierge Inquiries', included: true, tooltip: '1 concierge inquiry per quarter' },
        { name: 'Priority Vault Briefs™', included: false },
        { name: 'Redline Prep Tools', included: false },
        { name: 'Flip Concierge', included: false },
        { name: 'Deal Previews', included: false },
        { name: 'Gifting Concierge', included: false },
      ],
      highlight: false,
      color: 'blue',
      icon: <Shield className="h-8 w-8 text-blue-500" />
    },
    {
      id: 'champion',
      name: 'Champion',
      price: billingPeriod === 'month' ? 147 : 1499,
      period: billingPeriod,
      description: 'Enhanced features for active buyers and resale-focused collectors.',
      idealFor: 'Active buyers, resale-focused collectors',
      features: [
        { name: 'Flip Forecasts™', included: true, tooltip: 'Enhanced flip forecasts with ROI estimates' },
        { name: 'Community Chat Access', included: true, tooltip: 'Premium chat with notifications' },
        { name: 'Early Event Access', included: true, tooltip: '48-hour early access to events' },
        { name: 'Advanced Vehicle Tracking', included: true, tooltip: 'Track up to 10 vehicles with detailed history' },
        { name: 'Concierge Inquiries', included: true, tooltip: 'Unlimited concierge inquiries' },
        { name: 'Priority Vault Briefs™', included: true, tooltip: 'Get detailed briefings on exclusive assets' },
        { name: 'Redline Prep Tools', included: true, tooltip: 'Tools to prepare your assets for maximum value' },
        { name: 'Flip Concierge', included: true, tooltip: 'Personal assistance with asset flips' },
        { name: 'Deal Previews', included: false },
        { name: 'Gifting Concierge', included: false },
      ],
      highlight: true,
      color: 'green',
      icon: <Star className="h-8 w-8 text-green-500" />
    },
    {
      id: 'mogul',
      name: 'Mogul',
      price: billingPeriod === 'month' ? 447 : 4799,
      period: billingPeriod,
      description: 'The ultimate Paddock20 experience for high-frequency traders and sponsors.',
      idealFor: 'High-frequency traders, proxy buyers, sponsors',
      features: [
        { name: 'Flip Forecasts™', included: true, tooltip: 'Elite-level market intelligence and ROI predictions' },
        { name: 'Community Chat Access', included: true, tooltip: 'VIP chat with priority responses' },
        { name: 'Early Event Access', included: true, tooltip: '1-week early access to all events' },
        { name: 'Unlimited Vehicle Tracking', included: true, tooltip: 'No limit on vehicles with complete history' },
        { name: 'Concierge Inquiries', included: true, tooltip: 'Priority 24/7 concierge access' },
        { name: 'Priority Vault Briefs™', included: true, tooltip: 'Exclusive asset intelligence and market analysis' },
        { name: 'Redline Prep Tools', included: true, tooltip: 'Full suite of premium resale optimization tools' },
        { name: 'Flip Concierge', included: true, tooltip: 'White-glove flip assistance with market positioning' },
        { name: 'Deal Previews', included: true, tooltip: 'First access to off-market opportunities' },
        { name: 'Gifting Concierge', included: true, tooltip: 'Luxury gifting service for automotive assets' },
      ],
      highlight: false,
      color: 'purple',
      icon: <Crown className="h-8 w-8 text-purple-500" />
    }
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Alex Parker',
      avatar: '/assets/avatars/avatar-1.jpg',
      role: 'Ferrari F8 Tributo Owner',
      content: 'The Paddock20 Champion tier has transformed how I manage my collection. The flip concierge helped me source a limited-edition Porsche at below market value.',
      tier: 'Champion'
    },
    {
      id: 2,
      name: 'Morgan Chase',
      avatar: '/assets/avatars/avatar-2.jpg',
      role: 'Car Collection Curator',
      content: 'As someone managing multiple high-value vehicles, the Mogul membership pays for itself. I have flipped three assets this year with an average 22% ROI.',
      tier: 'Mogul'
    },
    {
      id: 3,
      name: 'Jamie Rivera',
      avatar: '/assets/avatars/avatar-3.jpg',
      role: 'Weekend Enthusiast',
      content: 'Started with the Starter tier just to explore, and the Flip Forecasts alone helped me time the market perfectly on my first Porsche purchase. The community is incredible.',
      tier: 'Starter'
    }
  ];

  const faqs = [
    {
      question: 'What is the Paddock20 approach to asset flipping?',
      answer: 'Paddock20 specializes in strategic automotive asset management, helping members capitalize on market opportunities, timing, and presentation. Our Flip Forecasts™ provide market intelligence, while our concierge services help position your assets for maximum return.'
    },
    {
      question: 'How does the Vault Credit™ system work?',
      answer: 'Vault Credits are earned through successful flips (2% of margin), referrals ($200 per closed referral), and various other member activities. These credits can be applied toward concierge fees, deal previews, white-glove delivery services, and custom asset sourcing.'
    },
    {
      question: 'What is the Redline feature and how do I access it?',
      answer: 'Redline is our premium media platform for showcasing member assets. Champion members can submit one asset per year for a Brokered Moment feature, while Mogul members receive full Redline access including custom shoots and interview opportunities to maximize asset value and visibility.'
    },
    {
      question: 'What makes Paddock20 different from other automotive clubs?',
      answer: 'Paddock20 is not just a social club but a resale-activated, margin-aware membership model designed to capture flips, accelerate ROI, build referral pipelines, and turn grails into grid positions. We focus on asset value, strategic positioning, and member ROI rather than just social events.'
    },
    {
      question: 'Are there benefits for annual subscribers?',
      answer: 'Annual subscribers receive significant savings (approximately 16%) plus exclusive benefits including ROI consultation calls, listing strategy reviews, referral bonuses, and early submission windows for Redline features.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Export Options */}
        <div className="flex justify-end mb-6">
          <ExportOptions 
            data={{
              title: "Paddock20 Membership Information",
              content: membershipTiers.map(tier => ({
                name: tier.name,
                price: tier.price,
                features: tier.features.filter(f => f.included).map(f => f.name)
              }))
            }} 
          />
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-orbitron text-blue-500 mb-4">Paddock20™ Membership</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            "Where lifestyle becomes liquidity. And membership moves with intent."
          </p>
          <div className="mt-6 text-lg text-gray-400 max-w-3xl mx-auto">
            A resale-activated, margin-aware membership model designed to capture flips, 
            accelerate ROI, and turn grails into grid positions.
          </div>
        </div>

        {/* Positioning Statement */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-900/40 p-8 rounded-xl border border-gray-800 mb-12">
          <h2 className="text-2xl font-orbitron text-green-500 mb-4">What Is Paddock20™?</h2>
          <p className="text-gray-300 mb-3">
            Paddock20™ isn't a course. It's not a secret Discord server. It's not just a club.
          </p>
          <p className="text-gray-300 mb-3">
            It's a nationwide lifestyle engine—built to bridge the gap between access and ownership.
          </p>
          <p className="text-gray-300 mb-3">
            From parking lots to Patek drops. From dream garage posts to actual garage doors opening. From saying "maybe someday" to "let's get the paperwork started."
          </p>
          <p className="text-gray-300">
            Paddock20™ is for people who don't just like the lifestyle—they want to live it. And now, they can—without needing to be rich, loud, or on anyone's list.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-900 p-1 rounded-full inline-flex">
            <button
              onClick={() => setBillingPeriod('month')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingPeriod === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('year')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors relative ${
                billingPeriod === 'year' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-xs px-2 py-0.5 rounded-full text-black font-bold">
                Save 16%
              </span>
            </button>
          </div>
        </div>

        {/* Membership Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {membershipTiers.map(tier => (
            <div 
              key={tier.id}
              className={`relative rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] ${
                tier.highlight 
                  ? 'border-2 border-green-500 transform scale-[1.03] shadow-2xl' 
                  : 'border border-gray-800'
              }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-0 right-0 bg-green-600 text-center py-1 text-sm font-bold">
                  MOST POPULAR
                </div>
              )}
              <div className={`p-8 ${tier.highlight ? 'pt-10' : ''} bg-gradient-to-b from-gray-900 to-black`}>
                {/* Tier Header */}
                <div className="flex items-center mb-4">
                  <div className={`mr-4 bg-${tier.color}-900/20 p-3 rounded-full`}>
                    {tier.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-orbitron text-white">{tier.name}</h2>
                    <div className="text-gray-400 text-sm">Paddock20™ Membership</div>
                  </div>
                </div>
                
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end">
                    <span className="text-4xl font-bold text-white">${tier.price}</span>
                    <span className="text-gray-400 ml-2">/{tier.period === 'month' ? 'mo' : 'year'}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {tier.period === 'month' ? 'Billed monthly' : 'Billed annually'}
                  </div>
                </div>
                
                {/* Ideal For */}
                <div className="bg-gray-900/50 px-4 py-3 rounded-lg mb-6">
                  <p className="text-sm text-blue-400 font-medium">Ideal For</p>
                  <p className="text-gray-300">{tier.idealFor}</p>
                </div>
                
                {/* Description */}
                <p className="text-gray-300 mb-6">
                  {tier.description}
                </p>
                
                {/* Features */}
                <div className="space-y-3 mb-8">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <span className={feature.included ? 'text-white' : 'text-gray-500'}>
                          {feature.name}
                        </span>
                        {feature.tooltip && feature.included && (
                          <div className="text-xs text-gray-400 mt-0.5">{feature.tooltip}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* CTA Button */}
                <button 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    tier.highlight 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : tier.color === 'blue' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  Choose {tier.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* What You Actually Get */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-orbitron text-blue-500 mb-3">What You Actually Get</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Exclusive features designed to maximize your automotive investments and lifestyle.
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-400">Feature</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-400">What It Means</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="px-6 py-4 text-white font-medium">Event Priority</td>
                    <td className="px-6 py-4 text-gray-300">You get the text before IG sees the flyer.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white font-medium">Redline Drops</td>
                    <td className="px-6 py-4 text-gray-300">Cinematic buyer journeys, trade logic, and resale flips—curated for your level.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white font-medium">Watch + Car Sourcing</td>
                    <td className="px-6 py-4 text-gray-300">We bring you off-market deals, trade alerts, and concierge sourcing help.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white font-medium">Vault-Level Access</td>
                    <td className="px-6 py-4 text-gray-300">Want to see it before the world? You're in the loop. First previews, first flips.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white font-medium">Member-Only Pricing</td>
                    <td className="px-6 py-4 text-gray-300">Our partners? Your pricing. From wraps to watches. Mods to merch.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white font-medium">Business Leverage</td>
                    <td className="px-6 py-4 text-gray-300">You'll get GoTime Digital perks, discounts, and even passive revenue.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Digital Revenue Bonus */}
          <div className="bg-gradient-to-br from-green-900/30 to-gray-900 p-6 rounded-xl border border-green-900/50 mb-10">
            <h3 className="text-xl font-orbitron text-green-500 mb-4">GoTime Digital Revenue Bonus (All Members)</h3>
            <p className="text-gray-300 mb-4">
              You're not just getting discounts—you can get paid through GoTime Digital.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-blue-400">Action</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-blue-400">Your Reward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="py-3 px-4 text-white">Refer a business</td>
                    <td className="py-3 px-4 text-gray-300">1x Monthly Recurring Revenue (MRC) upfront 💰</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-white">Client signs monthly deal</td>
                    <td className="py-3 px-4 text-gray-300">You earn 2% of the monthly bill 🏦</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-white">Use GoTime Digital yourself</td>
                    <td className="py-3 px-4 text-gray-300">15% off accessories, variable hardware discounts, 2% monthly rebate on your own services</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              💡 The average GoTime Digital client spends $2,500/month. One referral = $2,500 upfront + $50/month. Your membership could pay for itself in a single conversation.
            </p>
          </div>
        </div>

        {/* Why Paddock20 Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-orbitron text-blue-500 mb-3">Why Paddock20™ Works</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Because we've lived every phase you're in:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800 flex">
              <div className="bg-green-900/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">The First-Timer</h3>
                <p className="text-gray-300">
                  We guide those asking "What should I buy?" with expert insights and market intelligence to make informed first purchases.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800 flex">
              <div className="bg-green-900/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">The Side-Hustler</h3>
                <p className="text-gray-300">
                  For those trying to flip smart, we provide market timing insights, presentation strategies, and buyer connections.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800 flex">
              <div className="bg-green-900/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">The Collector</h3>
                <p className="text-gray-300">
                  Established collectors benefit from our exit strategies, portfolio management, and exclusive market access.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800 flex">
              <div className="bg-green-900/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">The Dreamer</h3>
                <p className="text-gray-300">
                  For those who haven't made the first move but are ready to stop watching and start working, we provide actionable steps and guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What You Get Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-orbitron text-blue-500 mb-3">What You Get</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Your Paddock20™ membership unlocks exclusive features designed for true automotive enthusiasts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
              <div className="bg-blue-900/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Map className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Weather + Surface Readiness</h3>
              <p className="text-gray-300">
                Know when, where, and how to drive at your best with detailed weather conditions and surface analysis.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
              <div className="bg-green-900/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Flag className="h-7 w-7 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Route Planning</h3>
              <p className="text-gray-300">
                Build smarter drives with live conditions, curated roads, and performance-optimized navigation.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
              <div className="bg-purple-900/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Car className="h-7 w-7 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Garage Vault</h3>
              <p className="text-gray-300">
                Manage your cars, mods, and maintenance in one centralized place with detailed tracking and analytics.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
              <div className="bg-amber-900/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Events & Meetups</h3>
              <p className="text-gray-300">
                Find track days, car shows, and enthusiast gatherings near you, with priority access for members.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
              <div className="bg-red-900/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <HeartHandshake className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Concierge Services</h3>
              <p className="text-gray-300">
                Get custom access to supercar rentals, rare car sourcing, dream photo shoots, and more through our personalized service.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
              <div className="bg-cyan-900/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Watch className="h-7 w-7 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Luxury Asset Brokerage</h3>
              <p className="text-gray-300">
                Trade, buy, and sell timepieces and cars through our trusted network with verified authentication and security.
              </p>
            </div>
          </div>
        </div>

        {/* About GoTime Motorsports */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-orbitron text-blue-500 mb-3">About GoTime Motorsports™</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              The driving force behind Paddock20™ and Tires & Timepieces™
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/30 p-8 rounded-xl border border-gray-800 mb-10">
            <p className="text-gray-300 mb-4">
              We started GoTime Motorsports™ with a simple goal: Let enthusiasts see, touch, drive, and own the dreams they grew up chasing.
            </p>
            <p className="text-gray-300 mb-4">
              The car you see on Car and Driver? The one Chris Harris rips around the track? You should be able to see it, drive it, own it—or rent it for a memory you'll never forget.
            </p>
            <p className="text-gray-300 mb-6">
              That's why GoTime Motorsports™ built:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white">Car shows you can actually touch</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white">Brokerage services you can actually trust</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white">Track days you can actually enjoy</span>
              </div>
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white">Concierge experiences you can actually book</span>
              </div>
            </div>
            
            <p className="text-gray-300">
              And when you get your dream car? We're here to help you add the dream timepiece to your wrist too—powered by our partner, Bennisson. Full sourcing, selling, trading, authenticating, and shipping. Worldwide. All luxury timepieces. All styles. No gimmicks.
            </p>
          </div>
          
          {/* Tires & Timepieces Panel */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/20 p-8 rounded-xl border border-blue-900/40">
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-6 md:mb-0 md:mr-8 md:w-1/3">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-lg shadow-lg flex flex-col items-center justify-center h-full">
                  <Watch className="h-16 w-16 text-blue-400 mb-4" />
                  <h3 className="text-xl font-orbitron text-blue-400 text-center mb-2">Tires & Timepieces™ Brokerage</h3>
                  <p className="text-center text-gray-300">Full luxury car + watch e-commerce inside the app</p>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <h3 className="text-xl font-semibold text-white mb-3">Complete Luxury Asset Services</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Browse, sell, trade, and source within our verified network</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Full-service broker for both automotive and timepiece assets</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Authentication, shipping, and watchmaker services worldwide</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">Source any vehicle or timepiece in the world through our connections</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Asset-Backed Incentives */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-orbitron text-blue-500 mb-3">Asset-Backed Incentives</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Earn Vault Credits™ through member activities and use them for premium services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
              <div className="bg-amber-900/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Flip Closed</h3>
              <p className="text-green-500 font-bold text-xl mb-1">2% of margin</p>
              <p className="text-gray-300">
                Earn Vault Credits™ based on the profit margin of your successful automotive or timepiece flips.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
              <div className="bg-blue-900/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Referral Closed</h3>
              <p className="text-green-500 font-bold text-xl mb-1">$200 Credit</p>
              <p className="text-gray-300">
                Bring others into the Paddock20™ ecosystem and earn significant credit rewards for each conversion.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
              <div className="bg-purple-900/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-7 w-7 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Redline Feature</h3>
              <p className="text-green-500 font-bold text-xl mb-1">Free Next Listing</p>
              <p className="text-gray-300">
                Feature your asset in our Redline media showcase and receive a complimentary listing on your next asset.
              </p>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Vault Credits™ can be used for:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-300">Concierge fees</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-300">Deal previews</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-300">White-glove delivery</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-300">Custom asset sourcing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scorecard System */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-orbitron text-blue-500 mb-3">Codex Scorecard System</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Earn points through member activities and unlock exclusive benefits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Point System</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white">Flip Closed</span>
                  <span className="text-green-500 font-semibold">+100 points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Referral Closed</span>
                  <span className="text-green-500 font-semibold">+75 points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Redline Feature</span>
                  <span className="text-green-500 font-semibold">+50 points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Event Attended</span>
                  <span className="text-green-500 font-semibold">+25 points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Paddock20™ Renewal</span>
                  <span className="text-green-500 font-semibold">+100 points</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Quarterly Top Score Rewards</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="rounded-full bg-green-900/20 p-2 mr-3 mt-1">
                    <Zap className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Concierge Fast Lane</p>
                    <p className="text-gray-400 text-sm">Priority access to all concierge services</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="rounded-full bg-blue-900/20 p-2 mr-3 mt-1">
                    <Gift className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Asset Sourcing Credits</p>
                    <p className="text-gray-400 text-sm">Special budget for finding your next piece</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="rounded-full bg-purple-900/20 p-2 mr-3 mt-1">
                    <Trophy className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Exclusive Merch Drops</p>
                    <p className="text-gray-400 text-sm">Limited edition gear and Flex Plate drops</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What We Are/Not */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-900/20 to-gray-900 p-6 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-orbitron text-red-500 mb-4">What We're Not</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-gray-300">We're not a boring car club.</span>
                </div>
                <div className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-gray-300">We're not gatekeeping flexes behind a velvet rope.</span>
                </div>
                <div className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-gray-300">We're not here to nickel-and-dime members with monthly upsells.</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/20 to-gray-900 p-6 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-orbitron text-green-500 mb-4">What We Are</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-300">A plug for everything car + watch culture touches</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-300">A playbook for anyone who wants to build real ownership</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-300">A concierge-driven portal to your next move</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-300">A community of legit people who love the game and play it right</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-orbitron text-blue-500 mb-3">What Members Are Saying</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Hear from fellow automotive enthusiasts about their Paddock20 experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-4">
                    {/* Placeholder for avatar image */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-gray-300 italic">"{testimonial.content}"</p>
                </div>
                <div className="flex items-center">
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${testimonial.tier === 'Starter' ? 'bg-blue-900/30 text-blue-400' : 
                      testimonial.tier === 'Champion' ? 'bg-green-900/30 text-green-400' : 
                      'bg-purple-900/30 text-purple-400'}
                  `}>
                    {testimonial.tier} Member
                  </div>
                  <div className="ml-2 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-orbitron text-blue-500 mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Find answers to common questions about Paddock20 memberships.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto divide-y divide-gray-800">
            {faqs.map((faq, index) => (
              <div key={index} className="py-5">
                <button
                  onClick={() => setShowFAQ(showFAQ === index ? null : index)}
                  className="flex justify-between items-center w-full text-left focus:outline-none"
                >
                  <h3 className="text-lg font-medium text-white">{faq.question}</h3>
                  <ChevronRight className={`h-5 w-5 text-blue-500 transition-transform ${showFAQ === index ? 'transform rotate-90' : ''}`} />
                </button>
                {showFAQ === index && (
                  <div className="mt-3 text-gray-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-orbitron text-white mb-4">Ready to Elevate Your Automotive Experience?</h2>
          <p className="text-gray-300 max-w-3xl mx-auto mb-8">
            "This is where flex meets access. Where culture meets capital. Where lifestyle becomes legacy."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
              Choose Your Membership
            </button>
            <Link to="/contact" className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center">
              <Info className="h-5 w-5 mr-2" />
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paddock20VaultPage;