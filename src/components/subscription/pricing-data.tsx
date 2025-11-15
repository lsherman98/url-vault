import { Check, Gift, Mail, Zap, Crown, X } from "lucide-react";
import type { PricingTier } from "./pricing-types";

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    icon: <Gift className="h-5 w-5" />,
    description: "Free plan",
    price: 0,
    features: [
      {
        icon: <Check className="h-4 w-4 text-green-500 shrink-0" />,
        text: "Full feature access",
      },
      {
        icon: <X className="h-4 w-4 text-red-500 shrink-0" />,
        text: "Limited to 1 forwarding rule",
      },
    ],
  },
  {
    id: "monthly",
    name: "Monthly",
    icon: <Mail className="h-5 w-5 text-blue-500" />,
    iconColor: "text-blue-500",
    description: "Monthly subscription, cancel anytime.",
    price: 1.99,
    features: [
      {
        icon: <Check className="h-4 w-4 text-green-500 shrink-0" />,
        text: "Unlimited forwarding rules",
      },
    ],
  },
  {
    id: "yearly",
    name: "Annual",
    icon: <Zap className="h-5 w-5 text-green-500" />,
    iconColor: "text-green-500",
    description: "Save with annual subscription.",
    price: 19.99,
    features: [
      {
        icon: <Check className="h-4 w-4 text-green-500 shrink-0" />,
        text: "Unlimited forwarding rules",
      },
    ],
    popular: true,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    icon: <Crown className="h-5 w-5 text-yellow-500" />,
    iconColor: "text-yellow-500",
    description: "One time payment for lifetime access.",
    price: 35.0,
    features: [
      {
        icon: <Check className="h-4 w-4 text-green-500 shrink-0" />,
        text: "Unlimited forwarding rules",
      },
      {
        icon: <Check className="h-4 w-4 text-green-500 shrink-0" />,
        text: "Lifetime access",
        highlighted: true,
      },
    ],
  },
];
