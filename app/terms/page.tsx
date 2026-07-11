import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for All Property Link Kenya - Terms and conditions governing the use of our real estate platform for buyers, sellers, and agents in Kenya.",
  robots: "index, follow",
};

export default function TermsPage() {
  const lastUpdated = new Date("2024-12-15").toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
        <div className="min-h-[calc(100vh-4rem)] flex flex-col">
          <article className="flex-1 w-full max-w-[65ch] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <header className="mb-10 sm:mb-14 text-center">
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight text-balance mb-4">
                Terms of Service
              </h1>
              <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto">
                Last updated: <time dateTime="2024-12-15">{lastUpdated}</time>
              </p>
            </header>

            <div className="prose prose-lg prose-headings:font-heading prose-headings:text-text-primary prose-text:text-text-secondary prose-a:text-primary-600 prose-a:hover:text-primary-700 prose-a:no-underline hover:prose-a:underline prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:leading-8 prose-li:leading-7 prose-ul:marker:text-primary-400 prose-ol:marker:text-primary-400 max-w-none">
              <section aria-labelledby="introduction">
                <h2 id="introduction">1. Introduction</h2>
                <p>
                  Welcome to All Property Link Kenya ("Platform", "we", "us", or "our"). These Terms of Service ("Terms") govern your access to and use of our real estate platform operating at allpropertylink.co.ke and any associated mobile applications (collectively, the "Services").
                </p>
                <p>
                  By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services. Your continued use of the Services after any changes to these Terms constitutes acceptance of those changes.
                </p>
              </section>

              <section aria-labelledby="definitions">
                <h2 id="definitions">2. Definitions</h2>
                <dl className="space-y-3">
                  <dt className="font-semibold">"Platform"</dt>
                  <dd className="ml-4">All Property Link Kenya's online marketplace for real estate listings, including the website, mobile applications, APIs, and related services.</dd>

                  <dt className="font-semibold">"User" or "You"</dt>
                  <dd className="ml-4">Any individual or entity that accesses or uses the Platform, including visitors, registered users, property seekers, agents, agencies, and developers.</dd>

                  <dt className="font-semibold">"Agent" or "Agent User"</dt>
                  <dd className="ml-4">A licensed real estate agent or agency registered with the Estate Agents Registration Board (EARB) of Kenya who lists properties on behalf of clients.</dd>

                  <dt className="font-semibold">"Listing"</dt>
                  <dd className="ml-4">Any property listing published on the Platform, including residential, commercial, land, and rental properties.</dd>

                  <dt className="font-semibold">"Content"</dt>
                  <dd className="ml-4">All text, images, videos, floor plans, virtual tours, documents, and other materials uploaded or displayed on the Platform.</dd>

                  <dt className="font-semibold">"EARB"</dt>
                  <dd className="ml-4">Estate Agents Registration Board of Kenya, established under the Estate Agents Act (Cap. 533).</dd>

                  <dt className="font-semibold">"Kenyan Law"</dt>
                  <dd className="ml-4">The Constitution of Kenya 2010, the Land Act 2012, the Land Registration Act 2012, the Estate Agents Act (Cap. 533), the Consumer Protection Act 2012, the Data Protection Act 2019, and all other applicable laws of the Republic of Kenya.</dd>
                </dl>
              </section>

              <section aria-labelledby="user-accounts">
                <h2 id="user-accounts">3. User Accounts</h2>

                <h3>3.1 Registration</h3>
                <p>
                  To access certain features of the Platform, you must register for an account. You must provide accurate, current, and complete information during registration and keep your account information updated.
                </p>
                <ul>
                  <li>You must be at least 18 years of age and have legal capacity to enter into contracts under Kenyan law.</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</li>
                  <li>You must notify us immediately of any unauthorized use of your account.</li>
                </ul>

                <h3>3.2 Agent Verification</h3>
                <p>
                  Agents and agencies must provide valid EARB registration details, including a current practicing certificate number. We reserve the right to verify credentials with EARB and reject or suspend accounts with invalid or expired registrations.
                </p>
                <p>
                  Agents must comply with the Estate Agents Act (Cap. 533), the Estate Agents (Practice) Regulations, and the EARB Code of Conduct and Ethics at all times.
                </p>

                <h3>3.3 Account Suspension and Termination</h3>
                <p>
                  We may suspend or terminate your account if you violate these Terms, provide false information, engage in fraudulent activity, or violate Kenyan law. Upon termination, you remain liable for all obligations incurred prior to termination.
                </p>
              </section>

              <section aria-labelledby="agent-responsibilities">
                <h2 id="agent-responsibilities">4. Agent Responsibilities</h2>

                <h3>4.1 Licensing and Compliance</h3>
                <ul>
                  <li>Agents must hold a valid, current practicing certificate issued by EARB.</li>
                  <li>Agents must display their EARB registration number and practicing certificate number on their profile and all listings.</li>
                  <li>Agents must comply with the Estate Agents Act (Cap. 533), the Estate Agents (Practice) Regulations, and the EARB Code of Conduct and Ethics.</li>
                  <li>Agents must not operate without a valid license or employ unlicensed individuals to conduct estate agency work.</li>
                </ul>

                <h3>4.2 Listing Accuracy and Disclosure</h3>
                <ul>
                  <li>All listings must accurately represent the property being marketed, including accurate descriptions, measurements, photographs, and pricing.</li>
                  <li>Agents must disclose all material facts about a property that could affect a buyer's or tenant's decision, including but not limited to: title defects, encumbrances, zoning restrictions, pending litigation, structural defects, and environmental hazards.</li>
                  <li>Agents must not misrepresent property features, location, pricing, or availability.</li>
                  <li>Listings must be updated or removed within 24 hours when a property is sold, leased, or withdrawn from the market.</li>
                </ul>

                <h3>4.3 Client Funds and Trust Accounts</h3>
                <p>
                  Agents must comply with the Estate Agents Act requirements regarding client funds, including maintaining separate trust accounts for client monies, providing receipts for all deposits, and accounting for all funds received on behalf of clients.
                </p>

                <h3>4.4 Professional Conduct</h3>
                <ul>
                  <li>Agents must act in the best interests of their clients with honesty, integrity, and due diligence.</li>
                  <li>Agents must not discriminate against any person on grounds prohibited by Article 27 of the Constitution of Kenya 2010.</li>
                  <li>Agents must not engage in misleading or deceptive advertising, including "bait advertising" or fake listings.</li>
                  <li>Agents must disclose any conflicts of interest in writing to all affected parties.</li>
                </ul>
              </section>

              <section aria-labelledby="listing-rules">
                <h2 id="listing-rules">5. Listing Rules and Content Standards</h2>

                <h3>5.1 Permitted Listings</h3>
                <p>The Platform supports listings for:</p>
                <ul>
                  <li>Residential properties (apartments, houses, townhouses, bungalows)</li>
                  <li>Commercial properties (offices, retail, warehouses, industrial)</li>
                  <li>Land (residential, commercial, agricultural, investment)</li>
                  <li>Rental properties (short-term and long-term)</li>
                  <li>Property developments and off-plan projects (with valid NEMA approvals and county approvals)</li>
                </ul>

                <h3>5.2 Content Requirements</h3>
                <ul>
                  <li>All listings must include accurate property location (county, sub-county, ward, and nearest landmark).</li>
                  <li>Photos must be of the actual property and not misleadingly edited. Virtual staging must be clearly disclosed.</li>
                  <li>Floor areas must be stated in square metres (sqm) as per Kenyan standards.</li>
                  <li>Prices must be in Kenyan Shillings (KES) and include whether the price is negotiable.</li>
                  <li>Listings must specify the property tenure: freehold, leasehold (with remaining lease term), or rental.</li>
                </ul>

                <h3>5.3 Prohibited Content</h3>
                <p>The following content is strictly prohibited on the Platform:</p>
                <ul>
                  <li>Properties with disputed ownership, unresolved succession matters, or pending litigation without full disclosure.</li>
                  <li>Properties on riparian land, road reserves, forest land, or other protected public land in violation of the Land Act 2012 and Environmental Management and Coordination Act (EMCA) 1999.</li>
                  <li>Fraudulent, fictitious, or "ghost" listings created to generate leads.</li>
                  <li>Content that violates Kenyan law, including the Constitution, Penal Code, Land Laws, Consumer Protection Act, or Data Protection Act.</li>
                  <li>Discriminatory language or preferences in listings (e.g., "no tenants from [ethnicity/religion/gender]").</li>
                  <li>Contact information in listing descriptions intended to bypass Platform communication (phone numbers, emails, WhatsApp links in description fields).</li>
                  <li>Explicit, offensive, or inappropriate content.</li>
                  <li>Intellectual property infringement (unauthorized use of photos, floor plans, or virtual tours).</li>
                </ul>

                <h3>5.4 Content Moderation</h3>
                <p>
                  We reserve the right to review, edit, reject, or remove any listing or content that violates these Terms or Kenyan law. We may use automated systems and human moderators to enforce these standards. Agents are responsible for all content they publish.
                </p>
              </section>

              <section aria-labelledby="user-conduct">
                <h2 id="user-conduct">6. User Conduct</h2>
                <p>All Users agree not to:</p>
                <ul>
                  <li>Use the Platform for any unlawful purpose or in violation of Kenyan law.</li>
                  <li>Impersonate another person or entity, or misrepresent your affiliation.</li>
                  <li>Scrape, crawl, or extract data from the Platform without written permission.</li>
                  <li>Interfere with the Platform's security, integrity, or performance.</li>
                  <li>Harass, threaten, or intimidate other users, agents, or our staff.</li>
                  <li>Use the Platform to facilitate fraud, money laundering, or other criminal activities.</li>
                  <li>Post false reviews, testimonials, or ratings.</li>
                  <li>Transmit viruses, malware, or other harmful code.</li>
                </ul>
              </section>

              <section aria-labelledby="intellectual-property">
                <h2 id="intellectual-property">7. Intellectual Property</h2>

                <h3>7.1 Platform IP</h3>
                <p>
                  The Platform, including its design, layout, features, functionality, algorithms, databases, and software, is owned by All Property Link Kenya and protected by Kenyan and international intellectual property laws.
                </p>

                <h3>7.2 User Content License</h3>
                <p>
                  By uploading Content to the Platform, you grant us a non-exclusive, worldwide, royalty-free, sublicensable license to use, reproduce, modify, adapt, publish, translate, display, and distribute the Content for the purpose of operating, promoting, and improving the Platform. This license ends when you remove the Content, except for content shared with other users or incorporated into Platform features.
                </p>
                <p>
                  You represent and warrant that you own or have all necessary rights to the Content you upload, including photographs, floor plans, and virtual tours.
                </p>

                <h3>7.3 Listing Content</h3>
                <p>
                  Listing content (descriptions, photos, floor plans) may be syndicated to partner platforms and portals as part of our service. Agents may opt out of syndication in their account settings.
                </p>
              </section>

              <section aria-labelledby="fees-payments">
                <h2 id="fees-payments">8. Fees and Payments</h2>

                <h3>8.1 Listing Fees</h3>
                <p>
                  Agents and agencies may be charged fees for premium listings, featured placements, and additional services. Current fee schedules are available on the Platform. Fees are quoted in Kenyan Shillings (KES) and are inclusive of applicable VAT.
                </p>

                <h3>8.2 Payment Terms</h3>
                <ul>
                  <li>Fees are payable in advance unless otherwise agreed in writing.</li>
                  <li>We accept payments via M-Pesa, bank transfer, credit/debit card, and other approved payment methods.</li>
                  <li>Failed payments may result in listing suspension until payment is cleared.</li>
                  <li>Refunds are provided in accordance with our Refund Policy and the Consumer Protection Act 2012.</li>
                </ul>

                <h3>8.3 Commission Disputes</h3>
                <p>
                  The Platform is an advertising platform and not a party to agency agreements between agents and clients. Commission disputes between agents and clients are governed by the agency agreement and Kenyan law. We are not liable for commission disputes.
                </p>
              </section>

              <section aria-labelledby="privacy-data">
                <h2 id="privacy-data">9. Privacy and Data Protection</h2>
                <p>
                  Your privacy is important to us. Our collection, use, and disclosure of personal data is governed by our <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">Privacy Policy</Link>, which complies with the Data Protection Act 2019 and the Data Protection (General) Regulations 2021. By using the Platform, you consent to our Privacy Policy.
                </p>
                <p>
                  As a data controller, we are registered with the Office of the Data Protection Commissioner (ODPC) in Kenya. You have rights under the Data Protection Act, including the right to access, rectify, erase, and port your personal data.
                </p>
              </section>

              <section aria-labelledby="disclaimers">
                <h2 id="disclaimers">10. Disclaimers and Limitation of Liability</h2>

                <h3>10.1 Platform Provided "As Is"</h3>
                <p>
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES.
                </p>

                <h3>10.2 Listing Accuracy</h3>
                <p>
                  WE DO NOT VERIFY THE ACCURACY, COMPLETENESS, OR LEGALITY OF LISTINGS. ALL LISTINGS ARE PROVIDED BY AGENTS AND PROPERTY OWNERS. USERS ARE RESPONSIBLE FOR CONDUCTING THEIR OWN DUE DILIGENCE, INCLUDING TITLE SEARCHES AT THE MINISTRY OF LANDS, PHYSICAL INSPECTIONS, AND LEGAL REVIEW BEFORE ENTERING INTO ANY TRANSACTION.
                </p>

                <h3>10.3 No Agency Relationship</h3>
                <p>
                  THE PLATFORM IS AN ADVERTISING PLATFORM ONLY. WE ARE NOT A REAL ESTATE AGENT, BROKER, OR AGENCY. WE DO NOT REPRESENT BUYERS, SELLERS, LANDLORDS, OR TENANTS. NO AGENCY, PARTNERSHIP, OR JOINT VENTURE RELATIONSHIP IS CREATED BETWEEN YOU AND US THROUGH USE OF THE PLATFORM.
                </p>

                <h3>10.4 Limitation of Liability</h3>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY KENYAN LAW, IN NO EVENT SHALL ALL PROPERTY LINK KENYA, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS OPPORTUNITIES, ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM.
                </p>
                <p>
                  OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATED TO THESE TERMS SHALL NOT EXCEED THE TOTAL FEES PAID BY YOU TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR KES 10,000, WHICHEVER IS GREATER.
                </p>
                <p>
                  NOTHING IN THESE TERMS EXCLUDES OR LIMITS LIABILITY FOR DEATH OR PERSONAL INJURY CAUSED BY NEGLIGENCE, FRAUD, FRAUDULENT MISREPRESENTATION, OR ANY LIABILITY THAT CANNOT BE EXCLUDED UNDER KENYAN LAW, INCLUDING THE CONSUMER PROTECTION ACT 2012.
                </p>
              </section>

              <section aria-labelledby="indemnification">
                <h2 id="indemnification">11. Indemnification</h2>
                <p>
                  You agree to indemnify, defend, and hold harmless All Property Link Kenya, its directors, officers, employees, agents, and affiliates from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to:
                </p>
                <ul>
                  <li>Your use of the Platform in violation of these Terms.</li>
                  <li>Your Content, including listings, photos, and communications.</li>
                  <li>Your violation of any Kenyan law or regulation.</li>
                  <li>Your violation of the rights of any third party, including intellectual property rights.</li>
                  <li>Any transaction or dispute between you and another user.</li>
                </ul>
              </section>

              <section aria-labelledby="dispute-resolution">
                <h2 id="dispute-resolution">12. Dispute Resolution</h2>

                <h3>12.1 Informal Resolution</h3>
                <p>
                  Before initiating formal proceedings, the parties agree to attempt good-faith negotiation to resolve any dispute. Either party may initiate informal negotiations by providing written notice to the other party describing the dispute.
                </p>

                <h3>12.2 Mediation</h3>
                <p>
                  If informal negotiations fail within thirty (30) days, the dispute shall be referred to mediation at the Nairobi Centre for International Arbitration (NCIA) or the Chartered Institute of Arbitrators (Kenya Branch), in accordance with their mediation rules. The mediator shall be appointed by mutual agreement or, failing agreement, by the NCIA.
                </p>

                <h3>12.3 Arbitration</h3>
                <p>
                  If mediation fails, the dispute shall be finally resolved by arbitration under the Arbitration Act 1995 (Cap. 49) at the Nairobi Centre for International Arbitration (NCIA), in Nairobi, Kenya, in the English language, before a single arbitrator appointed in accordance with the NCIA Rules. The award shall be final and binding.
                </p>

                <h3>12.4 Court Jurisdiction</h3>
                <p>
                  Notwithstanding the foregoing, either party may seek urgent interlocutory relief from the High Court of Kenya at Nairobi. For any matter not subject to arbitration, the parties submit to the exclusive jurisdiction of the courts of Kenya, with the High Court at Nairobi having primary jurisdiction.
                </p>
              </section>

              <section aria-labelledby="governing-law">
                <h2 id="governing-law">13. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya, including but not limited to:
                </p>
                <ul>
                  <li>The Constitution of Kenya 2010</li>
                  <li>The Land Act 2012</li>
                  <li>The Land Registration Act 2012</li>
                  <li>The Estate Agents Act (Cap. 533)</li>
                  <li>The Consumer Protection Act 2012</li>
                  <li>The Data Protection Act 2019</li>
                  <li>The Arbitration Act 1995</li>
                  <li>The Contract Act (Cap. 23)</li>
                  <li>The Law of Contract Act (Cap. 23)</li>
                </ul>
              </section>

              <section aria-labelledby="termination">
                <h2 id="termination">14. Termination</h2>
                <p>
                  We may terminate or suspend your access to the Platform immediately, with or without notice, for any reason, including breach of these Terms. Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive termination shall survive, including Sections 7, 9, 10, 11, 12, 13, and 14.
                </p>
              </section>

              <section aria-labelledby="changes">
                <h2 id="changes">15. Changes to Terms</h2>
                <p>
                  We may modify these Terms at any time. Material changes will be communicated via email (to your registered email address) and/or a prominent notice on the Platform at least thirty (30) days before the effective date. Your continued use of the Platform after the effective date constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section aria-labelledby="general">
                <h2 id="general">16. General Provisions</h2>

                <h3>16.1 Entire Agreement</h3>
                <p>These Terms, together with our Privacy Policy, Cookie Policy, and any other policies referenced herein, constitute the entire agreement between you and us regarding the Platform.</p>

                <h3>16.2 Severability</h3>
                <p>If any provision of these Terms is held invalid or unenforceable under Kenyan law, the remaining provisions shall continue in full force and effect.</p>

                <h3>16.3 Waiver</h3>
                <p>No waiver of any term shall be deemed a continuing waiver. Our failure to enforce any right shall not constitute a waiver of that right.</p>

                <h3>16.4 Assignment</h3>
                <p>You may not assign these Terms without our prior written consent. We may assign these Terms freely.</p>

                <h3>16.5 Notices</h3>
                <p>Notices to us shall be sent to: legal@allpropertylink.co.ke or All Property Link Kenya, [Registered Address], Nairobi, Kenya. Notices to you shall be sent to your registered email address.</p>

                <h3>16.6 Language</h3>
                <p>These Terms are in English. In case of any discrepancy with a translated version, the English version prevails.</p>
              </section>

              <section aria-labelledby="contact">
                <h2 id="contact">17. Contact Us</h2>
                <address className="not-italic">
                  <p><strong>All Property Link Kenya</strong></p>
                  <p>Email: legal@allpropertylink.co.ke</p>
                  <p>Support: support@allpropertylink.co.ke</p>
                  <p>Phone: +254 7XX XXX XXX</p>
                  <p>Address: [Registered Office Address], Nairobi, Kenya</p>
                  <p>EARB Registration: [Registration Number]</p>
                  <p>Data Protection Registration: ODPC/[Registration Number]</p>
                </address>
              </section>
            </div>
          </article>
        </div>
    </>
  );
}