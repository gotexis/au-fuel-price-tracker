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

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const suburb = slugToSuburb(slug);
    if (!suburb) return { title: "Not Found" };
    return {
      title: `Fuel Prices in ${suburb}, WA — Compare Petrol & Diesel | AU Fuel Prices`,
      description: `Compare today's petrol and diesel prices at stations in ${suburb}, Western Australia. Find the cheapest ULP, PULP, Diesel and 98RON near you.`,
    };
  });
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

  // Group by fuel type
  const byFuel: Record<string, Station[]> = {};
  for (const s of stations) {
    if (!byFuel[s.fuelType]) byFuel[s.fuelType] = [];
    byFuel[s.fuelType].push(s);
  }

  // Sort each group by price
  for (const ft of Object.keys(byFuel)) {
    byFuel[ft].sort((a, b) => a.price - b.price);
  }

  return (
    <div>
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>{suburb}, WA</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        ⛽ Fuel Prices in {suburb}, WA
      </h1>
      <p className="text-base-content/60 mb-6">
        {stations.length} price listings from{" "}
        {new Set(stations.map((s) => s.name)).size} stations
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {fuelTypes.map((ft) => (
          <div key={ft} className="badge badge-lg badge-outline">
            {ft}: {byFuel[ft]?.[0]?.price}¢ cheapest
          </div>
        ))}
      </div>

      {fuelTypes.map((ft) => (
        <div key={ft} className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">{ft} Prices</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Station</th>
                    <th>Brand</th>
                    <th>Address</th>
                    <th>Price (¢/L)</th>
                  </tr>
                </thead>
                <tbody>
                  {byFuel[ft]?.map((s, i) => (
                    <tr key={i} className={i === 0 ? "bg-success/10" : ""}>
                      <td className="font-medium">{s.name}</td>
                      <td>{s.brand}</td>
                      <td className="text-sm">{s.address}</td>
                      <td
                        className={`font-bold ${
                          i === 0 ? "text-success" : ""
                        }`}
                      >
                        {s.price}¢
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
