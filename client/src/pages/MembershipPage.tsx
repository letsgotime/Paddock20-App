import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Shield, Star, Check, X, Info } from 'lucide-react';
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

const MembershipPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [showFAQ, setShowFAQ] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
            contentRef={contentRef}
            title="Paddock20 Membership"
            pageName="Membership"
            data={membershipTiers.map(tier => ({
              name: tier.name,
              price: tier.price,
              features: tier.features.filter(f => f.included).map(f => f.name)
            }))}
          />
        </div>
        
        <div ref={contentRef}>
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
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-orbitron text-blue-500 text-center mb-10">Member Testimonials</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="bg-gradient-to-b from-gray-900 to-gray-900/70 p-6 rounded-xl border border-gray-800">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-800 w-12 h-12 rounded-full overflow-hidden mr-4">
                      {/* Image placeholder - in production would use real member images */}
                      <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                  <div className="text-sm text-blue-400 font-medium">
                    Member Tier: {testimonial.tier}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-16">
            <h2 className="text-3xl font-orbitron text-blue-500 text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border border-gray-800 rounded-lg overflow-hidden"
                >
                  <button 
                    className="w-full px-6 py-4 text-left bg-gray-900 flex justify-between items-center"
                    onClick={() => setShowFAQ(showFAQ === index ? null : index)}
                  >
                    <span className="font-medium text-white">{faq.question}</span>
                    <span className="text-blue-500 ml-2">
                      {showFAQ === index ? '-' : '+'}
                    </span>
                  </button>
                  
                  {showFAQ === index && (
                    <div className="px-6 py-4 bg-gray-900/50 text-gray-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Member Profiles */}
          <div className="mb-20">
            <h2 className="text-3xl font-orbitron text-blue-500 text-center mb-6">Who Is Paddock20™ For?</h2>
            <p className="text-gray-300 text-center max-w-3xl mx-auto mb-10">
              Meet our three most common member profiles and see where you fit best.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-900/30 to-gray-900 p-6 rounded-xl border border-blue-900/50">
                <h3 className="text-xl font-orbitron text-blue-400 mb-4">The First-Time Buyer</h3>
                <p className="text-gray-300 mb-4">
                  Looking to make the leap into luxury automotive ownership but not sure where to start, what to buy, or how to avoid mistakes.
                </p>
                <p className="text-gray-400">
                  We guide those asking "What should I buy?" with expert insights and market intelligence to make informed first purchases.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-900/30 to-gray-900 p-6 rounded-xl border border-green-900/50">
                <h3 className="text-xl font-orbitron text-green-500 mb-4">The Strategic Flipper</h3>
                <p className="text-gray-300 mb-4">
                  Experienced in buying and selling luxury assets but looking to optimize returns, gain market advantage, and access exclusive deals.
                </p>
                <p className="text-gray-400">
                  We provide the data, tools, and network to help you capitalize on market inefficiencies and timing opportunities.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 p-6 rounded-xl border border-purple-900/50">
                <h3 className="text-xl font-orbitron text-purple-500 mb-4">The Collection Builder</h3>
                <p className="text-gray-300 mb-4">
                  Focused on creating a lasting, appreciating collection of high-value assets with meaning, connection, and investment potential.
                </p>
                <p className="text-gray-400">
                  We help you build a cohesive collection strategy, source rare pieces, and maximize your collection's value and legacy.
                </p>
              </div>
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
    </div>
  );
};

export default MembershipPage;