# STYLEGUIDE.md — AU Fuel Price Tracker

## Design Reference
- **Primary inspiration:** [fuelprice.io](https://fuelprice.io) — clean, minimal, data-focused
- **Secondary:** [fuelcheck.nsw.gov.au](https://fuelcheck.nsw.gov.au) — government data credibility

## Color Palette
- **Primary:** `#1e40af` (deep blue — trust, fuel/energy)
- **Secondary:** `#0891b2` (cyan — fresh, modern)  
- **Accent:** `#f59e0b` (amber — fuel/energy, price highlights)
- **Success:** `#16a34a` (green — cheap prices)
- **Error:** `#dc2626` (red — expensive prices)
- **Background:** `#f8fafc` (slate-50)
- **Surface:** `#ffffff`

## Typography
- **Headings:** System font stack, bold, tight tracking
- **Body:** System font, regular weight
- **Data/Prices:** Tabular nums, monospace for alignment

## Layout Principles
- Max width 1200px, centered
- Card-based sections with subtle shadows
- Generous whitespace between sections
- Mobile-first responsive grid

## Components
- DaisyUI `corporate` theme as base
- Cards with `shadow-md` not `shadow-xl` (subtler)
- Badges for fuel types with color coding
- Stats components for key metrics
- Search bar prominent in hero

## Iconography
- Emoji for section headers (⛽ 🏆 📍 💸)
- No icon library needed — keep bundle small

## Data Display
- Tables for station listings
- Color-coded prices (green=cheap, red=expensive)
- Relative indicators (% above/below average)
