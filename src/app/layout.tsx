import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AU Fuel Prices — Compare Petrol & Diesel Prices Across Australia",
  description:
    "Real-time fuel prices for petrol stations across Western Australia. Compare ULP, PULP, Diesel and 98RON prices by suburb. Updated daily from FuelWatch.",
  keywords: [
    "fuel prices australia",
    "petrol prices wa",
    "cheapest fuel near me",
    "fuelwatch prices today",
    "diesel prices perth",
  ],
  openGraph: {
    title: "AU Fuel Prices — Compare Petrol & Diesel Prices",
    description: "Find the cheapest petrol and diesel near you. Real-time prices from FuelWatch.",
    type: "website",
    url: "https://fuel.rollersoft.com.au",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="corporate">
      <body className="min-h-screen bg-slate-50">
        <header className="bg-primary text-white shadow-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="text-lg font-bold tracking-tight flex items-center gap-2">
              ⛽ AU Fuel Prices
            </a>
            <nav className="text-sm opacity-80">
              <span>WA FuelWatch Data</span>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-base-200 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-base-content/50">
            <p>
              Data sourced from{" "}
              <a
                href="https://www.fuelwatch.wa.gov.au"
                className="underline hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                WA FuelWatch
              </a>
              . Prices updated daily. Not affiliated with the WA Government.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
