"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  pageTitle?: string;
  pageUrl?: string;
}

export function FAQSchema({ faqs, pageTitle, pageUrl }: FAQSchemaProps) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(pageTitle ? { "name": pageTitle } : {}),
    ...(pageUrl ? { "url": pageUrl } : {}),
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
  );
}

export function FAQSection({ faqs, title = "Frequently Asked Questions" }: { faqs: FAQItem[]; title?: string }) {
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const toggle = (index: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section className="py-12 sm:py-16 bg-surface-secondary">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold font-heading text-text-primary mb-8">
          {title}
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = open.has(index);
            return (
              <div
                key={index}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-text-primary hover:bg-surface hover:transition-colors"
                >
                  <span>{faq.question}</span>
                  <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-border px-4 py-3 text-text-secondary text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
