"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Car,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

interface Availability {
  dayOfWeek: string;
  startHour: number;
  endHour: number;
}

interface BookedSlot {
  date: string;
  startHour: number;
}

interface Instructor {
  id: string;
  name: string;
  bio: string;
  carType: string;
  location: string;
  hourlyRate: number;
  image: string | null;
  availability: Availability[];
  exceptions: { date: string; isBlocked: boolean }[];
  bookedSlots: BookedSlot[];
}

const DAYS_MAP: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face";

function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:00 ${period}`;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function InstructorProfileView({
  instructor,
  isLoggedIn,
}: {
  instructor: Instructor;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    hour: number;
  } | null>(null);

  // Generate days for the current week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentWeekStart]);

  // Get available hours for a specific date
  function getAvailableHours(date: Date): number[] {
    const dayName = Object.keys(DAYS_MAP).find(
      (key) => DAYS_MAP[key] === date.getDay(),
    );
    if (!dayName) return [];

    // Check if date is blocked
    const isBlocked = instructor.exceptions.some((ex) => {
      const exDate = new Date(ex.date);
      return isSameDay(exDate, date) && ex.isBlocked;
    });
    if (isBlocked) return [];

    // Get rules for this day
    const rules = instructor.availability.filter(
      (a) => a.dayOfWeek === dayName,
    );

    const hours = rules.map((r) => r.startHour);

    // Remove booked slots
    const available = hours.filter((hour) => {
      const isBooked = instructor.bookedSlots.some((b) => {
        const bDate = new Date(b.date);
        return isSameDay(bDate, date) && b.startHour === hour;
      });
      return !isBooked;
    });

    // Remove past hours for today
    if (isSameDay(date, new Date())) {
      const currentHour = new Date().getHours();
      return available.filter((h) => h > currentHour);
    }

    return available;
  }

  function navigateWeek(direction: number) {
    setCurrentWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + direction * 7);
      return next;
    });
    setSelectedSlot(null);
  }

  function handleSlotClick(date: Date, hour: number) {
    setSelectedSlot({ date, hour });
  }

  function handleBooking() {
    if (!selectedSlot) return;

    if (!isLoggedIn) {
      router.push(
        `/auth/sign-in?callbackUrl=${encodeURIComponent(
          `/instructors/${instructor.id}`,
        )}`,
      );
      return;
    }

    const dateStr = selectedSlot.date.toISOString().split("T")[0];
    router.push(
      `/booking?instructor=${instructor.id}&date=${dateStr}&hour=${selectedSlot.hour}`,
    );
  }

  const weekLabel = `${weekDays[0].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${weekDays[6].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const isPastWeek = currentWeekStart <= today;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* ── Left Column: Instructor Info ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="lg:col-span-1"
      >
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Photo */}
          <div className="relative h-72 bg-slate-100">
            <Image
              src={instructor.image || PLACEHOLDER_IMAGE}
              alt={instructor.name}
              fill
              className="object-cover object-top"
              priority
            />
          </div>

          {/* Details */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-[var(--navy)]">
              {instructor.name}
            </h1>

            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, s) => (
                <Star
                  key={s}
                  className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]"
                />
              ))}
              <span className="text-sm font-semibold text-[var(--navy)] ml-1">
                5.0
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                {instructor.location}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Car className="w-4 h-4 text-slate-400 shrink-0" />
                {instructor.carType}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                1-hour lessons
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-500">Hourly Rate</span>
                <span className="text-2xl font-bold text-[var(--navy)]">
                  ${instructor.hourlyRate}
                  <span className="text-sm font-normal text-slate-400">
                    /hr
                  </span>
                </span>
              </div>
            </div>

            {instructor.bio && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-[var(--navy)] mb-2">
                  About
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {instructor.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Right Column: Availability Calendar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="lg:col-span-2"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[var(--navy)]" />
              <h2 className="text-lg font-bold text-[var(--navy)]">
                Available Slots
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateWeek(-1)}
                disabled={isPastWeek}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs sm:text-sm font-medium text-[var(--navy)] min-w-[120px] sm:min-w-[180px] text-center">
                {weekLabel}
              </span>
              <button
                onClick={() => navigateWeek(1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto -mx-1">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-2 min-w-[340px]">
            {/* Day headers */}
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              const isPast = day < today;
              return (
                <div
                  key={i}
                  className={`text-center pb-3 border-b border-slate-100 ${
                    isPast ? "opacity-40" : ""
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    {DAY_NAMES[day.getDay()]}
                  </p>
                  <p
                    className={`text-lg font-bold mt-0.5 ${
                      isToday ? "text-[var(--gold)]" : "text-[var(--navy)]"
                    }`}
                  >
                    {day.getDate()}
                  </p>
                </div>
              );
            })}

            {/* Time slots */}
            {weekDays.map((day, dayIndex) => {
              const isPast = day < today;
              const hours = isPast ? [] : getAvailableHours(day);

              return (
                <div key={dayIndex} className="space-y-1.5 pt-2">
                  {hours.length === 0 ? (
                    <p className="text-xs text-slate-300 text-center py-4">—</p>
                  ) : (
                    hours.map((hour) => {
                      const isSelected =
                        selectedSlot &&
                        isSameDay(selectedSlot.date, day) &&
                        selectedSlot.hour === hour;

                      return (
                        <button
                          key={hour}
                          onClick={() => handleSlotClick(day, hour)}
                          className={`w-full text-[10px] sm:text-xs font-medium py-1.5 sm:py-2 rounded-lg transition-all ${
                            isSelected
                              ? "bg-[var(--gold)] text-white shadow-md shadow-amber-200/40"
                              : "bg-[var(--blue-softer)] text-[var(--navy)] hover:bg-[var(--gold-light)] hover:text-[var(--gold-hover)]"
                          }`}
                        >
                          {formatHour(hour)}
                        </button>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>

          </div>
          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[var(--blue-softer)]" />
              <span className="text-xs text-slate-500">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[var(--gold)]" />
              <span className="text-xs text-slate-500">Selected</span>
            </div>
          </div>

          {/* Booking Action */}
          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-[var(--gold-light)] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--navy)]">
                  Selected Lesson
                </p>
                <p className="text-sm text-slate-600 mt-0.5">
                  {selectedSlot.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  at {formatHour(selectedSlot.hour)}
                </p>
                <p className="text-sm font-bold text-[var(--navy)] mt-1">
                  Total: ${instructor.hourlyRate}
                </p>
              </div>
              <button
                onClick={handleBooking}
                className="bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg shadow-amber-200/30 whitespace-nowrap"
              >
                {isLoggedIn ? "Book This Slot" : "Sign In to Book"}
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
