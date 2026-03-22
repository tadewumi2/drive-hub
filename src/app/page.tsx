"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Car,
  ShieldCheck,
  CalendarCheck,
  DollarSign,
  Star,
  MapPin,
  ChevronDown,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

const instructors = [
  {
    name: "David M.",
    rating: 4.9,
    reviews: 120,
    bullets: ["15+ Years Experience", "Automatic & Manual"],
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Sarah L.",
    rating: 4.9,
    reviews: 120,
    bullets: ["Multilingual: English, Hindi", "Automatic"],
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Ahmed K.",
    rating: 4.8,
    reviews: 120,
    bullets: ["10+ Years Experience", "Positive & Manual"],
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Instructors",
    desc: "Licensed instructors verified for safety.",
  },
  {
    icon: CalendarCheck,
    title: "Easy Booking",
    desc: "Book lessons conveniently online.",
  },
  {
    icon: DollarSign,
    title: "Affordable Rates",
    desc: "Competitive pricing for all budgets.",
  },
  {
    icon: Car,
    title: "Road Test Prep",
    desc: "Get ready for your driving test.",
  },
];

export default function HomePage() {
  const [searchName, setSearchName] = useState("");

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Header ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--gold)] rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--navy)]">
              DriveHub
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--navy)]">
            <Link
              href="/instructors"
              className="hover:text-[var(--gold)] transition-colors"
            >
              For Students
            </Link>
            <Link
              href="/auth/sign-in"
              className="hover:text-[var(--gold)] transition-colors"
            >
              For Instructors
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-[var(--gold)] transition-colors"
            >
              How It Works
            </Link>
          </nav>

          <Link
            href="/auth/sign-in"
            className="text-sm font-semibold text-[var(--navy)] border-2 border-[var(--navy)] rounded-full px-6 py-2 hover:bg-[var(--navy)] hover:text-white transition-all"
          >
            Log In
          </Link>
          <Link
            href="/auth/sign-up"
            className="text-sm font-semibold bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white rounded-full px-6 py-2 transition-colors shadow-md shadow-amber-200/40"
          >
            Sign Up
          </Link>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <section className="relative pt-16 bg-gradient-to-b from-[#e9eff8] to-[#dce6f3] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center min-h-[85vh] py-16 lg:py-0">
          {/* Left */}
          <div className="relative z-10">
            <motion.h1
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.15] text-[var(--navy)]"
            >
              Find Your Ideal
              <br />
              Driving Instructor
            </motion.h1>

            <motion.p
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-4 text-base text-slate-500 max-w-md"
            >
              Connecting Students &amp; Qualified Instructors for Effective
              Driving Lessons
            </motion.p>

            {/* Search Bar */}
            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-8 bg-white rounded-full shadow-lg flex items-center p-1.5 max-w-xl"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 flex-1 border-r border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your location"
                  className="text-sm text-slate-700 placeholder:text-slate-400 bg-transparent outline-none w-full"
                />
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 flex-1 border-r border-slate-100 cursor-pointer">
                <span className="text-sm text-slate-400">
                  Choose lesson type
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 flex-1 border-r border-slate-100 cursor-pointer">
                <span className="text-sm text-slate-400">Select date</span>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />
              </div>
              <Link href="/instructors">
                <button className="bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors whitespace-nowrap">
                  Search Instructors
                </button>
              </Link>
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-6 flex items-center gap-6 text-sm text-slate-500"
            >
              <span>
                Trusted by <strong className="text-[var(--navy)]">100+</strong>{" "}
                Instructors
              </span>
              <span className="text-slate-300">|</span>
              <span>
                Over <strong className="text-[var(--navy)]">1,000</strong>{" "}
                Successful Lessons
              </span>
            </motion.div>
          </div>

          {/* Right — Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:flex justify-end"
          >
            <div className="relative w-135 h-90">
              <Image
                src="/hero-image.png"
                alt="Learn to drive - get your license with us"
                fill
                className="object-cover object-center rounded-3xl"
                priority
              />
              {/* Map pin decorations */}
              <div className="absolute top-8 right-8 w-10 h-10 bg-[var(--gold)] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="absolute top-20 left-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path
              d="M0 60L60 50C120 40 240 20 360 16C480 12 600 24 720 28C840 32 960 28 1080 22C1200 16 1320 8 1380 4L1440 0V60H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ── Top-Rated Instructors ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center text-[var(--navy)] mb-14"
          >
            Top-Rated Instructors
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {instructors.map((inst, i) => (
              <motion.div
                key={inst.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                {/* Photo */}
                <div className="relative h-60 bg-slate-100 overflow-hidden">
                  <Image
                    src={inst.image}
                    alt={inst.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[var(--navy)]">
                    {inst.name}
                  </h3>

                  <div className="flex items-center gap-1 mt-1.5">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]"
                      />
                    ))}
                    <span className="text-sm font-semibold text-[var(--navy)] ml-1">
                      {inst.rating}
                    </span>
                    <span className="text-sm text-slate-400">
                      ({inst.reviews} reviews)
                    </span>
                  </div>

                  <ul className="mt-3 space-y-1">
                    {inst.bullets.map((b) => (
                      <li key={b} className="text-sm text-slate-500">
                        • {b}
                      </li>
                    ))}
                  </ul>

                  <Link href="/instructors" className="block mt-5">
                    <button className="w-full bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white font-semibold text-sm py-2.5 rounded-full transition-colors shadow-md shadow-amber-200/30">
                      View Profile
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose DriveHub ── */}
      <section id="why-us" className="py-20 bg-[var(--blue-softer)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center text-[var(--navy)] mb-14"
          >
            Why Choose DriveHub?
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm text-[var(--navy)] mb-4">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-[var(--navy)] mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-[var(--navy)]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-between gap-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Ready to Start Driving?
              </h2>
              <p className="mt-2 text-slate-300 max-w-md">
                Sign up today and book your first driving lesson with a
                top-rated instructor!
              </p>
            </div>
            <Link href="/auth/sign-up">
              <button className="bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-lg shadow-amber-500/20 whitespace-nowrap text-base">
                Get Started
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[var(--navy-dark)] text-white py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[var(--gold)] rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">DriveHub</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connecting students with qualified instructors for safe,
                effective driving lessons.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <Link
                    href="/auth/sign-up"
                    className="hover:text-white transition-colors"
                  >
                    For Students
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/sign-in"
                    className="hover:text-white transition-colors"
                  >
                    For Instructors
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>Contact Us</li>
                <li>Safety Tips</li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>Facebook</li>
                <li>Instagram</li>
                <li>Twitter</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} DriveHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
