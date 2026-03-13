import bySuburb from "@/data/fuel-by-suburb.json";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fuel.rollersoft.com.au";
  const suburbs = Object.keys(bySuburb as Record<string, unknown[]>);

  const suburbPages = suburbs.map((suburb) => ({
    url: `${baseUrl}/suburb/${suburb.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...suburbPages,
  ];
}
