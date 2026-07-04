"use client";

import { useState, useRef, useEffect } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  faqs: FAQ[];
}

export function FaqSearch({ categories }: { categories: FAQCategory[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const filtered = categories
    .map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter(
      (cat) => activeCategory === "all" || cat.category === activeCategory,
    );

  const totalVisible = filtered.reduce((sum, cat) => sum + cat.faqs.length, 0);

  return (
    <>
      <div className="mb-8">
        <label htmlFor="faq-search" className="sr-only">
          Search FAQs
        </label>
        <div className="relative mx-auto max-w-xl">
          <input
            ref={searchRef}
            id="faq-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 pl-12 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
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
        <ul className="flex min-w-max gap-2">
          <li>
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-primary-50 text-primary-600"
                  : "bg-surface-secondary text-text-secondary hover:border-border hover:text-text-primary"
              }`}
            >
              All
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.category}>
              <button
                type="button"
                onClick={() => setActiveCategory(cat.category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.category
                    ? "bg-primary-50 text-primary-600"
                    : "bg-surface-secondary text-text-secondary hover:border-border hover:text-text-primary"
                }`}
              >
                {cat.category}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-4" id="faq-list">
        {filtered.map((cat) => (
          <section
            key={cat.category}
            id={`faq-${cat.category.toLowerCase().replace(/\s&/g, "").replace(/\s+/g, "-")}`}
            className="faq-category"
          >
            <h2 className="mb-4 border-b border-border pb-2 font-heading text-xl font-semibold text-text-primary">
              {cat.category}
            </h2>
            <div className="space-y-3">
              {cat.faqs.map((faq, index) => (
                <details
                  key={`${cat.category}-${index}`}
                  className="group overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:border-primary-200"
                >
                  <summary
                    className="flex cursor-pointer list-none items-center justify-between p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-2"
                    aria-expanded="false"
                  >
                    <h3 className="pr-4 font-heading text-base font-semibold text-text-primary text-balance">
                      {faq.question}
                    </h3>
                    <svg
                      className="h-5 w-5 shrink-0 text-text-secondary transition-transform duration-200 group-open:rotate-180"
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
                    <p className="leading-relaxed text-text-secondary">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      {searchTerm && totalVisible === 0 && (
        <div className="py-12 text-center text-text-secondary">
          <p className="text-lg">No questions match your search.</p>
        </div>
      )}
    </>
  );
}
