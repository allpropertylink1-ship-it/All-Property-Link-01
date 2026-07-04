import ContactForm from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <>
      <main className="min-h-[calc(100vh-80px)] bg-surface">
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              Get in Touch
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-text-secondary">
              Have questions or need assistance? We&apos;re here to help. Fill out the form below or reach out directly using the contact information provided.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div>
              <ContactForm />
            </div>
            <div className="space-y-6">
              <div className="border rounded-xl border-border bg-surface p-6">
                <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
                  Office
                </h2>
                <p className="mb-2 text-sm text-text-secondary">
                  All Property Link Headquarters
                </p>
                <p className="mb-2 text-sm text-text-secondary">
                  1451 Argwings Kodhek Rd, Kilimani, Nairobi, Kenya
                </p>
                <p className="mb-2 text-sm text-text-secondary">
                  <a href="tel:+254700000000" className="text-primary-600 hover:underline">
                    +254 700 000 000
                  </a>
                </p>
                <p className="mb-2 text-sm text-text-secondary">
                  <a href="mailto:info@allpropertylink.com" className="text-primary-600 hover:underline">
                    info@allpropertylink.com
                  </a>
                </p>
                <p className="text-xs text-text-secondary">
                  Mon-Fri: 8:00 AM - 6:00 PM | Sat: 9:00 AM - 1:00 PM
                </p>
              </div>
              <div className="border rounded-xl border-border bg-surface p-6">
                <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
                  WhatsApp Business
                </h2>
                <p className="mb-2 text-sm text-text-secondary">
                  Chat with us directly on WhatsApp
                </p>
                <p className="mb-2 text-sm text-text-secondary">
                  <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    +254 700 000 000
                  </a>
                </p>
                <p className="text-xs text-text-secondary">
                  Available Mon-Fri 8AM-6PM, Sat 9AM-1PM
                </p>
              </div>
              <div className="border rounded-xl border-border bg-surface p-6">
                <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
                  Support
                </h2>
                <p className="mb-2 text-sm text-text-secondary">
                  <a href="mailto:support@allpropertylink.com" className="text-primary-600 hover:underline">
                    support@allpropertylink.com
                  </a>
                </p>
                <p className="mb-2 text-sm text-text-secondary">
                  <a href="/faq" className="text-primary-600 hover:underline">
                    Visit our FAQ
                  </a>
                </p>
                <p className="text-xs text-text-secondary">
                  Typical response time: 2-4 hours
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}