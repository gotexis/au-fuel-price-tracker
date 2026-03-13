"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface Station {
  name: string;
  brand: string;
  address: string;
  suburb: string;
  price: number;
  fuelType: string;
  latitude: string;
  longitude: string;
}

interface FuelMapProps {
  stations: Station[];
  center?: [number, number];
  zoom?: number;
}

function FuelMapInner({ stations, center, zoom }: FuelMapProps) {
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [RL, setRL] = useState<typeof import("react-leaflet") | null>(null);

  useEffect(() => {
    Promise.all([import("leaflet"), import("react-leaflet")]).then(([leaflet, reactLeaflet]) => {
      // Fix default icon
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setL(leaflet);
      setRL(reactLeaflet);
    });
  }, []);

  if (!L || !RL) {
    return <div className="w-full h-[400px] bg-base-200 rounded-lg animate-pulse flex items-center justify-center text-base-content/40">Loading map…</div>;
  }

  const { MapContainer, TileLayer, Marker, Popup } = RL;

  // Filter stations with valid coords, dedupe by name, show cheapest ULP
  const ulpStations = stations
    .filter((s) => s.fuelType === "ULP" && s.price > 0 && s.latitude && s.longitude)
    .reduce((acc, s) => {
      if (!acc.has(s.name) || acc.get(s.name)!.price > s.price) acc.set(s.name, s);
      return acc;
    }, new Map<string, Station>());

  const markers = Array.from(ulpStations.values());
  const minPrice = Math.min(...markers.map((s) => s.price));
  const maxPrice = Math.max(...markers.map((s) => s.price));

  const defaultCenter: [number, number] = center || [-31.95, 115.86]; // Perth
  const defaultZoom = zoom || 10;

  function priceColor(price: number): string {
    if (price <= minPrice + 3) return "#22c55e";
    if (price >= maxPrice - 3) return "#ef4444";
    return "#3b82f6";
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <MapContainer center={defaultCenter} zoom={defaultZoom} className="w-full h-full" scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((s, i) => {
          const icon = L.divIcon({
            className: "fuel-marker",
            html: `<div style="background:${priceColor(s.price)};color:white;font-size:11px;font-weight:700;padding:2px 5px;border-radius:10px;white-space:nowrap;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3)">${s.price}¢</div>`,
            iconSize: [0, 0],
            iconAnchor: [25, 12],
          });
          return (
            <Marker key={i} position={[parseFloat(s.latitude), parseFloat(s.longitude)]} icon={icon}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.brand}</div>
                  <div className="text-xs">{s.address}, {s.suburb}</div>
                  <div className="font-bold text-lg mt-1" style={{ color: priceColor(s.price) }}>{s.price}¢/L ULP</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// Dynamic import to avoid SSR issues with Leaflet
export default dynamic(() => Promise.resolve(FuelMapInner), { ssr: false });
