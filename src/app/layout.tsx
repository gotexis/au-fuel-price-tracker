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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="corporate">
      <body className="min-h-screen bg-base-100">
        <div className="navbar bg-primary text-primary-content shadow-lg">
          <div className="container mx-auto">
            <a href="/" className="btn btn-ghost text-xl font-bold">
              ⛽ AU Fuel Prices
            </a>
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-8">
          <div>
            <p>
              Data sourced from{" "}
              <a
                href="https://www.fuelwatch.wa.gov.au"
                className="link"
                target="_blank"
                rel="noopener noreferrer"
              >
                WA FuelWatch
              </a>
              . Updated daily. © {new Date().getFullYear()} AU Fuel Prices
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
