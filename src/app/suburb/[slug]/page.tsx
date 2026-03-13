import bySuburb from "@/data/fuel-by-suburb.json";
import Link from "next/link";
import { notFound } from "next/navigation";
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

const suburbMap: Record<string, Station[]> = bySuburb as Record<string, Station[]>;

function slugToSuburb(slug: string): string | null {
  for (const suburb of Object.keys(suburbMap)) {
    if (suburb.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug) {
      return suburb;
    }
  }
  return null;
}

export function generateStaticParams() {
  return Object.keys(suburbMap).map((suburb) => ({
    slug: suburb.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const suburb = slugToSuburb(slug);
  if (!suburb) return { title: "Not Found" };
  const stations = suburbMap[suburb];
  const ulpPrices = stations.filter(s => s.fuelType === "ULP" && s.price > 0).map(s => s.price);
  const cheapest = ulpPrices.length ? Math.min(...ulpPrices) : null;
  return {
    title: `Fuel Prices in ${suburb}, WA — ${cheapest ? cheapest + "¢ cheapest ULP" : "Compare Prices"} | AU Fuel Prices`,
    description: `Compare today's petrol and diesel prices at ${new Set(stations.map(s => s.name)).size} stations in ${suburb}, WA. ${cheapest ? `Cheapest ULP from ${cheapest}¢/L.` : ""} Updated daily from FuelWatch.`,
  };
}

export default async function SuburbPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const suburb = slugToSuburb(slug);
  if (!suburb) notFound();

  const stations = suburbMap[suburb];
  const fuelTypes = [...new Set(stations.map((s) => s.fuelType))].sort();
  const stationCount = new Set(stations.map((s) => s.name)).size;

  const byFuel: Record<string, Station[]> = {};
  for (const s of stations) {
    if (!byFuel[s.fuelType]) byFuel[s.fuelType] = [];
    byFuel[s.fuelType].push(s);
  }
  for (const ft of Object.keys(byFuel)) {
    byFuel[ft].sort((a, b) => a.price - b.price);
  }

  // JSON-LD
  const ulpStations = byFuel["ULP"] || [];
  const cheapestULP = ulpStations[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Fuel Prices in ${suburb}, WA`,
    description: `Compare fuel prices at ${stationCount} stations in ${suburb}, Western Australia`,
    numberOfItems: stationCount,
    itemListElement: ulpStations.slice(0, 5).map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "GasStation",
        name: s.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: s.address,
          addressLocality: s.suburb,
          addressRegion: "WA",
          addressCountry: "AU",
        },
      },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li><Link href="/" className="text-primary hover:underline">Home</Link></li>
          <li>{suburb}, WA</li>
        </ul>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
          Fuel Prices in {suburb}, WA
        </h1>
        <p className="text-base-content/50 text-sm">
          {stationCount} stations · {stations.length} listings · {fuelTypes.length} fuel types
        </p>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-2 mb-6">
        {fuelTypes.map((ft) => {
          const cheapest = byFuel[ft]?.[0];
          return (
            <div key={ft} className="bg-white rounded-lg shadow-sm px-4 py-2 text-center">
              <div className="text-xs text-base-content/40 uppercase">{ft}</div>
              <div className="text-lg font-bold tabular-nums text-success">{cheapest?.price}¢</div>
            </div>
          );
        })}
      </div>

      {/* Fuel tables */}
      <div className="space-y-6">
        {fuelTypes.map((ft) => {
          const avg = byFuel[ft].reduce((a, b) => a + b.price, 0) / byFuel[ft].length;
          return (
            <section key={ft} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">{ft}</h2>
                <span className="text-sm text-base-content/40">
                  Avg: {avg.toFixed(1)}¢ · {byFuel[ft].length} listings
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr className="text-xs uppercase text-base-content/40">
                      <th>#</th>
                      <th>Station</th>
                      <th>Address</th>
                      <th className="text-right">Price</th>
                      <th className="text-right">vs Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byFuel[ft].map((s, i) => {
                      const diff = s.price - avg;
                      const diffColor = diff < -2 ? "text-success" : diff > 2 ? "text-error" : "text-base-content/50";
                      return (
                        <tr key={i} className={i === 0 ? "bg-success/5" : ""}>
                          <td className="text-base-content/30 text-sm">{i + 1}</td>
                          <td>
                            <div className="font-medium text-sm">{s.name}</div>
                            <div className="text-xs text-base-content/40">{s.brand}</div>
                          </td>
                          <td className="text-sm text-base-content/60">{s.address}</td>
                          <td className={`text-right font-bold tabular-nums ${i === 0 ? "text-success" : ""}`}>
                            {s.price}¢
                          </td>
                          <td className={`text-right text-sm tabular-nums ${diffColor}`}>
                            {diff > 0 ? "+" : ""}{diff.toFixed(1)}¢
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
