"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// ==========================================
// TYPES
// ==========================================

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
  id?: string;
  destination: string;
  budget: number;
  days: number;
  travelers: string;
  interests: string[];
  itinerary: DayPlan[];
};

// ==========================================
// INTEREST OPTIONS
// ==========================================

const interests = [
  {
    name: "Food",
    icon: "🍴",
  },
  {
    name: "Nature",
    icon: "🌲",
  },
  {
    name: "Shopping",
    icon: "🛍️",
  },
  {
    name: "Culture",
    icon: "🏛️",
  },
  {
    name: "Adventure",
    icon: "⛰️",
  },
  {
    name: "Nightlife",
    icon: "🌙",
  },
];

// ==========================================
// HOME PAGE
// ==========================================

export default function Home() {
  const [destination, setDestination] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [days, setDays] =
    useState("");

  const [travelers, setTravelers] =
    useState("1");

  const [
    selectedInterests,
    setSelectedInterests,
  ] = useState<string[]>([]);

  const [trip, setTrip] =
    useState<Trip | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saved, setSaved] =
    useState(false);

  // ========================================
  // INTEREST BUTTON
  // ========================================

  function toggleInterest(
    interest: string
  ) {
    if (
      selectedInterests.includes(
        interest
      )
    ) {
      setSelectedInterests(
        selectedInterests.filter(
          (item) =>
            item !== interest
        )
      );
    } else {
      setSelectedInterests([
        ...selectedInterests,
        interest,
      ]);
    }
  }

  // ========================================
  // GENERATE TRIP
  // ========================================

  async function generateTrip() {
    if (
      !destination.trim() ||
      !budget ||
      !days
    ) {
      setError(
        "Please enter your destination, budget and number of days."
      );

      return;
    }

    if (Number(budget) <= 0) {
      setError(
        "Budget must be greater than RM 0."
      );

      return;
    }

    if (Number(days) <= 0) {
      setError(
        "Number of days must be at least 1."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setTrip(null);
      setSaved(false);

      const response =
        await fetch(
          "/api/generate-trip",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              destination,
              budget,
              days,
              travelers,
              interests:
                selectedInterests,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to generate your trip."
        );
      }

      setTrip(data.trip);

      setTimeout(() => {
        document
          .getElementById(
            "generated-trip"
          )
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 250);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // SAVE TRIP
  // ========================================

  function saveTrip() {
    if (!trip) return;

    try {
      const oldTrips: Trip[] =
        JSON.parse(
          localStorage.getItem(
            "savedTrips"
          ) || "[]"
        );

      const newTrip: Trip = {
        ...trip,

        id:
          Date.now().toString(),
      };

      localStorage.setItem(
        "savedTrips",
        JSON.stringify([
          ...oldTrips,
          newTrip,
        ])
      );

      setSaved(true);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to save your trip."
      );
    }
  }

  // ========================================
  // RESET PLANNER
  // ========================================

  function resetPlanner() {
    setDestination("");
    setBudget("");
    setDays("");
    setTravelers("1");
    setSelectedInterests([]);
    setTrip(null);
    setSaved(false);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="min-h-screen bg-white">

      {/* ====================================
          NAVIGATION
      ==================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              ✈️
            </div>

            <div>
              <p className="text-lg font-extrabold text-slate-900">
                AI Travel Planner
              </p>

              <p className="text-xs text-slate-500">
                Plan Smarter. Travel Better.
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">

            <Link
              href="/"
              className="hidden rounded-xl bg-blue-50 px-5 py-2.5 font-semibold text-blue-600 sm:block"
            >
              🏠 Home
            </Link>

            <Link
              href="/my-trips"
              className="rounded-xl px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              🧳 My Trips
            </Link>

          </div>
        </div>
      </nav>

      {/* ====================================
          HERO
      ==================================== */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0">

          <Image
            src="/images/hero-travel.jpg"
            alt="Beautiful travel destination"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10" />

        </div>

        <div className="relative mx-auto grid min-h-[540px] max-w-7xl items-center px-6 py-20 lg:grid-cols-2">

          <div className="max-w-2xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 backdrop-blur">
              ✦ Powered by Google Gemini AI
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-950 md:text-6xl">

              Your Next Adventure

              <span className="block text-blue-600">
                Starts Here
              </span>

            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Create a personalized
              AI-powered travel itinerary
              based on your destination,
              budget, interests and travel
              style.
            </p>

            <div className="mt-8 flex flex-wrap gap-6">

              <HeroFeature
                icon="🤖"
                title="AI"
                subtitle="Powered"
              />

              <HeroFeature
                icon="💰"
                title="Budget"
                subtitle="Aware"
              />

              <HeroFeature
                icon="📍"
                title="Maps"
                subtitle="Ready"
              />

            </div>

          </div>
        </div>
      </section>

      {/* ====================================
          TRIP PLANNER
      ==================================== */}

      <section
        id="planner"
        className="relative z-20 mx-auto -mt-10 max-w-7xl px-6"
      >

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/60 md:p-8">

          <div className="mb-7 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              ✈️
            </div>

            <div>

              <h2 className="text-2xl font-extrabold text-slate-900">
                Plan Your Trip
              </h2>

              <p className="text-sm text-slate-500">
                Tell Gemini about your
                ideal adventure.
              </p>

            </div>

          </div>

          {/* INPUTS */}

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <FormField
              label="📍 Destination"
              value={destination}
              placeholder="e.g. Tokyo, Japan"
              onChange={
                setDestination
              }
            />

            <FormField
              label="💰 Budget (RM)"
              value={budget}
              placeholder="e.g. 4000"
              type="number"
              onChange={setBudget}
            />

            <FormField
              label="📅 Number of Days"
              value={days}
              placeholder="e.g. 5"
              type="number"
              onChange={setDays}
            />

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                👥 Travelers
              </label>

              <select
                value={travelers}
                onChange={(e) =>
                  setTravelers(
                    e.target.value
                  )
                }
                className="h-[50px] w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >

                <option value="1">
                  1 Traveler
                </option>

                <option value="2">
                  2 Travelers
                </option>

                <option value="3">
                  3 Travelers
                </option>

                <option value="4">
                  4 Travelers
                </option>

                <option value="5">
                  5 Travelers
                </option>

                <option value="6">
                  6+ Travelers
                </option>

              </select>

            </div>

          </div>

          {/* INTERESTS */}

          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_280px]">

            <div>

              <p className="mb-3 text-sm font-bold text-slate-700">
                What are you interested in?
              </p>

              <div className="flex flex-wrap gap-3">

                {interests.map(
                  (interest) => (

                    <button
                      key={
                        interest.name
                      }
                      type="button"
                      onClick={() =>
                        toggleInterest(
                          interest.name
                        )
                      }
                      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                        selectedInterests.includes(
                          interest.name
                        )
                          ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >

                      <span className="mr-2">
                        {interest.icon}
                      </span>

                      {interest.name}

                    </button>

                  )
                )}

              </div>

            </div>

            {/* GENERATE BUTTON */}

            <div className="flex flex-col justify-end">

              <button
                type="button"
                onClick={
                  generateTrip
                }
                disabled={loading}
                className="h-[54px] rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "✈️ Planning..."
                  : "✦ Generate My Trip"}

              </button>

              <p className="mt-2 text-center text-xs text-slate-400">
                ✨ Powered by Google Gemini AI
              </p>

            </div>

          </div>

          {/* ERROR */}

          {error && (

            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              ⚠️ {error}
            </div>

          )}

        </div>
      </section>

      {/* ====================================
          FEATURES
      ==================================== */}

      <section className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">

        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">

          <FeatureCard
            icon="🤖"
            title="AI Itineraries"
            text="Gemini creates personalized day-by-day travel plans."
          />

          <FeatureCard
            icon="💰"
            title="Budget Intelligence"
            text="Understand estimated spending and your remaining budget."
          />

          <FeatureCard
            icon="📍"
            title="Google Maps"
            text="Open recommended places directly in Google Maps."
          />

          <FeatureCard
            icon="🔖"
            title="Save Trips"
            text="Keep your favorite itineraries ready for later."
          />

        </div>

      </section>

      {/* ====================================
          LOADING
      ==================================== */}

      {loading && (

        <section className="mx-auto max-w-4xl px-6 py-16">

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-12 text-center">

            <div className="animate-bounce text-6xl">
              ✈️
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-slate-900">
              Gemini is planning your adventure...
            </h2>

            <p className="mt-2 text-slate-500">
              Finding places, food and
              experiences that match your
              preferences.
            </p>

          </div>

        </section>

      )}

      {/* ====================================
          GENERATED TRIP
      ==================================== */}

      {trip && !loading && (

        <section
          id="generated-trip"
          className="mx-auto max-w-5xl px-6 py-16"
        >

          {/* TRIP HERO */}

          <div className="overflow-hidden rounded-[32px] bg-slate-950 shadow-2xl">

            <div className="relative min-h-[320px]">

              <Image
                src={getDestinationImage(
                  trip.destination
                )}
                alt={
                  trip.destination
                }
                fill
                className="object-cover opacity-55"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

              <div className="relative z-10 p-8 text-white md:p-12">

                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
                  ✦ AI Generated Travel Plan
                </p>

                <h2 className="mt-3 text-4xl font-black md:text-5xl">
                  {trip.destination}
                </h2>

                <p className="mt-4 max-w-xl text-slate-200">
                  Your personalized itinerary
                  is ready. Explore your
                  day-by-day adventure below.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">

                  <TripBadge>
                    📅 {trip.days} Days
                  </TripBadge>

                  <TripBadge>
                    💰 RM{" "}
                    {trip.budget.toLocaleString()}
                  </TripBadge>

                  <TripBadge>
                    👥 {trip.travelers}{" "}
                    Travelers
                  </TripBadge>

                  {trip.interests.length >
                    0 && (

                    <TripBadge>
                      ❤️{" "}
                      {trip.interests.join(
                        ", "
                      )}
                    </TripBadge>

                  )}

                </div>

              </div>

            </div>

          </div>

          {/* ==================================
              BUDGET INTELLIGENCE
          ================================== */}

          <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-100">

            <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-blue-50 p-8">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-600">
                    💰 Budget Intelligence
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-slate-900">
                    Trip Budget Overview
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Estimated spending based
                    on your AI-generated
                    itinerary.
                  </p>

                </div>

                <div
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    getEstimatedTripCost(
                      trip
                    ) <= trip.budget
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >

                  {getEstimatedTripCost(
                    trip
                  ) <= trip.budget
                    ? "✓ Within Budget"
                    : "⚠ Over Budget"}

                </div>

              </div>

            </div>

            {/* BUDGET CARDS */}

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 md:p-8">

              <BudgetCard
                icon="💳"
                label="Total Budget"
                value={`RM ${trip.budget.toLocaleString()}`}
              />

              <BudgetCard
                icon="🧾"
                label="Estimated Spending"
                value={`RM ${getEstimatedTripCost(
                  trip
                ).toLocaleString()}`}
              />

              <BudgetCard
                icon="💵"
                label={
                  getBudgetRemaining(
                    trip
                  ) >= 0
                    ? "Budget Remaining"
                    : "Over Budget By"
                }
                value={`RM ${Math.abs(
                  getBudgetRemaining(
                    trip
                  )
                ).toLocaleString()}`}
              />

              <BudgetCard
                icon="📅"
                label="Average Per Day"
                value={`RM ${Math.round(
                  getEstimatedTripCost(
                    trip
                  ) / trip.days
                ).toLocaleString()}`}
              />

            </div>

            {/* PROGRESS */}

            <div className="px-6 pb-8 md:px-8">

              <div className="mb-3 flex items-center justify-between text-sm">

                <span className="font-semibold text-slate-500">
                  Budget Used
                </span>

                <span className="font-extrabold text-slate-900">
                  {getBudgetPercentage(
                    trip
                  )}
                  %
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    getEstimatedTripCost(
                      trip
                    ) <= trip.budget
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                      : "bg-gradient-to-r from-orange-400 to-red-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      getBudgetPercentage(
                        trip
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

              <p className="mt-3 text-xs text-slate-400">
                Estimated activity and food
                costs. Flights and
                accommodation are excluded
                unless included in the
                itinerary.
              </p>

            </div>

          </div>

          {/* ==================================
              ITINERARY HEADING
          ================================== */}

          <div className="mb-7 mt-12">

            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">
              🗺️ Your Itinerary
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Day-by-Day Adventure
            </h2>

            <p className="mt-2 text-slate-500">
              Your personalized schedule
              generated by Gemini.
            </p>

          </div>

          {/* ==================================
              DAYS
          ================================== */}

          <div className="space-y-8">

            {trip.itinerary.map(
              (day) => (

                <article
                  key={day.day}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-100"
                >

                  {/* DAY HEADER */}

                  <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white p-6 md:p-8">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                      <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-200">
                          {day.day}
                        </div>

                        <div>

                          <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                            Day {day.day}
                          </p>

                          <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
                            {day.title}
                          </h3>

                        </div>

                      </div>

                      <div className="rounded-xl bg-emerald-50 px-4 py-3">

                        <p className="text-xs font-semibold text-emerald-600">
                          Estimated Day Cost
                        </p>

                        <p className="text-lg font-extrabold text-emerald-700">
                          RM{" "}
                          {day.estimatedTotal.toLocaleString()}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* TIMELINE */}

                  <div className="p-6 md:p-8">

                    <TimelineActivity
                      icon="🌅"
                      title="Morning"
                      activity={
                        day.morning
                      }
                      destination={
                        trip.destination
                      }
                      first
                    />

                    <TimelineActivity
                      icon="🍽️"
                      title="Lunch"
                      activity={
                        day.lunch
                      }
                      destination={
                        trip.destination
                      }
                    />

                    <TimelineActivity
                      icon="☀️"
                      title="Afternoon"
                      activity={
                        day.afternoon
                      }
                      destination={
                        trip.destination
                      }
                    />

                    <TimelineActivity
                      icon="🍜"
                      title="Dinner"
                      activity={
                        day.dinner
                      }
                      destination={
                        trip.destination
                      }
                    />

                    <TimelineActivity
                      icon="🌙"
                      title="Evening"
                      activity={
                        day.evening
                      }
                      destination={
                        trip.destination
                      }
                      last
                    />

                  </div>

                </article>

              )
            )}

          </div>

          {/* ==================================
              SAVED MESSAGE
          ================================== */}

          {saved && (

            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center font-bold text-emerald-700">
              ✓ Your trip has been saved to
              My Trips.
            </div>

          )}

          {/* ==================================
              ACTION BUTTONS
          ================================== */}

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <button
              type="button"
              onClick={saveTrip}
              disabled={saved}
              className={`rounded-xl px-7 py-3.5 font-bold text-white transition ${
                saved
                  ? "cursor-not-allowed bg-emerald-500"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >

              {saved
                ? "✓ Trip Saved"
                : "🔖 Save Trip"}

            </button>

            <Link
              href="/my-trips"
              className="rounded-xl bg-slate-900 px-7 py-3.5 font-bold text-white transition hover:bg-slate-800"
            >
              🧳 My Trips
            </Link>

            <button
              type="button"
              onClick={
                resetPlanner
              }
              className="rounded-xl border border-slate-300 px-7 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              ✈️ Plan Another Trip
            </button>

          </div>

        </section>

      )}

      {/* ====================================
          DESTINATION INSPIRATION
      ==================================== */}

      <section className="bg-slate-50">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">
                Travel Inspiration
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Discover the World
              </h2>

              <p className="mt-2 text-slate-500">
                Need inspiration? Start with
                one of these incredible
                destinations.
              </p>

            </div>

            <Link
              href="/my-trips"
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              View My Trips →
            </Link>

          </div>

          <div className="grid gap-6 md:grid-cols-3">

            <DestinationCard
              image="/images/tokyo.jpg"
              city="Tokyo, Japan"
              text="Modern cities, rich culture and incredible food."
              onSelect={() => {
                setDestination(
                  "Tokyo, Japan"
                );

                document
                  .getElementById(
                    "planner"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  });
              }}
            />

            <DestinationCard
              image="/images/santorini.jpg"
              city="Santorini, Greece"
              text="Beautiful islands, sunsets and Mediterranean experiences."
              onSelect={() => {
                setDestination(
                  "Santorini, Greece"
                );

                document
                  .getElementById(
                    "planner"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  });
              }}
            />

            <DestinationCard
              image="/images/bali.jpg"
              city="Bali, Indonesia"
              text="Tropical beaches, nature and unique local culture."
              onSelect={() => {
                setDestination(
                  "Bali, Indonesia"
                );

                document
                  .getElementById(
                    "planner"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  });
              }}
            />

          </div>

        </div>

      </section>

      {/* ====================================
          FOOTER
      ==================================== */}

      <footer className="bg-slate-950 text-white">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">

          <div className="flex items-center gap-3">

            <span className="text-3xl">
              ✈️
            </span>

            <div>

              <p className="font-extrabold">
                AI Travel Planner
              </p>

              <p className="text-xs text-slate-400">
                Plan Smarter. Travel Better.
              </p>

            </div>

          </div>

          <div className="flex gap-6 text-sm text-slate-300">

            <Link
              href="/"
              className="hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/my-trips"
              className="hover:text-white"
            >
              My Trips
            </Link>

          </div>

          <p className="text-sm text-slate-400">
            Powered by Google Gemini AI
          </p>

        </div>

      </footer>

    </main>
  );
}

// ==========================================
// HERO FEATURE
// ==========================================

function HeroFeature({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white/80">
        {icon}
      </div>

      <div className="text-sm font-bold text-slate-800">

        <p>{title}</p>

        <p>{subtitle}</p>

      </div>

    </div>
  );
}

// ==========================================
// FORM FIELD
// ==========================================

function FormField({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={
          type === "number"
            ? 1
            : undefined
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="h-[50px] w-full rounded-xl border border-slate-300 px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />

    </div>
  );
}

// ==========================================
// FEATURE CARD
// ==========================================

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
    <div className="flex gap-4">

      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
        {icon}
      </div>

      <div>

        <h3 className="font-extrabold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {text}
        </p>

      </div>

    </div>
  );
}

// ==========================================
// DESTINATION CARD
// ==========================================

function DestinationCard({
  image,
  city,
  text,
  onSelect,
}: {
  image: string;
  city: string;
  text: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >

      <div className="relative h-52 overflow-hidden">

        <Image
          src={image}
          alt={city}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />

      </div>

      <div className="flex items-center justify-between gap-4 p-5">

        <div>

          <h3 className="text-lg font-extrabold text-slate-900">
            {city}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {text}
          </p>

        </div>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
          →
        </span>

      </div>

    </button>
  );
}

// ==========================================
// TRIP BADGE
// ==========================================

function TripBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
      {children}
    </span>
  );
}

// ==========================================
// TIMELINE ACTIVITY
// ==========================================

function TimelineActivity({
  icon,
  title,
  activity,
  destination,
  first = false,
  last = false,
}: {
  icon: string;
  title: string;
  activity: Activity;
  destination: string;
  first?: boolean;
  last?: boolean;
}) {
  const mapsQuery =
    `${activity.place}, ${destination}`;

  const mapsUrl =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      mapsQuery
    )}`;

  return (
    <div className="relative flex gap-5">

      {/* TIMELINE LEFT */}

      <div className="flex w-14 shrink-0 flex-col items-center">

        {!first && (
          <div className="h-4 w-0.5 bg-blue-100" />
        )}

        <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-blue-50 bg-white text-xl shadow-sm">
          {icon}
        </div>

        {!last && (
          <div className="min-h-[150px] w-0.5 flex-1 bg-blue-100" />
        )}

      </div>

      {/* CONTENT */}

      <div
        className={`min-w-0 flex-1 ${
          last
            ? "pb-0"
            : "pb-6"
        }`}
      >

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50/30">

          <div className="flex flex-wrap items-center justify-between gap-2">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {title}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-400">
                🕐 {activity.time}
              </p>

            </div>

            <span className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-extrabold text-emerald-700">
              RM{" "}
              {activity.cost.toLocaleString()}
            </span>

          </div>

          <h4 className="mt-4 text-lg font-extrabold text-slate-900">
            📍 {activity.place}
          </h4>

          <p className="mt-2 leading-6 text-slate-500">
            {activity.activity}
          </p>

          <div className="mt-4">

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              📍 View on Google Maps
            </a>

          </div>

        </div>

      </div>

    </div>
  );
}

// ==========================================
// BUDGET CARD
// ==========================================

function BudgetCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-900">
        {value}
      </p>

    </div>
  );
}

// ==========================================
// BUDGET CALCULATIONS
// ==========================================

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

function getBudgetRemaining(
  trip: Trip
) {
  return (
    trip.budget -
    getEstimatedTripCost(trip)
  );
}

function getBudgetPercentage(
  trip: Trip
) {
  if (trip.budget <= 0) {
    return 0;
  }

  return Math.round(
    (getEstimatedTripCost(
      trip
    ) /
      trip.budget) *
      100
  );
}

// ==========================================
// DESTINATION IMAGE
// ==========================================

function getDestinationImage(
  destination: string
) {
  const name =
    destination.toLowerCase();

  if (name.includes("tokyo")) {
    return "/images/tokyo.jpg";
  }

  if (name.includes("bali")) {
    return "/images/bali.jpg";
  }

  if (
    name.includes(
      "santorini"
    ) ||
    name.includes("greece")
  ) {
    return "/images/santorini.jpg";
  }

  return "/images/hero-travel.jpg";
}