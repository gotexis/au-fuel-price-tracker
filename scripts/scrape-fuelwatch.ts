/**
 * WA FuelWatch RSS Scraper
 * Fetches real-time fuel prices from WA FuelWatch (free, no API key needed)
 * 
 * Usage: npx ts-node scripts/scrape-fuelwatch.ts
 * 
 * Fuel types: 1=ULP, 2=PULP, 4=Diesel, 5=LPG, 6=98RON, 10=E85, 11=Brand diesel
 * Regions: 25=All Metro, 26=All Country
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface FuelStation {
  name: string;
  brand: string;
  address: string;
  suburb: string;
  state: string;
  price: number;
  fuelType: string;
  date: string;
  latitude?: string;
  longitude?: string;
}

async function fetchFuelWatch(fuelType: string = '', region: string = ''): Promise<FuelStation[]> {
  const params = new URLSearchParams();
  if (fuelType) params.set('Product', fuelType);
  if (region) params.set('Region', region);
  
  const url = `https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?${params}`;
  console.log(`Fetching: ${url}`);
  
  const res = await fetch(url);
  const text = await res.text();
  
  // Simple XML parsing without heavy deps
  const items: FuelStation[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(text)) !== null) {
    const item = match[1];
    const get = (tag: string) => {
      const m = item.match(new RegExp(`<${tag}>(.*?)</${tag}>`));
      return m ? m[1].trim() : '';
    };
    
    items.push({
      name: get('trading-name') || get('title').replace(/^\d+\.?\d*:\s*/, ''),
      brand: get('brand'),
      address: get('address'),
      suburb: get('location'),
      state: 'WA',
      price: parseFloat(get('price')) || 0,
      fuelType: get('description').includes('Unleaded') ? 'ULP' : 
                get('description').includes('Diesel') ? 'Diesel' : 
                fuelType === '2' ? 'PULP' : 
                fuelType === '6' ? '98RON' : 'ULP',
      date: get('date'),
      latitude: get('latitude'),
      longitude: get('longitude'),
    });
  }
  
  return items;
}

async function main() {
  const fuelTypes = [
    { id: '1', name: 'ULP' },
    { id: '2', name: 'PULP' },
    { id: '4', name: 'Diesel' },
    { id: '6', name: '98RON' },
  ];
  
  const allStations: FuelStation[] = [];
  
  for (const ft of fuelTypes) {
    try {
      // Metro
      const metro = await fetchFuelWatch(ft.id, '25');
      metro.forEach(s => s.fuelType = ft.name);
      allStations.push(...metro);
      
      // Country
      const country = await fetchFuelWatch(ft.id, '26');
      country.forEach(s => s.fuelType = ft.name);
      allStations.push(...country);
      
      console.log(`${ft.name}: ${metro.length} metro + ${country.length} country stations`);
      
      // Be polite - small delay between requests
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(`Error fetching ${ft.name}:`, e);
    }
  }
  
  // Dedupe by station+fueltype
  const seen = new Set<string>();
  const unique = allStations.filter(s => {
    const key = `${s.name}-${s.suburb}-${s.fuelType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  // Group by suburb
  const bySuburb: Record<string, FuelStation[]> = {};
  for (const s of unique) {
    const suburb = s.suburb || 'Unknown';
    if (!bySuburb[suburb]) bySuburb[suburb] = [];
    bySuburb[suburb].push(s);
  }
  
  // Compute stats
  const ulpPrices = unique.filter(s => s.fuelType === 'ULP').map(s => s.price).filter(p => p > 0);
  const stats = {
    totalStations: new Set(unique.map(s => `${s.name}-${s.suburb}`)).size,
    totalPrices: unique.length,
    suburbs: Object.keys(bySuburb).length,
    avgULP: ulpPrices.length ? (ulpPrices.reduce((a, b) => a + b, 0) / ulpPrices.length).toFixed(1) : null,
    minULP: ulpPrices.length ? Math.min(...ulpPrices) : null,
    maxULP: ulpPrices.length ? Math.max(...ulpPrices) : null,
    date: unique[0]?.date || new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString(),
  };
  
  const outDir = join(__dirname, '..', 'src', 'data');
  mkdirSync(outDir, { recursive: true });
  
  writeFileSync(join(outDir, 'fuel-prices.json'), JSON.stringify(unique, null, 2));
  writeFileSync(join(outDir, 'fuel-by-suburb.json'), JSON.stringify(bySuburb, null, 2));
  writeFileSync(join(outDir, 'fuel-stats.json'), JSON.stringify(stats, null, 2));
  
  console.log(`\nDone! ${stats.totalStations} stations, ${stats.suburbs} suburbs`);
  console.log(`ULP avg: ${stats.avgULP}c, min: ${stats.minULP}c, max: ${stats.maxULP}c`);
}

main().catch(console.error);
