"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function MyTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("savedTrips");

      if (saved) {
        setTrips(JSON.parse(saved));
      }
    } catch (error) {
      console.error(error);
    }

    setLoaded(true);
  }, []);

  function deleteTrip(id?: string) {
    if (!id) return;

    if (!window.confirm("Delete this saved trip?")) {
      return;
    }

    const updated =
      trips.filter((trip) => trip.id !== id);

    setTrips(updated);

    localStorage.setItem(
      "savedTrips",
      JSON.stringify(updated)
    );
  }

  function deleteAll() {
    if (!window.confirm("Delete all saved trips?")) {
      return;
    }

    localStorage.removeItem("savedTrips");
    setTrips([]);
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

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

          <Link
            href="/"
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            + Plan New Trip
          </Link>

        </div>

      </nav>

      {/* HERO */}

      <section className="relative overflow-hidden bg-slate-950">

        <div className="absolute inset-0">

          <Image
            src="/images/hero-travel.jpg"
            alt="Travel"
            fill
            className="object-cover opacity-30"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 text-white">

          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-300">
            Saved Adventures
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            My Trips
          </h1>

          <p className="mt-4 max-w-xl text-lg text-slate-300">
            Keep your favorite adventures organized
            and ready whenever it&apos;s time to travel.
          </p>

        </div>

      </section>

      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-6 py-14">

        {!loaded && (

          <div className="py-20 text-center text-slate-500">
            Loading your trips...
          </div>

        )}

        {loaded && trips.length === 0 && (

          <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="text-6xl">
              🌍
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              Your adventure list is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-500">
              Create your first personalized travel
              itinerary and save it here.
            </p>

            <Link
              href="/"
              className="mt-7 inline-block rounded-xl bg-blue-600 px-7 py-3.5 font-bold text-white hover:bg-blue-700"
            >
              ✦ Plan My First Trip
            </Link>

          </div>

        )}

        {loaded && trips.length > 0 && (

          <>

            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

              <p className="text-slate-500">
                You have{" "}
                <strong className="text-slate-900">
                  {trips.length}
                </strong>{" "}
                saved{" "}
                {trips.length === 1
                  ? "trip"
                  : "trips"}.
              </p>

              <button
                type="button"
                onClick={deleteAll}
                className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50"
              >
                Delete All
              </button>

            </div>

            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">

              {trips.map((trip, index) => (

                <article
                  key={trip.id || index}
                  className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >

                  <div className="relative h-48">

                    <Image
                      src={getTripImage(trip.destination)}
                      alt={trip.destination}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <div className="absolute bottom-0 p-5 text-white">

                      <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
                        Saved Trip
                      </p>

                      <h2 className="mt-1 text-2xl font-black">
                        {trip.destination}
                      </h2>

                    </div>

                  </div>

                  <div className="p-6">

                    <div className="grid grid-cols-2 gap-3">

                      <TripInfo
                        label="Duration"
                        value={`${trip.days} Days`}
                        icon="📅"
                      />

                      <TripInfo
                        label="Budget"
                        value={`RM ${trip.budget}`}
                        icon="💰"
                      />

                    </div>

                    <div className="mt-3">

                      <TripInfo
                        label="Travelers"
                        value={`${trip.travelers} Travelers`}
                        icon="👥"
                      />

                    </div>

                    {trip.interests.length > 0 && (

                      <div className="mt-5 flex flex-wrap gap-2">

                        {trip.interests.map((interest) => (

                          <span
                            key={interest}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
                          >
                            {interest}
                          </span>

                        ))}

                      </div>

                    )}

                    <div className="mt-6 border-t border-slate-100 pt-5">

                      <button
                        type="button"
                        onClick={() =>
                          deleteTrip(trip.id)
                        }
                        className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-50"
                      >
                        🗑 Delete Trip
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          </>

        )}

      </section>

      <footer className="mt-10 bg-slate-950">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-10 text-white md:flex-row">

          <div className="flex items-center gap-3">

            <span className="text-2xl">
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

          <Link
            href="/"
            className="text-sm text-slate-300 hover:text-white"
          >
            Plan New Trip
          </Link>

          <p className="text-sm text-slate-400">
            Made with ❤️ for travelers
          </p>

        </div>

      </footer>

    </main>
  );
}

function TripInfo({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-extrabold text-slate-800">
        {icon} {value}
      </p>

    </div>
  );
}

function getTripImage(destination: string) {
  const name = destination.toLowerCase();

  if (name.includes("tokyo")) {
    return "/images/tokyo.jpg";
  }

  if (name.includes("bali")) {
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