import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with All Property Link. Contact our team for support, inquiries, or partnership opportunities.",
};

export default function ContactPage() {
  return (
    <>
      <main className="min-h-[calc(100vh-80px)] bg-surface" id="main-content">
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              Get in Touch
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
              Have questions or need assistance? We&apos;re here to help. Fill out the form below or reach out directly using the contact information provided.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <ContactForm />
            </div>
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
                    <svg className="h-5 w-5 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="font-heading text-lg font-semibold text-text-primary">
                    Office
                  </h2>
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>All Property Link Headquarters</p>
                  <p>1451 Argwings Kodhek Rd, Kilimani, Nairobi, Kenya</p>
                  <p>
                    <a href="tel:+254700000000" className="text-primary-500 hover:underline">
                      +254 700 000 000
                    </a>
                  </p>
                  <p>
                    <a href="mailto:info@allpropertylink.com" className="text-primary-500 hover:underline">
                      info@allpropertylink.com
                    </a>
                  </p>
                  <p className="text-xs">Mon-Fri: 8:00 AM - 6:00 PM | Sat: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
                    <svg className="h-5 w-5 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="font-heading text-lg font-semibold text-text-primary">
                    WhatsApp Business
                  </h2>
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>Chat with us directly on WhatsApp</p>
                  <p>
                    <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
                      +254 700 000 000
                    </a>
                  </p>
                  <p className="text-xs">Available Mon-Fri 8AM-6PM, Sat 9AM-1PM</p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
                    <svg className="h-5 w-5 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h2 className="font-heading text-lg font-semibold text-text-primary">
                    Support
                  </h2>
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>
                    <a href="mailto:support@allpropertylink.com" className="text-primary-500 hover:underline">
                      support@allpropertylink.com
                    </a>
                  </p>
                  <p>
                    <Link href="/faq" className="text-primary-500 hover:underline">
                      Visit our FAQ
                    </Link>
                  </p>
                  <p className="text-xs">Typical response time: 2-4 hours</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}