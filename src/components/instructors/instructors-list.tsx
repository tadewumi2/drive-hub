"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, MapPin, Car, Clock, Star, Filter, X } from "lucide-react";

interface Availability {
  dayOfWeek: string;
  startHour: number;
  endHour: number;
}

interface Instructor {
  id: string;
  userId: string;
  name: string;
  bio: string;
  carType: string;
  location: string;
  hourlyRate: number;
  image: string | null;
  availability: Availability[];
}

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
];

function getAvailabilityLabel(availability: Availability[]): string {
  const days = [...new Set(availability.map((a) => a.dayOfWeek))];
  if (days.length === 0) return "No availability set";

  const sorted = days.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
  const labels = sorted.map((d) => DAY_LABELS[d]);

  // Check for consecutive ranges
  if (labels.length > 2) {
    return `${labels[0]} – ${labels[labels.length - 1]}`;
  }
  return labels.join(", ");
}

function getHourRange(availability: Availability[]): string {
  if (availability.length === 0) return "";
  const minHour = Math.min(...availability.map((a) => a.startHour));
  const maxHour = Math.max(...availability.map((a) => a.endHour));
  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}${period}`;
  };
  return `${formatHour(minHour)} – ${formatHour(maxHour)}`;
}

export default function InstructorsList({
  instructors,
}: {
  instructors: Instructor[];
}) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [searchName, setSearchName] = useState(initialSearch);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return instructors.filter((inst) => {
      // Name search
      if (
        searchName &&
        !inst.name.toLowerCase().includes(searchName.toLowerCase())
      ) {
        return false;
      }

      // Day filter
      if (selectedDay) {
        const hasDay = inst.availability.some(
          (a) => a.dayOfWeek === selectedDay,
        );
        if (!hasDay) return false;
      }

      // Hour filter
      if (selectedHour) {
        const hour = parseInt(selectedHour);
        const hasHour = inst.availability.some(
          (a) =>
            a.startHour <= hour &&
            a.endHour > hour &&
            (!selectedDay || a.dayOfWeek === selectedDay),
        );
        if (!hasHour) return false;
      }

      return true;
    });
  }, [instructors, searchName, selectedDay, selectedHour]);

  const hasActiveFilters = selectedDay || selectedHour;

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-10">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search instructor by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)]"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--navy)] hover:text-[var(--gold)] transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filter by availability
          {hasActiveFilters && (
            <span className="bg-[var(--gold)] text-white text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </button>

        {/* Filter options */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mt-4 flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Day of Week
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] bg-white"
              >
                <option value="">Any day</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Time of Day
              </label>
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] bg-white"
              >
                <option value="">Any time</option>
                {Array.from({ length: 13 }, (_, i) => i + 7).map((h) => {
                  const period = h >= 12 ? "PM" : "AM";
                  const hour = h % 12 || 12;
                  return (
                    <option key={h} value={h}>
                      {hour}:00 {period}
                    </option>
                  );
                })}
              </select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedDay("");
                    setSelectedHour("");
                  }}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium pb-2.5"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-6">
        {filtered.length} instructor{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Instructor Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium text-[var(--navy)]">
            No instructors found
          </p>
          <p className="text-slate-500 mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((inst, i) => (
            <motion.div
              key={inst.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {/* Photo */}
              <div className="relative h-56 bg-slate-100 overflow-hidden">
                <Image
                  src={
                    inst.image ||
                    PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length]
                  }
                  alt={inst.name}
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-[var(--navy)] shadow-sm">
                  ${inst.hourlyRate}/hr
                </div>
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
                      className="w-3.5 h-3.5 fill-[var(--gold)] text-[var(--gold)]"
                    />
                  ))}
                  <span className="text-xs text-slate-400 ml-1">5.0</span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {inst.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Car className="w-3.5 h-3.5 shrink-0" />
                    {inst.carType}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {getAvailabilityLabel(inst.availability)}{" "}
                    {getHourRange(inst.availability) &&
                      `• ${getHourRange(inst.availability)}`}
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-400 line-clamp-2">
                  {inst.bio}
                </p>

                <Link href={`/instructors/${inst.id}`} className="block mt-5">
                  <button className="w-full bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white font-semibold text-sm py-2.5 rounded-full transition-colors shadow-md shadow-amber-200/30">
                    View Profile
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
