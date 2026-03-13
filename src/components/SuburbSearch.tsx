"use client";

import { useState } from "react";
import Link from "next/link";

interface SuburbEntry {
  suburb: string;
  avg: number;
  count: number;
  slug: string;
}

export default function SuburbSearch({ suburbs }: { suburbs: SuburbEntry[] }) {
  const [query, setQuery] = useState("");
  const filtered = query.length >= 2
    ? suburbs.filter((s) => s.suburb.toLowerCase().includes(query.toLowerCase())).slice(0, 20)
    : [];

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="Search suburbs... e.g. Perth, Bunbury"
        className="input input-bordered w-full pl-10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <svg className="absolute left-3 top-3 w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg border z-10 max-h-64 overflow-y-auto">
          {filtered.map((s) => (
            <Link
              key={s.suburb}
              href={`/suburb/${s.slug}`}
              className="flex justify-between items-center px-4 py-2 hover:bg-primary/5 transition-colors"
            >
              <span className="font-medium">{s.suburb}</span>
              <span className="text-sm text-base-content/60">{s.avg.toFixed(1)}¢ avg</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
