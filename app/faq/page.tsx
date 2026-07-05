import Link from "next/link";
import { FaqSearch } from "@/components/faq/FaqSearch";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about buying, selling, and renting property in Kenya on All Property Link.",
};

interface FAQ {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  faqs: FAQ[];
}

const faqCategories: FAQCategory[] = [
  {
    category: "Getting Started",
    faqs: [
      {
        question: "How do I create an account on All Property Link?",
        answer: "Click 'Sign up' in the top right corner. You can register using your email address. After verifying your email, you'll have access to saved searches, property alerts, and inquiry history.",
      },
      {
        question: "Do I need an account to browse properties?",
        answer: "No, you can browse all property listings without an account. However, creating an account lets you save searches, set up property alerts, save favorite listings, and track your inquiries.",
      },
      {
        question: "What types of accounts are available?",
        answer: "We offer two account types: Buyer/Tenant accounts for property seekers, and Agent/Agency accounts for real estate professionals who want to list properties. Agents must complete verification before listing.",
      },
      {
        question: "How do I verify my agent account?",
        answer: "After registering as an agent, submit your valid Kenyan real estate license (from the Estate Agents Registration Board - EARB) and national ID. Our verification team reviews documents within 1-2 business days.",
      },
    ],
  },
  {
    category: "For Buyers & Tenants",
    faqs: [
      {
        question: "How do I search for properties in a specific area?",
        answer: "Use the search bar on the homepage or properties page. Filter by location (city, neighborhood), property type (apartment, house, land), price range, bedrooms, and more. You can also browse by city from the homepage.",
      },
      {
        question: "Can I save searches and get alerts for new listings?",
        answer: "Yes! After creating an account, save any search to get email or WhatsApp alerts when new matching properties are listed. Manage alerts from your dashboard.",
      },
      {
        question: "How do I contact a property agent?",
        answer: "Click 'Contact Agent' on any listing to send an inquiry. You can also use the WhatsApp button for instant messaging. Agents typically respond within a few hours during business hours.",
      },
      {
        question: "Can I schedule a viewing online?",
        answer: "Yes! After contacting an agent, you can request a viewing. Many agents offer virtual tours via video call or in-person viewings. Available viewing slots are shown on the listing when provided by the agent.",
      },
      {
        question: "What should I check before renting or buying?",
        answer: "Always verify the agent's verification badge, visit the property in person, confirm ownership documents, check for outstanding utility bills, and read the tenancy/sale agreement carefully. We recommend using a lawyer for purchases.",
      },
    ],
  },
  {
    category: "For Agents & Agencies",
    faqs: [
      {
        question: "How do I list a property?",
        answer: "After agent verification, go to your dashboard and click 'Add Listing'. Fill in property details, upload photos (minimum 5, maximum 20), set the price, and publish. Listings go live immediately after review.",
      },
      {
        question: "What are the listing requirements?",
        answer: "You must be a verified agent with a valid EARB license. Listings require: accurate property details, clear photos (min. 1024px wide), correct pricing in KES, and location details. Misleading listings are removed.",
      },
      {
        question: "How do I manage inquiries from buyers?",
        answer: "All inquiries appear in your dashboard under 'Inquiries'. You can respond via the platform, WhatsApp, or phone. Responding within 2 hours improves your response rate badge and listing visibility.",
      },
      {
        question: "Can I feature my listings for more visibility?",
        answer: "Yes! Featured listings appear at the top of search results and on the homepage. Pricing: KES 5,000/week for featured placement. Premium agency packages include featured listings. Manage from your dashboard.",
      },
      {
        question: "What are the agent verification requirements?",
        answer: "You need: (1) Valid EARB practicing license, (2) National ID or passport, (3) Company registration certificate (for agencies), (4) KRA PIN certificate. Verification takes 1-2 business days.",
      },
    ],
  },
  {
    category: "Account & Billing",
    faqs: [
      {
        question: "How do I reset my password?",
        answer: "Click 'Forgot password' on the login page. Enter your registered email to receive a reset link. The link expires in 1 hour. If you don't receive it, check spam or contact support.",
      },
      {
        question: "How do I update my profile or notification preferences?",
        answer: "Go to your dashboard and click 'Profile' to update personal details, or 'Notifications' to manage email, SMS, and WhatsApp preferences for alerts and inquiries.",
      },
      {
        question: "What payment methods are accepted for featured listings?",
        answer: "We accept M-Pesa (Paybill 400200), credit/debit cards (Visa, Mastercard), and bank transfers. M-Pesa payments are instant; card payments process within minutes. Invoices are generated automatically.",
      },
      {
        question: "Can I get a refund for a featured listing?",
        answer: "Featured listing fees are non-refundable once the listing goes live. If you cancel before publication, a full refund is issued within 3-5 business days. Contact support for exceptional circumstances.",
      },
      {
        question: "How do I upgrade to an agency account?",
        answer: "From your dashboard, go to 'Account Settings' -> 'Upgrade to Agency'. Provide your company registration certificate and EARB agency license. Agency accounts support multiple agents under one dashboard.",
      },
    ],
  },
  {
    category: "Legal & Privacy",
    faqs: [
      {
        question: "How does All Property Link protect my data?",
        answer: "We comply with Kenya's Data Protection Act, 2019. Your data is encrypted in transit and at rest. We only collect necessary information and never sell your data to third parties. See our Privacy Policy for details.",
      },
      {
        question: "What are my rights under Kenya's Data Protection Act?",
        answer: "You have the right to access, correct, delete, and port your data. You can object to processing and withdraw consent. Submit requests via our Privacy Policy page or email privacy@allpropertylink.co.ke.",
      },
      {
        question: "How does WhatsApp integration work with my privacy?",
        answer: "When you click 'Chat on WhatsApp', your phone number is shared with the agent only for that conversation. We don't store WhatsApp chat content. You can disable WhatsApp sharing in notification settings.",
      },
      {
        question: "What are the terms of service for agents?",
        answer: "Agents must: hold valid EARB license, list only authorized properties, provide accurate information, respond to inquiries promptly, and comply with Kenyan real estate laws. Violations may result in account suspension.",
      },
      {
        question: "How do I report a fraudulent listing or agent?",
        answer: "Click 'Report' on any listing or agent profile. Provide details and evidence. Our team investigates within 24 hours. Fraudulent accounts are suspended and reported to relevant authorities including EARB and DCI.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-surface">
      <section className="bg-primary-600 py-16 text-center text-text-on-primary sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-lg text-primary-100 sm:text-xl">
            Find answers to common questions about buying, selling, renting, and listing properties on Kenya&apos;s trusted real estate marketplace.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <FaqSearch categories={faqCategories} />

          <div className="mt-16 border-t border-border pt-8 text-center">
            <p className="mb-4 text-text-secondary">
              Didn&apos;t find what you&apos;re looking for?
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="touch-target inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-700"
              >
                Contact Support
              </Link>
              <Link
                href="/auth/login"
                className="touch-target inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
              >
                Sign In to Ask
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
