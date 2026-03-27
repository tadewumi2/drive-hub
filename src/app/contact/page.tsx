import type { Metadata } from "next";
import Link from "next/link";
import { Car } from "lucide-react";
import { auth } from "@/lib/auth";
import ContactForm from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact & Support",
  description:
    "Get help with bookings, payments, or your account. Our support team responds within 1 business day.",
};

const FAQ = [
  {
    q: "How do I cancel a booking?",
    a: "Go to your Dashboard → Bookings, find the booking, and click Cancel. Cancellations made 48+ hours before the lesson receive a full refund. 24–48 hours receive 50%. Under 24 hours are non-refundable.",
  },
  {
    q: "When will I receive my refund?",
    a: "Refunds are processed immediately upon cancellation and typically appear on your statement within 5–10 business days depending on your bank.",
  },
  {
    q: "What happens if my instructor doesn't approve my booking?",
    a: "Instructors have 30 minutes to approve after payment. If they don't respond in time, your booking is automatically cancelled and you receive a full refund.",
  },
  {
    q: "Can I reschedule a lesson?",
    a: "Rescheduling is done by cancelling the current booking and placing a new one. Make sure to cancel at least 48 hours in advance to qualify for a full refund.",
  },
  {
    q: "How do I become an instructor on DriveHub?",
    a: "Sign up at the instructor registration page, then upload your driving licence, instructor certificate, and vehicle insurance. Our team reviews submissions within 2 business days.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. All payments are processed by Stripe, a PCI-DSS Level 1 certified provider. DriveHub never stores your card details.",
  },
  {
    q: "How are instructors verified?",
    a: "Every instructor submits identity, certification, and insurance documents. Our admin team manually reviews each submission before the instructor can accept bookings.",
  },
  {
    q: "Can I leave a review after my lesson?",
    a: "Yes — after a confirmed lesson is completed, a review option appears on your Bookings dashboard. You can leave one review per lesson.",
  },
];

export default async function ContactPage() {
  const session = await auth();

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
          <div className="flex items-center gap-3">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white px-5 py-2 rounded-full transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="text-sm font-medium text-[var(--navy)] hover:text-[var(--gold)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="text-sm font-semibold bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white px-5 py-2 rounded-full transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--navy)]">
            How can we help?
          </h1>
          <p className="mt-3 text-lg text-slate-500 max-w-xl mx-auto">
            Send us a message and we&apos;ll get back to you within 1 business day.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-[var(--navy)] mb-6">Send a message</h2>
              <ContactForm defaultEmail={session?.user?.email ?? ""} />
            </div>
          </div>

          {/* Sidebar info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-[var(--navy)] mb-4">Other ways to reach us</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-base">✉️</span>
                  <div>
                    <p className="font-medium text-slate-800">Email</p>
                    <a href="mailto:support@drivehub.ca" className="text-[var(--gold)] hover:underline">
                      support@drivehub.ca
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-base">⏱️</span>
                  <div>
                    <p className="font-medium text-slate-800">Response time</p>
                    <p className="text-slate-500">Within 1 business day</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-base">🕘</span>
                  <div>
                    <p className="font-medium text-slate-800">Support hours</p>
                    <p className="text-slate-500">Mon – Fri, 9 AM – 6 PM ET</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-[var(--navy)] mb-3">Quick links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/policies/cancellation" className="text-[var(--gold)] hover:underline">
                    Cancellation &amp; Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/policies/terms" className="text-[var(--gold)] hover:underline">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/policies/privacy" className="text-[var(--gold)] hover:underline">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div id="faq" className="mt-16">
          <h2 className="text-2xl font-bold text-[var(--navy)] mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
              >
                <h3 className="font-semibold text-[var(--navy)] mb-2 text-sm sm:text-base">
                  {item.q}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
