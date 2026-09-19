"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Activity = {
  time: string;
  place: string;
  activity: string;
  cost: number;
};

type DayPlan = {
  day: number;
  title: string;
  morning: Activity;
  lunch: Activity;
  afternoon: Activity;
  dinner: Activity;
  evening: Activity;
  estimatedTotal: number;
};

type Trip = {
  destination: string;
  budget: number;
  days: number;
  travelers: string;
  interests: string[];
  itinerary: DayPlan[];
};

const interestsList = [
  "Food",
  "Nature",
  "Shopping",
  "Culture",
  "Adventure",
  "Nightlife",
];

export default function Home() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function toggleInterest(interest: string) {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  }

  async function generateTrip() {
    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    if (!budget || Number(budget) <= 0) {
      setError("Please enter a valid budget.");
      return;
    }

    if (!days || Number(days) <= 0) {
      setError("Please enter the number of days.");
      return;
    }

    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch("/api/generate-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          budget: Number(budget),
          days: Number(days),
          travelers,
          interests: selectedInterests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate your trip.");
      }

      setTrip(data.trip);

      setTimeout(() => {
        document
          .getElementById("generated-trip")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function saveTrip() {
    if (!trip) return;

    try {
      const savedTrips = JSON.parse(
        localStorage.getItem("savedTrips") || "[]"
      );

      const newTrip = {
        ...trip,
        id: Date.now().toString(),
      };

      localStorage.setItem(
        "savedTrips",
        JSON.stringify([newTrip, ...savedTrips])
      );

      setSaved(true);
    } catch (error) {
      console.error("Could not save trip:", error);
    }
  }

  function resetPlanner() {
    setTrip(null);
    setDestination("");
    setBudget("");
    setDays("");
    setTravelers("1");
    setSelectedInterests([]);
    setError("");
    setSaved(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* NAVIGATION */}
      <nav className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-xl text-white">
              ✈
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight">
                Velora <span className="text-blue-600">Trip</span>
              </div>

              <p className="text-xs text-slate-400">
                Plan Smarter. Travel Further.
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="hidden text-sm font-medium text-blue-600 sm:block"
            >
              Home
            </Link>

            <Link
              href="/my-trips"
              className="text-sm font-medium text-slate-600 hover:text-blue-600"
            >
              My Trips
            </Link>

            <a
              href="#planner"
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Plan a Trip
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[580px] overflow-hidden">
        <Image
          src="/images/hero-travel.jpg"
          alt="Travel destination"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />

        <div className="relative mx-auto flex min-h-[580px] max-w-7xl items-center px-6 py-20">
          <div className="max-w-3xl text-white">

            <div className="mb-5 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              ✦ Powered by Google Gemini AI
            </div>

            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              Your journey,
              <span className="block text-sky-300">
                intelligently planned.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Velora Trip transforms your destination, budget and interests
              into a personalized day-by-day itinerary designed around the
              way you want to travel.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <HeroPill text="Personalized itineraries" />
              <HeroPill text="Budget planning" />
              <HeroPill text="Google Maps integration" />
            </div>

            <a
              href="#planner"
              className="mt-9 inline-block rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg hover:bg-blue-700"
            >
              Start Planning →
            </a>
          </div>
        </div>
      </section>

      {/* PLANNER */}
      <section
        id="planner"
        className="mx-auto max-w-7xl px-6 py-20"
      >
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            AI Travel Planner
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight">
            Plan your next adventure
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Tell us where you want to go and how you like to travel.
            Velora Trip will take care of the planning.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100 md:p-9">

          <div className="grid gap-5 md:grid-cols-2">

            {/* DESTINATION */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Destination
              </label>

              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Tokyo, Japan"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* BUDGET */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Total Budget (RM)
              </label>

              <input
                type="number"
                min="1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 3000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* DAYS */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Number of Days
              </label>

              <input
                type="number"
                min="1"
                max="14"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="e.g. 5"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* TRAVELLERS */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Travellers
              </label>

              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="1">1 Traveller</option>
                <option value="2">2 Travellers</option>
                <option value="3">3 Travellers</option>
                <option value="4">4 Travellers</option>
                <option value="5">5 Travellers</option>
                <option value="6">6 Travellers</option>
              </select>
            </div>
          </div>

          {/* INTERESTS */}
          <div className="mt-7">
            <label className="mb-3 block text-sm font-semibold">
              Travel Interests
            </label>

            <div className="flex flex-wrap gap-3">
              {interestsList.map((interest) => {
                const active =
                  selectedInterests.includes(interest);

                return (
                  <button
                    type="button"
                    key={interest}
                    onClick={() =>
                      toggleInterest(interest)
                    }
                    className={`rounded-full border px-5 py-2.5 text-sm font-medium ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {getInterestIcon(interest)}{" "}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* GENERATE */}
          <button
            type="button"
            onClick={generateTrip}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "✨ Gemini is planning your adventure..."
              : "✨ Generate My Trip"}
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">
            AI-powered trip planning with Google Gemini
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">
              Smarter planning. Better journeys.
            </h2>

            <p className="mt-3 text-slate-500">
              Everything you need to turn an idea into a
              well-planned adventure.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon="✨"
              title="AI-Powered Planning"
              text="Personalized itineraries built around your destination, interests and travel style."
            />

            <FeatureCard
              icon="💰"
              title="Budget Intelligence"
              text="See estimated spending, daily costs and how your itinerary fits your overall budget."
            />

            <FeatureCard
              icon="📍"
              title="Explore With Ease"
              text="Open every recommended location directly in Google Maps while you travel."
            />
          </div>
        </div>
      </section>

      {/* GENERATED RESULT */}
      {trip && (
        <section
          id="generated-trip"
          className="mx-auto max-w-7xl px-6 py-20"
        >

          {/* DESTINATION HERO */}
          <div className="relative mb-10 h-[380px] overflow-hidden rounded-3xl">

            <Image
              src={getDestinationImage(
                trip.destination
              )}
              alt={trip.destination}
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">

              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-200">
                Your Velora Journey
              </p>

              <h2 className="text-4xl font-bold md:text-5xl">
                {trip.destination}
              </h2>

              <div className="mt-4 flex flex-wrap gap-3">
                <TripPill>
                  📅 {trip.days} Days
                </TripPill>

                <TripPill>
                  👥 {trip.travelers}{" "}
                  {Number(trip.travelers) === 1
                    ? "Traveller"
                    : "Travellers"}
                </TripPill>

                <TripPill>
                  💰 RM{" "}
                  {Number(
                    trip.budget
                  ).toLocaleString()}
                </TripPill>

                {trip.interests.length > 0 && (
                  <TripPill>
                    ✨ {trip.interests.join(", ")}
                  </TripPill>
                )}
              </div>
            </div>
          </div>

          {/* BUDGET */}
          <BudgetSection trip={trip} />

          {/* ITINERARY HEADING */}
          <div className="mb-8 mt-16">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Your Itinerary
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Your journey, day by day
            </h2>

            <p className="mt-2 text-slate-500">
              A personalized itinerary created for your
              adventure in {trip.destination}.
            </p>
          </div>

          {/* DAYS */}
          <div className="space-y-8">
            {trip.itinerary.map((day) => (
              <div
                key={day.day}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >

                {/* DAY HEADER */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                      {day.day}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Day {day.day}
                      </p>

                      <h3 className="text-xl font-bold">
                        {day.title}
                      </h3>
                    </div>
                  </div>

                  <div className="w-fit rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    Estimated RM{" "}
                    {Number(
                      day.estimatedTotal
                    ).toLocaleString()}
                  </div>
                </div>

                {/* ACTIVITIES */}
                <div className="p-6 md:p-8">
                  <div className="space-y-5">

                    <TimelineActivity
                      title="Morning"
                      icon="☀️"
                      activity={day.morning}
                    />

                    <TimelineActivity
                      title="Lunch"
                      icon="🍽️"
                      activity={day.lunch}
                    />

                    <TimelineActivity
                      title="Afternoon"
                      icon="🌤️"
                      activity={day.afternoon}
                    />

                    <TimelineActivity
                      title="Dinner"
                      icon="🥢"
                      activity={day.dinner}
                    />

                    <TimelineActivity
                      title="Evening"
                      icon="🌙"
                      activity={day.evening}
                    />

                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">

            <button
              onClick={saveTrip}
              className="rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white hover:bg-blue-700"
            >
              {saved
                ? "✓ Trip Saved"
                : "♡ Save Trip"}
            </button>

            <Link
              href="/my-trips"
              className="rounded-xl border border-slate-200 px-6 py-3.5 text-center font-semibold hover:border-blue-300 hover:text-blue-600"
            >
              My Trips
            </Link>

            <button
              onClick={resetPlanner}
              className="rounded-xl border border-slate-200 px-6 py-3.5 font-semibold hover:border-blue-300 hover:text-blue-600"
            >
              Plan Another Trip
            </button>
          </div>
        </section>
      )}

      {/* DESTINATIONS */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">

          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Inspiration
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Discover your next destination
            </h2>

            <p className="mt-2 text-slate-500">
              Not sure where to go? Start with one of these
              unforgettable destinations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            <DestinationCard
              image="/images/tokyo.jpg"
              name="Tokyo"
              country="Japan"
              onClick={() =>
                chooseDestination(
                  "Tokyo, Japan",
                  setDestination
                )
              }
            />

            <DestinationCard
              image="/images/santorini.jpg"
              name="Santorini"
              country="Greece"
              onClick={() =>
                chooseDestination(
                  "Santorini, Greece",
                  setDestination
                )
              }
            />

            <DestinationCard
              image="/images/bali.jpg"
              name="Bali"
              country="Indonesia"
              onClick={() =>
                chooseDestination(
                  "Bali, Indonesia",
                  setDestination
                )
              }
            />

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
              ✈
            </div>

            <div>
              <p className="font-bold">
                Velora{" "}
                <span className="text-blue-600">
                  Trip
                </span>
              </p>

              <p className="text-xs text-slate-400">
                Plan Smarter. Travel Further.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            © 2026 Velora Trip · Powered by Google
            Gemini AI
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ======================================================
   COMPONENTS
====================================================== */

function HeroPill({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
      ✓ {text}
    </span>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
        {icon}
      </div>

      <h3 className="text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function TripPill({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
      {children}
    </span>
  );
}

function BudgetSection({
  trip,
}: {
  trip: Trip;
}) {
  const estimated =
    getEstimatedTripCost(trip);

  const remaining =
    trip.budget - estimated;

  const average =
    trip.days > 0
      ? estimated / trip.days
      : 0;

  const actualPercentage =
    trip.budget > 0
      ? (estimated / trip.budget) * 100
      : 0;

  const progressPercentage =
    Math.min(actualPercentage, 100);

  const overBudget =
    remaining < 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Budget Intelligence
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            Your trip at a glance
          </h3>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
            overBudget
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {overBudget
            ? "Over Budget"
            : "Within Budget"}
        </span>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <BudgetCard
          title="Total Budget"
          value={`RM ${Number(
            trip.budget
          ).toLocaleString()}`}
        />

        <BudgetCard
          title="Estimated Spending"
          value={`RM ${Math.round(
            estimated
          ).toLocaleString()}`}
        />

        <BudgetCard
          title={
            overBudget
              ? "Over Budget By"
              : "Budget Remaining"
          }
          value={`RM ${Math.abs(
            Math.round(remaining)
          ).toLocaleString()}`}
        />

        <BudgetCard
          title="Average Per Day"
          value={`RM ${Math.round(
            average
          ).toLocaleString()}`}
        />
      </div>

      <div className="mt-7">

        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-500">
            Estimated budget usage
          </span>

          <span className="font-semibold">
            {Math.round(actualPercentage)}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${
              overBudget
                ? "bg-red-500"
                : "bg-blue-600"
            }`}
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Costs are AI-generated estimates and may
          differ from actual travel prices.
        </p>
      </div>
    </div>
  );
}

function BudgetCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}

function TimelineActivity({
  title,
  icon,
  activity,
}: {
  title: string;
  icon: string;
  activity: Activity;
}) {
  if (!activity) return null;

  const mapsUrl =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      activity.place
    )}`;

  return (
    <div className="flex gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
        {icon}
      </div>

      <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-5">

        <div className="flex flex-col justify-between gap-3 sm:flex-row">

          <div>

            <div className="flex items-center gap-2">

              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {title}
              </span>

              <span className="text-sm text-slate-400">
                {activity.time}
              </span>

            </div>

            <h4 className="mt-2 text-lg font-bold">
              {activity.place}
            </h4>

            <p className="mt-2 leading-6 text-slate-600">
              {activity.activity}
            </p>

          </div>

          <span className="h-fit rounded-full bg-white px-3 py-1.5 text-sm font-semibold shadow-sm">
            RM{" "}
            {Number(
              activity.cost
            ).toLocaleString()}
          </span>

        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          📍 View on Google Maps ↗
        </a>

      </div>
    </div>
  );
}

function DestinationCard({
  image,
  name,
  country,
  onClick,
}: {
  image: string;
  name: string;
  country: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-80 overflow-hidden rounded-3xl text-left shadow-lg"
    >

      <Image
        src={image}
        alt={`${name}, ${country}`}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">

        <h3 className="text-2xl font-bold">
          {name}
        </h3>

        <div className="mt-1 flex items-center justify-between">

          <p className="text-sm text-white/80">
            📍 {country}
          </p>

          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            →
          </span>

        </div>
      </div>
    </button>
  );
}

/* ======================================================
   HELPERS
====================================================== */

function getEstimatedTripCost(
  trip: Trip
) {
  return trip.itinerary.reduce(
    (total, day) =>
      total +
      Number(
        day.estimatedTotal || 0
      ),
    0
  );
}

function getDestinationImage(
  destination: string
) {
  const name =
    destination.toLowerCase();

  if (
    name.includes("tokyo") ||
    name.includes("japan")
  ) {
    return "/images/tokyo.jpg";
  }

  if (
    name.includes("bali") ||
    name.includes("indonesia")
  ) {
    return "/images/bali.jpg";
  }

  if (
    name.includes("santorini") ||
    name.includes("greece")
  ) {
    return "/images/santorini.jpg";
  }

  return "/images/hero-travel.jpg";
}

function getInterestIcon(
  interest: string
) {
  switch (interest) {
    case "Food":
      return "🍜";

    case "Nature":
      return "🌿";

    case "Shopping":
      return "🛍️";

    case "Culture":
      return "🏛️";

    case "Adventure":
      return "🧗";

    case "Nightlife":
      return "🌙";

    default:
      return "✨";
  }
}

function chooseDestination(
  destination: string,
  setDestination: (
    value: string
  ) => void
) {
  setDestination(destination);

  document
    .getElementById("planner")
    ?.scrollIntoView({
      behavior: "smooth",
    });
}