import stats from "@/data/fuel-stats.json";
import bySuburb from "@/data/fuel-by-suburb.json";
import Link from "next/link";

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

export default function Home() {
  const suburbs = Object.keys(bySuburb).sort();
  
  // Get cheapest ULP stations
  const allStations: Station[] = Object.values(bySuburb).flat() as Station[];
  const cheapestULP = allStations
    .filter((s) => s.fuelType === "ULP" && s.price > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, 10);

  // Get most expensive
  const mostExpensiveULP = allStations
    .filter((s) => s.fuelType === "ULP" && s.price > 0)
    .sort((a, b) => b.price - a.price)
    .slice(0, 5);

  // Suburb averages
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

  return (
    <div>
      {/* Hero */}
      <div className="hero bg-base-200 rounded-box mb-8 p-8">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">
              ⛽ Australia Fuel Prices Today
            </h1>
            <p className="text-lg mb-2">
              Compare petrol and diesel prices across{" "}
              <strong>{stats.totalStations}</strong> stations in{" "}
              <strong>{stats.suburbs}</strong> suburbs
            </p>
            <div className="stats stats-vertical lg:stats-horizontal shadow mt-4">
              <div className="stat">
                <div className="stat-title">Avg ULP</div>
                <div className="stat-value text-primary">{stats.avgULP}¢</div>
                <div className="stat-desc">per litre</div>
              </div>
              <div className="stat">
                <div className="stat-title">Cheapest ULP</div>
                <div className="stat-value text-success">{stats.minULP}¢</div>
                <div className="stat-desc">per litre</div>
              </div>
              <div className="stat">
                <div className="stat-title">Most Expensive</div>
                <div className="stat-value text-error">{stats.maxULP}¢</div>
                <div className="stat-desc">per litre</div>
              </div>
            </div>
            <p className="text-sm text-base-content/60 mt-4">
              Data from WA FuelWatch — Last updated: {stats.date}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cheapest Stations */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-success">🏆 Cheapest ULP Today</h2>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Station</th>
                    <th>Suburb</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {cheapestULP.map((s, i) => (
                    <tr key={i} className={i === 0 ? "bg-success/10" : ""}>
                      <td>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-base-content/60">{s.brand}</div>
                      </td>
                      <td>
                        <Link
                          href={`/suburb/${s.suburb.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                          className="link link-primary"
                        >
                          {s.suburb}
                        </Link>
                      </td>
                      <td className="font-bold text-success">{s.price}¢</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Most Expensive */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-error">💸 Most Expensive ULP</h2>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Station</th>
                    <th>Suburb</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {mostExpensiveULP.map((s, i) => (
                    <tr key={i}>
                      <td>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-base-content/60">{s.brand}</div>
                      </td>
                      <td>{s.suburb}</td>
                      <td className="font-bold text-error">{s.price}¢</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Suburb Rankings */}
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">📍 Suburbs by Average ULP Price</h2>
          <p className="text-sm text-base-content/60 mb-4">
            {suburbAvgs.length} suburbs with ULP price data
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {suburbAvgs.map((s) => (
              <Link
                key={s.suburb}
                href={`/suburb/${s.slug}`}
                className="flex justify-between items-center p-2 rounded hover:bg-base-200 transition-colors"
              >
                <span className="font-medium">{s.suburb}</span>
                <span className="badge badge-outline">
                  {s.avg.toFixed(1)}¢ ({s.count})
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
