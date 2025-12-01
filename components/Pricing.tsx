import React from 'react';
import { Check, Zap, Shield, Crown } from 'lucide-react';
import { PlanDetails, User } from '../types';
import { handlePayment } from '../services/razorpay';

interface PricingProps {
  user: User;
  onUpgrade: (plan: 'PRO' | 'ENTERPRISE') => void;
}

const PLANS: PlanDetails[] = [
  {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    currency: 'USD',
    features: ['3 Transcripts / mo', 'Standard Export', 'Email Support', '24h History'],
  },
  {
    id: 'pro',
    name: 'Pro Creator',
    price: 29,
    currency: 'USD',
    features: ['Unlimited Transcripts', 'Fast Processing', 'PDF & TXT Export', 'Priority Support', 'No Watermark'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'USD',
    features: ['Bulk Processing', 'Team Dashboard', 'API Access', 'Dedicated Account Manager', 'SLA Agreement'],
  },
];

export const Pricing: React.FC<PricingProps> = ({ user, onUpgrade }) => {
  
  const handlePlanSelect = (plan: PlanDetails) => {
    if (plan.price === 0) return;
    
    handlePayment(plan.price, plan.name, user.email, () => {
        // Callback on success
        if (plan.id === 'pro') onUpgrade('PRO');
        if (plan.id === 'enterprise') onUpgrade('ENTERPRISE');
        alert(`Successfully upgraded to ${plan.name}!`);
    });
  };

  return (
    <div className="p-6 md:p-12 animate-fade-in pt-12 pb-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Fair Pricing for Everyone
        </h2>
        <p className="text-slate-400 text-lg">
          Generate transcripts without limits. Cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {PLANS.map((plan) => {
          const isCurrent = user.plan.toLowerCase() === plan.id;
          const isPro = plan.id === 'pro';
          const Icon = plan.id === 'enterprise' ? Crown : (isPro ? Zap : Shield);

          return (
            <div 
              key={plan.id}
              className={`relative rounded-2xl p-8 border transition-all duration-300 hover:transform hover:-translate-y-2
                ${isPro 
                  ? 'bg-slate-900/80 border-indigo-500 shadow-2xl shadow-indigo-900/20' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }
              `}
            >
              {isPro && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Recommended
                </div>
              )}

              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${isPro ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                    <Check className={`w-5 h-5 flex-shrink-0 ${isPro ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelect(plan)}
                disabled={isCurrent}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all
                  ${isCurrent 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : isPro
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }
                `}
              >
                {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};