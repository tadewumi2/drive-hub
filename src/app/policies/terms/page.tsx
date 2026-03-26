import Link from "next/link";
import { Car, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - DriveHub",
  description: "Read DriveHub's Terms of Service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--blue-softer)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--gold)] rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--navy)]">DriveHub</span>
          </Link>
          <Link
            href="/instructors"
            className="text-sm font-medium text-[var(--navy)] hover:text-[var(--gold)] transition-colors"
          >
            Browse Instructors
          </Link>
        </div>
      </header>

      <main className="pt-28 pb-20 max-w-3xl mx-auto px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[var(--navy)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-12">
          <h1 className="text-3xl font-bold text-[var(--navy)] mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-400 mb-10">Last updated: March 2025</p>

          <div className="space-y-8 text-slate-600 leading-relaxed text-sm">

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using DriveHub (&ldquo;the Platform&rdquo;), you agree to be bound by
                these Terms of Service and all applicable laws and regulations. If you do not agree
                with any of these terms, you are prohibited from using this Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">2. The Platform</h2>
              <p>
                DriveHub is an online marketplace that connects student drivers (&ldquo;Students&rdquo;)
                with independent driving instructors (&ldquo;Instructors&rdquo;). DriveHub facilitates
                booking and payment but is not itself a driving school and does not employ instructors.
                Each Instructor operates as an independent contractor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">3. Eligibility</h2>
              <p>You must be at least 16 years of age to register as a Student. By creating an account, you confirm that:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>You are of legal age or have parental/guardian consent.</li>
                <li>The information you provide is accurate and complete.</li>
                <li>You will keep your account credentials confidential.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">4. Instructor Obligations</h2>
              <p>Instructors who register on DriveHub confirm that they:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Hold a valid driver&apos;s licence and any required provincial instructor certifications.</li>
                <li>Maintain valid vehicle insurance covering commercial driving instruction.</li>
                <li>Will conduct lessons professionally and safely.</li>
                <li>Will not misrepresent their qualifications, location, or availability.</li>
              </ul>
              <p className="mt-3">
                DriveHub reserves the right to suspend or remove any Instructor who violates these
                obligations or receives consistent negative feedback.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">5. Booking &amp; Payment</h2>
              <p>
                When a Student submits a booking request, no charge is made until the Instructor
                approves the request. Payment is processed securely via Stripe. By booking a lesson,
                you agree to our{" "}
                <Link href="/policies/cancellation" className="text-[var(--gold)] hover:underline font-medium">
                  Cancellation &amp; Refund Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">6. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use the Platform for any unlawful purpose.</li>
                <li>Harass, threaten, or harm other users.</li>
                <li>Provide false reviews or ratings.</li>
                <li>Attempt to circumvent Platform payments (e.g., paying instructors directly to avoid fees).</li>
                <li>Scrape, crawl, or systematically download Platform content.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">7. Reviews</h2>
              <p>
                Students may leave one review per completed lesson. Reviews must be honest and based
                on actual experience. DriveHub may remove reviews that violate community standards,
                are fraudulent, or contain personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">8. Limitation of Liability</h2>
              <p>
                DriveHub is a marketplace and is not liable for the actions, omissions, or conduct of
                any Instructor during a lesson. To the fullest extent permitted by applicable Canadian
                law, DriveHub&apos;s total liability shall not exceed the amount you paid for the
                specific booking giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">9. Intellectual Property</h2>
              <p>
                All content on the Platform (text, graphics, logos, software) is the property of
                DriveHub or its licensors and is protected by Canadian copyright law. You may not
                reproduce, distribute, or create derivative works without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">10. Termination</h2>
              <p>
                DriveHub may suspend or terminate your account at any time for violations of these
                Terms. You may delete your account at any time by contacting{" "}
                <a href="mailto:support@drivehub.ca" className="text-[var(--gold)] hover:underline font-medium">
                  support@drivehub.ca
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">11. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the Province of Ontario and the federal laws
                of Canada applicable therein, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">12. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Changes will be posted on this page with
                an updated date. Continued use of the Platform after changes constitutes your acceptance
                of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">13. Contact</h2>
              <p>
                For questions about these Terms, contact us at{" "}
                <a href="mailto:legal@drivehub.ca" className="text-[var(--gold)] hover:underline font-medium">
                  legal@drivehub.ca
                </a>
                .
              </p>
            </section>

          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-8 text-sm text-slate-400">
          <Link href="/policies/cancellation" className="hover:text-[var(--navy)] transition-colors">
            Cancellation Policy
          </Link>
          <span>·</span>
          <Link href="/policies/privacy" className="hover:text-[var(--navy)] transition-colors">
            Privacy Policy
          </Link>
        </div>
      </main>
    </div>
  );
}
