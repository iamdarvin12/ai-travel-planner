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
      }, 150);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating your trip."
      );
    } finally {
      setLoading(false);
    }
  }

  function saveTrip() {
    if (!trip) return;

    try {
      const existing = JSON.parse(
        localStorage.getItem("savedTrips") || "[]"
      );

      const tripToSave = {
        ...trip,
        id: Date.now().toString(),
      };

      localStorage.setItem(
        "savedTrips",
        JSON.stringify([tripToSave, ...existing])
      );

      setSaved(true);
    } catch (error) {
      console.error("Unable to save trip:", error);
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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-xl text-white shadow-lg shadow-blue-200">
              ✈
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight text-slate-900">
                Velora <span className="text-blue-600">Trip</span>
              </div>

              <div className="text-xs text-slate-500">
                Plan Smarter. Travel Further.
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="#planner"
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 sm:block"
            >
              Plan a Trip
            </a>

            <Link
              href="/my-trips"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-600"
            >
              My Trips
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-travel.jpg"
            alt="Beautiful travel destination"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/20" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <span>✦</span>
              AI-powered travel planning
            </div>

            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
              Turn ideas into
              <span className="block text-sky-300">
                extraordinary trips.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
              Velora Trip creates personalized itineraries around your
              destination, budget and interests — so you can spend less time
              planning and more time exploring.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-white">
              <HeroBadge text="Personalized itineraries" />
              <HeroBadge text="Budget-aware planning" />
              <HeroBadge text="Smart daily schedules" />
            </div>

            <a
              href="#planner"
              className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-slate-900 shadow-xl hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Start Planning
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* PLANNER */}
      <section
        id="planner"
        className="relative z-10 mx-auto -mt-8 max-w-7xl px-6 lg:px-8"
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70 md:p-9">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Your Journey Starts Here
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Plan Your Next Adventure
              </h2>

              <p className="mt-2 text-slate-500">
                Tell us how you want to travel and Velora Trip will build your
                personalized itinerary.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              ✦ Powered by Google Gemini
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              label="Destination"
              value={destination}
              onChange={setDestination}
              placeholder="e.g. Tokyo, Japan"
              type="text"
              icon="📍"
            />

            <FormField
              label="Total Budget (RM)"
              value={budget}
              onChange={setBudget}
              placeholder="e.g. 3000"
              type="number"
              icon="💳"
            />

            <FormField
              label="Number of Days"
              value={days}
              onChange={setDays}
              placeholder="e.g. 5"
              type="number"
              icon="📅"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Travellers
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  👥
                </span>

                <select
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
          </div>

          {/* INTERESTS */}
          <div className="mt-7">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              What are you interested in?
            </label>

            <div className="flex flex-wrap gap-3">
              {interestsList.map((interest) => {
                const active = selectedInterests.includes(interest);

                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-medium ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {getInterestIcon(interest)} {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8">
            <button
              type="button"
              onClick={generateTrip}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:min-w-64"
            >
              {loading ? (
                <>
                  <span className="animate-spin">◌</span>
                  Creating your journey...
                </>
              ) : (
                <>✦ Generate My Itinerary</>
              )}
            </button>

            <p className="mt-3 text-sm text-slate-400">
              AI-powered recommendations generated around your preferences.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon="✦"
            title="AI-Powered"
            text="Personalized travel plans created around your preferences."
          />

          <FeatureCard
            icon="💰"
            title="Budget Smart"
            text="Understand estimated spending before your journey begins."
          />

          <FeatureCard
            icon="🗺️"
            title="Easy Navigation"
            text="Open recommended destinations directly in Google Maps."
          />

          <FeatureCard
            icon="♡"
            title="Save Your Trips"
            text="Keep your generated journeys ready for later."
          />
        </div>
      </section>

      {/* GENERATED TRIP */}
      {trip && (
        <section
          id="generated-trip"
          className="border-y border-slate-200 bg-white py-20"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* DESTINATION HEADER */}
            <div className="relative mb-10 min-h-[390px] overflow-hidden rounded-[2rem]">
              <Image
                src={getDestinationImage(trip.destination)}
                alt={trip.destination}
                fill
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/45 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-10">
                <div className="mb-3 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-md">
                  Your Velora Journey
                </div>

                <h2 className="text-4xl font-bold md:text-5xl">
                  {trip.destination}
                </h2>

                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <TripBadge text={`${trip.days} days`} />
                  <TripBadge
                    text={`${trip.travelers} ${
                      Number(trip.travelers) === 1
                        ? "traveller"
                        : "travellers"
                    }`}
                  />
                  <TripBadge
                    text={`RM ${Number(trip.budget).toLocaleString()}`}
                  />

                  {trip.interests.length > 0 && (
                    <TripBadge text={trip.interests.join(" • ")} />
                  )}
                </div>
              </div>
            </div>

            {/* BUDGET INTELLIGENCE */}
            <BudgetIntelligence trip={trip} />

            {/* ITINERARY TITLE */}
            <div className="mb-8 mt-16">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Your Itinerary
              </div>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Day-by-day adventure
              </h2>

              <p className="mt-2 text-slate-500">
                A personalized schedule created for your trip to{" "}
                {trip.destination}.
              </p>
            </div>

            {/* DAYS */}
            <div className="space-y-8">
              {trip.itinerary.map((day) => (
                <div
                  key={day.day}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white shadow-md shadow-blue-200">
                        {day.day}
                      </div>

                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                          Day {day.day}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900">
                          {day.title}
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                      Est. RM {Number(day.estimatedTotal).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="relative">
                      <div className="absolute bottom-5 left-[19px] top-5 hidden w-px bg-slate-200 sm:block" />

                      <div className="space-y-6">
                        <TimelineActivity
                          label="Morning"
                          activity={day.morning}
                          icon="☀️"
                        />

                        <TimelineActivity
                          label="Lunch"
                          activity={day.lunch}
                          icon="🍽️"
                        />

                        <TimelineActivity
                          label="Afternoon"
                          activity={day.afternoon}
                          icon="🌤️"
                        />

                        <TimelineActivity
                          label="Dinner"
                          activity={day.dinner}
                          icon="🥢"
                        />

                        <TimelineActivity
                          label="Evening"
                          activity={day.evening}
                          icon="🌙"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={saveTrip}
                className="rounded-2xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
              >
                {saved ? "✓ Trip Saved" : "♡ Save This Trip"}
              </button>

              <Link
                href="/my-trips"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-center font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600"
              >
                View My Trips
              </Link>

              <button
                type="button"
                onClick={resetPlanner}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600"
              >
                Plan Another Trip
              </button>
            </div>
          </div>
        </section>
      )}

      {/* DESTINATIONS */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Get Inspired
            </div>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Where will you go next?
            </h2>

            <p className="mt-2 text-slate-500">
              A little inspiration for your next Velora journey.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <DestinationCard
            image="/images/tokyo.jpg"
            destination="Tokyo"
            country="Japan"
            onSelect={() => {
              setDestination("Tokyo, Japan");
              document
                .getElementById("planner")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <DestinationCard
            image="/images/santorini.jpg"
            destination="Santorini"
            country="Greece"
            onSelect={() => {
              setDestination("Santorini, Greece");
              document
                .getElementById("planner")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <DestinationCard
            image="/images/bali.jpg"
            destination="Bali"
            country="Indonesia"
            onSelect={() => {
              setDestination("Bali, Indonesia");
              document
                .getElementById("planner")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-12 text-center text-white md:px-12 md:py-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
              Velora Trip
            </div>

            <h2 className="text-3xl font-bold md:text-4xl">
              Your next journey starts with an idea.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Choose your destination, set your budget and let AI turn your
              travel ideas into a personalized itinerary.
            </p>

            <a
              href="#planner"
              className="mt-7 inline-flex rounded-2xl bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-blue-50"
            >
              Create My Trip
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white">
              ✈
            </div>

            <div>
              <div className="font-bold text-slate-900">
                Velora <span className="text-blue-600">Trip</span>
              </div>

              <div className="text-xs text-slate-500">
                Plan Smarter. Travel Further.
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            © 2026 Velora Trip. AI-powered travel planning.
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: string;
  icon: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2">
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={type === "number" ? 1 : undefined}
          className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

function HeroBadge({ text }: { text: string }) {
  return (
    <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
      ✓ {text}
    </div>
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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">
        {icon}
      </div>

      <h3 className="font-bold text-slate-900">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function TripBadge({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-white/20 bg-white/15 px-4 py-2 backdrop-blur-md">
      {text}
    </span>
  );
}

function BudgetIntelligence({ trip }: { trip: Trip }) {
  const estimatedCost = getEstimatedTripCost(trip);
  const remaining = trip.budget - estimatedCost;

  const percentage =
    trip.budget > 0
      ? Math.min((estimatedCost / trip.budget) * 100, 100)
      : 0;

  const averagePerDay =
    trip.days > 0 ? estimatedCost / trip.days : 0;

  const overBudget = remaining < 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Budget Intelligence
          </div>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            Know your spending before you go
          </h3>
        </div>

        <div
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
            overBudget
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {overBudget ? "Over Budget" : "Within Budget"}
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BudgetCard
          label="Total Budget"
          value={`RM ${Number(trip.budget).toLocaleString()}`}
        />

        <BudgetCard
          label="Estimated Spending"
          value={`RM ${Math.round(estimatedCost).toLocaleString()}`}
        />

        <BudgetCard
          label={overBudget ? "Over Budget By" : "Budget Remaining"}
          value={`RM ${Math.abs(Math.round(remaining)).toLocaleString()}`}
        />

        <BudgetCard
          label="Average Per Day"
          value={`RM ${Math.round(averagePerDay).toLocaleString()}`}
        />
      </div>

      <div className="mt-7">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-slate-600">
            Estimated budget usage
          </span>

          <span className="font-semibold text-slate-900">
            {Math.round(
              trip.budget > 0
                ? (estimatedCost / trip.budget) * 100
                : 0
            )}
            %
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${
              overBudget ? "bg-red-500" : "bg-blue-600"
            }`}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-400">
          Estimates are intended as planning guidance. Actual travel prices
          may vary.
        </p>
      </div>
    </div>
  );
}

function BudgetCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function TimelineActivity({
  label,
  activity,
  icon,
}: {
  label: string;
  activity: Activity;
  icon: string;
}) {
  if (!activity) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    activity.place
  )}`;

  return (
    <div className="relative flex gap-4">
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
        {icon}
      </div>

      <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {label}
              </span>

              <span className="text-xs text-slate-400">
                •
              </span>

              <span className="text-sm font-medium text-slate-500">
                {activity.time}
              </span>
            </div>

            <h4 className="mt-2 text-lg font-bold text-slate-900">
              {activity.place}
            </h4>

            <p className="mt-2 leading-6 text-slate-600">
              {activity.activity}
            </p>
          </div>

          <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
            RM {Number(activity.cost).toLocaleString()}
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View on Google Maps
          <span>↗</span>
        </a>
      </div>
    </div>
  );
}

function DestinationCard({
  image,
  destination,
  country,
  onSelect,
}: {
  image: string;
  destination: string;
  country: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative h-80 overflow-hidden rounded-3xl text-left shadow-lg"
    >
      <Image
        src={image}
        alt={`${destination}, ${country}`}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <div className="text-2xl font-bold">
          {destination}
        </div>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-white/80">
            📍 {country}
          </span>

          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition group-hover:bg-white group-hover:text-slate-900">
            →
          </span>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getEstimatedTripCost(trip: Trip) {
  return trip.itinerary.reduce(
    (total, day) =>
      total + Number(day.estimatedTotal || 0),
    0
  );
}

function getDestinationImage(destination: string) {
  const name = destination.toLowerCase();

  if (name.includes("tokyo") || name.includes("japan")) {
    return "/images/tokyo.jpg";
  }

  if (name.includes("bali") || name.includes("indonesia")) {
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

function getInterestIcon(interest: string) {
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
      return "✦";
  }
}