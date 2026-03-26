import Link from "next/link";
import { Car, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy - DriveHub",
  description: "Learn about DriveHub's cancellation and refund policy for driving lessons.",
};

export default function CancellationPolicyPage() {
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

      <main className="pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[var(--navy)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-12">
          <h1 className="text-3xl font-bold text-[var(--navy)] mb-2">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="text-sm text-slate-400 mb-10">Last updated: March 2025</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">Overview</h2>
              <p>
                We understand that plans change. This policy explains how cancellations and
                refunds work on DriveHub so you always know what to expect before booking a
                driving lesson.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">
                Student Cancellations
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 font-semibold text-[var(--navy)] border border-slate-200 rounded-tl-lg">
                        Notice Given
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--navy)] border border-slate-200 rounded-tr-lg">
                        Refund
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 border border-slate-200">48 hours or more before lesson</td>
                      <td className="px-4 py-3 border border-slate-200 text-green-600 font-medium">100% refund</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-3 border border-slate-200">24–48 hours before lesson</td>
                      <td className="px-4 py-3 border border-slate-200 text-amber-600 font-medium">50% refund</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border border-slate-200">Less than 24 hours before lesson</td>
                      <td className="px-4 py-3 border border-slate-200 text-red-500 font-medium">No refund</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-3 border border-slate-200">No-show (lesson not attended)</td>
                      <td className="px-4 py-3 border border-slate-200 text-red-500 font-medium">No refund</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm">
                To cancel a booking, go to your{" "}
                <Link href="/dashboard/bookings" className="text-[var(--gold)] hover:underline font-medium">
                  Bookings dashboard
                </Link>{" "}
                and select the lesson you wish to cancel. Refunds are processed within 5–10 business days
                to your original payment method.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">
                Instructor Cancellations
              </h2>
              <p>
                If an instructor cancels a confirmed booking for any reason, you will receive a
                <strong className="text-[var(--navy)]"> 100% refund</strong> regardless of when
                the cancellation occurs. We will also notify you immediately by email so you can
                rebook with another instructor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">
                Pending Approval Bookings
              </h2>
              <p>
                Bookings in <strong className="text-[var(--navy)]">Pending Approval</strong> status
                (awaiting instructor confirmation) are fully refundable at any time before the
                instructor approves. Your card is charged only after the instructor approves the booking.
                If the instructor does not respond within 30 minutes, the booking is automatically
                cancelled and no charge is made.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">
                Special Circumstances
              </h2>
              <p>
                We consider refund requests outside the standard policy on a case-by-case basis for
                situations beyond your control, including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Medical emergencies (with documentation)</li>
                <li>Severe weather warnings issued by Environment Canada</li>
                <li>Road closures or DriveTest centre closures</li>
                <li>Technical issues with our platform</li>
              </ul>
              <p className="mt-3">
                Contact us at{" "}
                <a href="mailto:support@drivehub.ca" className="text-[var(--gold)] hover:underline font-medium">
                  support@drivehub.ca
                </a>{" "}
                within 48 hours of the lesson with supporting documentation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">
                How Refunds Are Processed
              </h2>
              <p>
                All refunds are issued to the original payment method used at checkout (credit card,
                debit card, etc.) via Stripe. Processing time is typically 5–10 business days and may
                vary by your financial institution. DriveHub does not charge any administrative fee
                for processing refunds.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-3">
                Questions?
              </h2>
              <p>
                If you have any questions about this policy, please reach out to us at{" "}
                <a href="mailto:support@drivehub.ca" className="text-[var(--gold)] hover:underline font-medium">
                  support@drivehub.ca
                </a>
                . We aim to respond within one business day.
              </p>
            </section>

          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-8 text-sm text-slate-400">
          <Link href="/policies/terms" className="hover:text-[var(--navy)] transition-colors">
            Terms of Service
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
