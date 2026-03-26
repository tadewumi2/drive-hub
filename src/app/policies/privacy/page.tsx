import Link from "next/link";
import { Car, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - DriveHub",
  description: "Read DriveHub's Privacy Policy and learn how we handle your data.",
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-[var(--navy)] mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-400 mb-10">Last updated: March 2025</p>

          <div className="space-y-8 text-slate-600 leading-relaxed text-sm">

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">1. Introduction</h2>
              <p>
                DriveHub (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to
                protecting your privacy. This Privacy Policy explains what personal information we
                collect, how we use it, and your rights under Canada&apos;s{" "}
                <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA) and
                applicable provincial privacy laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">2. Information We Collect</h2>

              <h3 className="font-semibold text-[var(--navy)] mb-2">Information you provide directly:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Name, email address, and password when you register</li>
                <li>Phone number and pickup address when making a booking</li>
                <li>Profile photo, bio, location, and rate (instructors)</li>
                <li>Verification documents (driving licence, instructor certificate, vehicle insurance) — instructors only</li>
                <li>Review text and star ratings</li>
                <li>Payment information (processed securely by Stripe — we do not store card details)</li>
              </ul>

              <h3 className="font-semibold text-[var(--navy)] mb-2">Information collected automatically:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>IP address and browser/device information</li>
                <li>Pages visited and interactions on the Platform (via PostHog and Plausible analytics)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>To create and manage your account</li>
                <li>To facilitate bookings between Students and Instructors</li>
                <li>To process payments and issue refunds</li>
                <li>To verify instructor credentials and ensure platform safety</li>
                <li>To send transactional emails (booking confirmations, cancellations, etc.)</li>
                <li>To analyse Platform usage and improve our service</li>
                <li>To detect and prevent fraud or abuse</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">4. Sharing Your Information</h2>
              <p>We do not sell your personal information. We share information only:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <strong className="text-[var(--navy)]">With instructors/students:</strong> When a
                  booking is confirmed, relevant contact details are shared between the parties.
                </li>
                <li>
                  <strong className="text-[var(--navy)]">With service providers:</strong> Stripe
                  (payments), Resend (email), Cloudflare R2 (document storage), PostHog (analytics),
                  Neon (database) — all under data processing agreements.
                </li>
                <li>
                  <strong className="text-[var(--navy)]">When required by law:</strong> We may disclose
                  information to comply with a court order or legal process.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">5. Verification Documents</h2>
              <p>
                Instructor verification documents (driving licence, instructor certificate, vehicle
                insurance) are stored securely in private cloud storage (Cloudflare R2). Access is
                restricted to authorised DriveHub administrators only. Documents are never publicly
                accessible and are used solely to verify instructor eligibility.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">6. Cookies</h2>
              <p>
                We use essential cookies to keep you signed in and anonymous analytics cookies
                (Plausible and PostHog) to understand how the Platform is used. You can disable
                non-essential cookies in your browser settings, though this may affect Platform
                functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">7. Data Retention</h2>
              <p>
                We retain your account data for as long as your account is active. If you close your
                account, we delete or anonymise your personal information within 90 days, except where
                we are required to retain it for legal or financial compliance purposes (e.g., payment
                records retained for 7 years per Canadian tax law).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">8. Your Rights</h2>
              <p>Under PIPEDA, you have the right to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Access the personal information we hold about you</li>
                <li>Correct inaccurate information</li>
                <li>Withdraw consent (where processing is consent-based)</li>
                <li>Request deletion of your account and associated data</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@drivehub.ca" className="text-[var(--gold)] hover:underline font-medium">
                  privacy@drivehub.ca
                </a>
                . We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">9. Security</h2>
              <p>
                We implement industry-standard security measures including HTTPS (TLS), encrypted
                password storage (bcrypt), JWT-based authentication, and role-based access controls.
                No method of transmission over the Internet is 100% secure; we cannot guarantee
                absolute security but take reasonable precautions to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">10. Children&apos;s Privacy</h2>
              <p>
                Our Platform is not directed at children under 13. We do not knowingly collect
                personal information from children under 13. If you believe we have inadvertently
                collected such information, please contact us and we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify registered users of
                material changes by email. The &ldquo;Last updated&rdquo; date at the top of this
                page reflects the most recent revision.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">12. Contact</h2>
              <p>
                For privacy-related questions or concerns, contact our Privacy Officer at{" "}
                <a href="mailto:privacy@drivehub.ca" className="text-[var(--gold)] hover:underline font-medium">
                  privacy@drivehub.ca
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
          <Link href="/policies/terms" className="hover:text-[var(--navy)] transition-colors">
            Terms of Service
          </Link>
        </div>
      </main>
    </div>
  );
}
