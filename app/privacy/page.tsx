const LAST_UPDATED = "July 3, 2026";

export const metadata = {
  title: "Privacy Policy",
  description: "All Property Link privacy policy - how we collect, use, and protect your personal data in compliance with the Kenya Data Protection Act, 2019.",
};

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-[calc(100vh-80px)] bg-surface">
        <section className="mx-auto max-w-text px-4 py-10 sm:py-14">
          <header className="mb-8 text-center">
            <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-text-secondary">Last updated: {LAST_UPDATED}</p>
          </header>

          <section className="space-y-6 text-text-secondary leading-relaxed">
            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">1. Introduction</h2>
              <p className="mt-2">Welcome to All Property Link ("we", "our", "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit allpropertylink.co.ke and use our services. We comply with the Kenya Data Protection Act, 2019 and its regulations, as well as applicable international data protection standards.</p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">2. Information We Collect</h2>
              <h3 className="mt-2 font-heading text-lg font-semibold text-text-primary">Personal Information</h3>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Name, email address, phone number, and WhatsApp number</li>
                <li>Account credentials (encrypted password)</li>
                <li>Profile information (profile photo, bio, location preferences)</li>
                <li>Property preferences and saved searches</li>
                <li>Inquiry messages and communications with agents</li>
              </ul>
              <h3 className="mt-3 font-heading text-lg font-semibold text-text-primary">Property Listing Data</h3>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Property details (type, location, price, features, descriptions)</li>
                <li>Property images and media uploaded via Cloudinary</li>
                <li>Location data (county, city, neighborhood, coordinates for Google Maps)</li>
              </ul>
              <h3 className="mt-3 font-heading text-lg font-semibold text-text-primary">Automatically Collected Data</h3>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>IP address, browser type, device information, operating system</li>
                <li>Usage data (pages visited, time spent, clicks, search queries)</li>
                <li>Cookies and similar tracking technologies (see Cookie Policy)</li>
                <li>Location data (with consent) for property search and mapping</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">3. How We Use Your Information</h2>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li>Provide, maintain, and improve our property marketplace platform</li>
                <li>Process property listings, inquiries, and agent communications</li>
                <li>Send transactional emails via Resend (inquiries, confirmations, notifications)</li>
                <li>Enable WhatsApp Business API communication for property inquiries</li>
                <li>Display property locations on Google Maps</li>
                <li>Store and optimize property images via Cloudinary</li>
                <li>Personalize user experience and property recommendations</li>
                <li>Send marketing communications (with consent, opt-out available)</li>
                <li>Comply with legal obligations under Kenya Data Protection Act, 2019</li>
                <li>Prevent fraud, ensure security, and enforce our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">4. Third-Party Services</h2>
              <p className="mt-2">We use the following third-party service providers who process data on our behalf:</p>
              <ul className="mt-2 space-y-2 list-disc list-inside">
                <li><strong className="text-text-primary">Cloudinary</strong> — Image/video management, optimization, and delivery for property media</li>
                <li><strong className="text-text-primary">Resend</strong> — Transactional email delivery (inquiry notifications, account emails, password resets)</li>
                <li><strong className="text-text-primary">Google Maps Platform</strong> — Maps, geocoding, and places API for property location display and search</li>
                <li><strong className="text-text-primary">WhatsApp Business API (Meta)</strong> — Direct agent communication via WhatsApp</li>
                <li><strong className="text-text-primary">Supabase (PostgreSQL, Auth, Storage)</strong> — Database, authentication, and file storage backend</li>
                <li><strong className="text-text-primary">Vercel</strong> — Hosting and edge network</li>
              </ul>
              <p className="mt-2">Each provider processes data per their privacy policies and data processing agreements. We ensure appropriate DPAs are in place.</p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">5. Data Sharing and Disclosure</h2>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li><strong>Property inquiries:</strong> Shared with the listing agent/owner when you inquire (name, phone, email, message)</li>
                <li><strong>Legal compliance:</strong> Disclosed when required by Kenyan law, court order, or regulatory authority (including the ODPC)</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, with appropriate safeguards</li>
                <li><strong>Service providers:</strong> As described in Section 4, under binding data processing agreements</li>
                <li><strong>With consent:</strong> For marketing communications or other purposes where you have given explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">6. Data Retention</h2>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li><strong>Account data:</strong> Retained while account is active and 2 years after deletion for legal compliance</li>
                <li><strong>Property listings:</strong> Retained while active; archived listings retained for 3 years for reference and dispute resolution</li>
                <li><strong>Inquiry messages:</strong> Retained for 3 years for agent reference and dispute resolution</li>
                <li><strong>Analytics/logs:</strong> Retained for 13 months (analytics) and 30 days (server logs)</li>
                <li><strong>Marketing data:</strong> Retained until you opt out or for 2 years after last interaction</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">7. Your Rights Under Kenya Data Protection Act, 2019</h2>
              <p className="mt-2">As a data subject in Kenya, you have the following rights:</p>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li><strong>Right to be informed:</strong> Know what data we collect and why</li>
                <li><strong>Right of access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to erasure:</strong> Request deletion ("right to be forgotten")</li>
                <li><strong>Right to restrict processing:</strong> Limit how we use your data</li>
                <li><strong>Right to data portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to object:</strong> Object to processing for direct marketing or legitimate interests</li>
                <li><strong>Right to withdraw consent:</strong> Where processing is based on consent</li>
                <li><strong>Right to lodge a complaint:</strong> With the Office of the Data Protection Commissioner (ODPC) Kenya</li>
              </ul>
              <p className="mt-2">To exercise these rights, contact us at privacy@allpropertylink.co.ke or use account settings in your dashboard. We respond within 30 days as required by law.</p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">8. Cookies and Tracking Technologies</h2>
              <p className="mt-2">We use cookies and similar technologies for essential functionality, analytics, and marketing. See our <a href="/cookies" className="text-primary-600 hover:underline">Cookie Policy</a> for details on cookie types, purposes, and how to manage preferences.</p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">9. International Data Transfers</h2>
              <p className="mt-2">Some third-party providers (Cloudinary, Resend, Google, Meta, Vercel) may process data outside Kenya. We ensure appropriate safeguards through Standard Contractual Clauses, adequacy decisions, or other lawful transfer mechanisms under the Kenya Data Protection Act, 2019.</p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">10. Data Security</h2>
              <p className="mt-2">We implement appropriate technical and organizational measures: encryption at rest (Supabase/AWS), encryption in transit (TLS 1.2+), access controls, regular security assessments, and staff training. However, no internet transmission is 100% secure.</p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">11. Children's Privacy</h2>
              <p className="mt-2">Our services are not directed to children under 18. We do not knowingly collect personal information from children. If you believe we have collected data from a minor, contact us at privacy@allpropertylink.co.ke.</p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">12. Changes to This Policy</h2>
              <p className="mt-2">We may update this policy periodically. Material changes will be communicated via email or prominent site notice. The "Last updated" date at the top reflects the latest revision. Continued use constitutes acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-text-primary">13. Contact Us</h2>
              <p className="mt-2">For questions, complaints, or to exercise your data protection rights:</p>
              <address className="mt-2 not-italic leading-relaxed">
                <p>All Property Link Kenya Limited</p>
                <p>Email: privacy@allpropertylink.co.ke</p>
                <p>Phone: +254 700 000 000</p>
                <p>Address: Nairobi, Kenya</p>
                <p>Data Protection Officer: dpo@allpropertylink.co.ke</p>
              </address>
              <p className="mt-2">You may also lodge a complaint with the Office of the Data Protection Commissioner, Kenya: <a href="https://www.odpc.go.ke" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">odpc.go.ke</a></p>
            </section>
          </section>
        </section>
      </main>
    </>
  );
}