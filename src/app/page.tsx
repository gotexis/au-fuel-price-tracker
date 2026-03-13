import stats from "@/data/fuel-stats.json";
import bySuburb from "@/data/fuel-by-suburb.json";
import Link from "next/link";
import SuburbSearch from "@/components/SuburbSearch";
import type { Metadata } from "next";

interface Station {
  name: string;
  brand: string;
  address: string;
  suburb: string;
  state: string;
  price: number;
  fuelType: string;
  date: string;
}

export const metadata: Metadata = {
  title: "AU Fuel Prices — Compare Petrol & Diesel Prices Across Australia",
  description: `Compare fuel prices across ${stats.suburbs} suburbs in Western Australia. Find the cheapest ULP at ${stats.minULP}¢/L today.`,
};

export default function Home() {
  const suburbs = Object.keys(bySuburb).sort();
  const allStations: Station[] = Object.values(bySuburb).flat() as Station[];

  const cheapestULP = allStations
    .filter((s) => s.fuelType === "ULP" && s.price > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, 10);

  const mostExpensiveULP = allStations
    .filter((s) => s.fuelType === "ULP" && s.price > 0)
    .sort((a, b) => b.price - a.price)
    .slice(0, 5);

  const suburbAvgs = suburbs
    .map((suburb) => {
      const prices = (bySuburb as Record<string, Station[]>)[suburb]
        .filter((s) => s.fuelType === "ULP" && s.price > 0)
        .map((s) => s.price);
      return {
        suburb,
        avg: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
        count: prices.length,
        slug: suburb.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      };
    })
    .filter((s) => s.count > 0)
    .sort((a, b) => a.avg - b.avg);

  const cheapest5 = suburbAvgs.slice(0, 5);
  const priciest5 = [...suburbAvgs].sort((a, b) => b.avg - a.avg).slice(0, 5);
  const avgPrice = parseFloat(stats.avgULP);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Compare Fuel Prices Across WA
        </h1>
        <p className="text-base-content/60 mb-6">
          {stats.totalStations} stations · {stats.suburbs} suburbs · Updated {stats.date}
        </p>

        {/* Stats Row */}
        <div className="flex justify-center gap-4 md:gap-8 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-success">{stats.minULP}¢</div>
            <div className="text-xs text-base-content/50 mt-1">Cheapest ULP</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{stats.avgULP}¢</div>
            <div className="text-xs text-base-content/50 mt-1">Average</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-error">{stats.maxULP}¢</div>
            <div className="text-xs text-base-content/50 mt-1">Most Expensive</div>
          </div>
        </div>

        {/* Search */}
        <SuburbSearch suburbs={suburbAvgs} />
      </section>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cheapest Stations */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            🏆 Cheapest ULP Today
          </h2>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs uppercase text-base-content/40">
                  <th>Station</th>
                  <th>Suburb</th>
                  <th className="text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {cheapestULP.map((s, i) => (
                  <tr key={i} className={i === 0 ? "bg-success/5" : ""}>
                    <td>
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-base-content/40">{s.brand}</div>
                    </td>
                    <td>
                      <Link
                        href={`/suburb/${s.suburb.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {s.suburb}
                      </Link>
                    </td>
                    <td className="text-right font-bold text-success tabular-nums">{s.price}¢</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Most Expensive */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            💸 Most Expensive ULP
          </h2>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs uppercase text-base-content/40">
                  <th>Station</th>
                  <th>Suburb</th>
                  <th className="text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {mostExpensiveULP.map((s, i) => (
                  <tr key={i}>
                    <td>
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-base-content/40">{s.brand}</div>
                    </td>
                    <td className="text-sm">{s.suburb}</td>
                    <td className="text-right font-bold text-error tabular-nums">{s.price}¢</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Suburb Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">📍 Cheapest Suburbs</h2>
          <div className="space-y-2">
            {cheapest5.map((s, i) => (
              <Link
                key={s.suburb}
                href={`/suburb/${s.slug}`}
                className="flex justify-between items-center p-2 rounded hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-base-content/30 w-5">{i + 1}</span>
                  <span className="font-medium">{s.suburb}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-success tabular-nums">{s.avg.toFixed(1)}¢</span>
                  <span className="text-xs text-base-content/40">({s.count} stations)</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">💰 Priciest Suburbs</h2>
          <div className="space-y-2">
            {priciest5.map((s, i) => (
              <Link
                key={s.suburb}
                href={`/suburb/${s.slug}`}
                className="flex justify-between items-center p-2 rounded hover:bg-error/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-base-content/30 w-5">{i + 1}</span>
                  <span className="font-medium">{s.suburb}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-error tabular-nums">{s.avg.toFixed(1)}¢</span>
                  <span className="text-xs text-base-content/40">({s.count} stations)</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* All Suburbs */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold mb-4">All Suburbs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
          {suburbAvgs.map((s) => {
            const diff = s.avg - avgPrice;
            const color = diff < -5 ? "text-success" : diff > 5 ? "text-error" : "text-base-content/70";
            return (
              <Link
                key={s.suburb}
                href={`/suburb/${s.slug}`}
                className="flex justify-between items-center px-2 py-1.5 rounded text-sm hover:bg-base-200 transition-colors"
              >
                <span>{s.suburb}</span>
                <span className={`tabular-nums font-medium ${color}`}>{s.avg.toFixed(0)}¢</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
