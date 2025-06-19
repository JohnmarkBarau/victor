import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: {
    text: string;
    included: boolean;
  }[];
  buttonText: string;
  popular?: boolean;
}

export default function Pricing() {
  const navigate = useNavigate();
  
  const tiers: PricingTier[] = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started with social media management',
      features: [
        { text: '5 social accounts', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Content calendar', included: true },
        { text: 'Manual post scheduling', included: true },
        { text: 'Basic AI post suggestions', included: true },
        { text: 'Community management', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'Custom branded content', included: false },
        { text: 'Priority support', included: false },
        { text: 'Team collaboration', included: false },
      ],
      buttonText: 'Get Started',
    },
    {
      name: 'Essentials',
      price: '$29',
      description: 'Ideal for growing brands and content creators',
      features: [
        { text: '15 social accounts', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Content calendar', included: true },
        { text: 'Automated scheduling', included: true },
        { text: 'Advanced AI content generation', included: true },
        { text: 'Community management', included: true },
        { text: 'Custom branded content', included: true },
        { text: 'Priority support', included: false },
        { text: 'Team collaboration', included: false },
        { text: 'Custom integrations', included: false },
      ],
      buttonText: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Team',
      price: '$99',
      description: 'For teams and agencies managing multiple brands',
      features: [
        { text: 'Unlimited social accounts', included: true },
        { text: 'Enterprise analytics', included: true },
        { text: 'Content calendar', included: true },
        { text: 'Advanced scheduling', included: true },
        { text: 'AI content suite', included: true },
        { text: 'Community management', included: true },
        { text: 'Custom branded content', included: true },
        { text: 'Priority support', included: true },
        { text: 'Team collaboration', included: true },
        { text: 'Custom integrations', included: true },
      ],
      buttonText: 'Contact Sales',
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Choose the perfect plan for your social media management needs
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-lg shadow-sm divide-y divide-gray-200 bg-white ${
              tier.popular ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="p-6">
              {tier.popular && (
                <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-blue-100 text-blue-600 mb-4">
                  Most Popular
                </span>
              )}
              <h2 className="text-xl font-semibold text-gray-900">{tier.name}</h2>
              <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
              <p className="mt-8">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className={`mt-8 w-full ${
                  tier.popular ? 'bg-blue-600 hover:bg-blue-700' : ''
                }`}
              >
                {tier.buttonText}
              </Button>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h3 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                What's included
              </h3>
              <ul className="mt-6 space-y-4">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 shrink-0" />
                    )}
                    <span className={`ml-3 text-sm ${
                      feature.included ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-blue-50 rounded-2xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Enterprise Solutions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Need a custom solution for your organization? Contact our sales team for a tailored package.
          </p>
          <Button
            onClick={() => window.location.href = 'mailto:enterprise@socialsync.ai'}
            className="mt-8"
            size="lg"
          >
            Contact Enterprise Sales
          </Button>
        </div>
      </div>
    </div>
  );
}