import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | All Property Link",
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
        answer: "Click 'Sign up' in the top right corner. You can register using your email address or Google account. After verifying your email, you'll have access to saved searches, property alerts, and inquiry history.",
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
        answer: "From your dashboard, go to 'Account Settings' → 'Upgrade to Agency'. Provide your company registration certificate and EARB agency license. Agency accounts support multiple agents under one dashboard.",
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
    <>
      <Navbar />
      <div className="min-h-screen bg-surface">
        <section className="bg-primary-600 text-text-on-primary py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto text-balance">
              Find answers to common questions about buying, selling, renting, and listing properties on Kenya's trusted real estate marketplace.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8">
              <label htmlFor="faq-search" className="sr-only">
                Search FAQs
              </label>
              <div className="relative max-w-xl mx-auto">
                <input
                  id="faq-search"
                  type="search"
                  placeholder="Search questions..."
                  className="w-full pl-12 pr-4 py-3 text-lg border-border focus:ring-2 focus:ring-primary-500/20"
                  autoComplete="off"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
            </div>

            <nav className="mb-8 overflow-x-auto pb-4" aria-label="FAQ categories">
              <ul className="flex gap-2 min-w-max">
                {faqCategories.map((cat) => (
                  <li key={cat.category}>
                    <button
                      type="button"
                      data-category={cat.category}
                      className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary whitespace-nowrap rounded-full bg-surface-secondary hover:bg-border transition-colors"
                    >
                      {cat.category}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    data-category="all"
                    className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-full whitespace-nowrap"
                  >
                    All
                  </button>
                </li>
              </ul>
            </nav>

            <div className="space-y-4" id="faq-list">
              {faqCategories.map((cat) => (
                <section
                  key={cat.category}
                  id={`faq-${cat.category.toLowerCase().replace(/\s&/g, "").replace(/\s+/g, "-")}`}
                  className="faq-category"
                  data-category={cat.category}
                >
                  <h2 className="font-heading text-xl font-semibold text-text-primary mb-4 pb-2 border-b border-border">
                    {cat.category}
                  </h2>
                  <div className="space-y-3">
                    {cat.faqs.map((faq, index) => (
                      <details
                        key={`${cat.category}-${index}`}
                        className="group bg-surface border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-primary-200"
                      >
                        <summary
                          className="flex items-center justify-between p-5 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-2"
                          aria-expanded="false"
                        >
                          <h3 className="font-heading text-base font-semibold text-text-primary pr-4 text-balance">
                            {faq.question}
                          </h3>
                          <svg
                            className="flex-shrink-0 w-5 h-5 text-text-secondary transition-transform duration-200 group-open:rotate-180"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </summary>
                        <div className="px-5 pb-5 pt-0">
                          <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-16 pt-8 border-t border-border text-center">
              <p className="text-text-secondary mb-4">
                Didn&apos;t find what you&apos;re looking for?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="touch-target inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-text-on-primary hover:bg-primary-700 transition-colors"
                >
                  Contact Support
                </Link>
                <Link
                  href="/auth/login"
                  className="touch-target inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors"
                >
                  Sign In to Ask
                </Link>
              </div>
            </div>
          </div>
        </section>

        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const searchInput = document.getElementById('faq-search');
                const categoryButtons = document.querySelectorAll('[data-category]');
                const faqCategories = document.querySelectorAll('.faq-category');
                const faqItems = document.querySelectorAll('#faq-list details');
                const noResults = document.createElement('div');
                noResults.className = 'text-center py-12 text-text-secondary hidden';
                noResults.innerHTML = '<p class="text-lg">No questions match your search.</p>';
                document.getElementById('faq-list').appendChild(noResults);

                let activeCategory = 'all';
                let searchTerm = '';

                function filterFAQs() {
                  let visibleCount = 0;
                  faqItems.forEach((item) => {
                    const question = item.querySelector('h3')?.textContent?.toLowerCase() || '';
                    const answer = item.querySelector('p')?.textContent?.toLowerCase() || '';
                    const category = item.closest('.faq-category')?.dataset.category || '';
                    const matchesSearch = question.includes(searchTerm) || answer.includes(searchTerm);
                    const matchesCategory = activeCategory === 'all' || category === activeCategory;
                    const shouldShow = matchesSearch && matchesCategory;
                    item.style.display = shouldShow ? '' : 'none';
                    if (shouldShow) visibleCount++;
                  });

                  faqCategories.forEach((cat) => {
                    const catItems = cat.querySelectorAll('details');
                    const catVisible = Array.from(catItems).some((item) => item.style.display !== 'none');
                    cat.style.display = catVisible ? '' : 'none';
                  });

                  noResults.classList.toggle('hidden', visibleCount > 0 || searchTerm === '');
                }

                searchInput.addEventListener('input', (e) => {
                  searchTerm = e.target.value.toLowerCase().trim();
                  filterFAQs();
                });

                categoryButtons.forEach((btn) => {
                  btn.addEventListener('click', () => {
                    activeCategory = btn.dataset.category;
                    categoryButtons.forEach((b) => {
                      b.className = 'px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full transition-colors ' +
                        (b.dataset.category === activeCategory
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-text-secondary hover:text-text-primary bg-surface-secondary hover:bg-border');
                    });
                    filterFAQs();
                  });
                });

                document.addEventListener('keydown', (e) => {
                  if (e.key === '/' && document.activeElement !== searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                  }
                });
              })();
            `,
          }}
        />
      </div>
      <Footer />
    </>
  );
}