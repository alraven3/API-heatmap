import { useState, useEffect } from 'react'
import './App.css'
import { rollups, mean } from 'd3-array';
import { Heatmap } from './Heatmap';


const CITIES = [
  { name: 'Reykjavik', lat: 64.15, lon: -21.94 },
  { name: 'Anchorage', lat: 61.22, lon: -149.9 },
  { name: 'Oslo', lat: 59.91, lon: 10.75 },
  { name: 'Moscow', lat: 55.75, lon: 37.62 },
  { name: 'London', lat: 51.51, lon: -0.13 },
  { name: 'Paris', lat: 48.85, lon: 2.35 },
  { name: 'New York', lat: 40.71, lon: -74.01 },
  { name: 'Tokyo', lat: 35.68, lon: 139.65 },
  { name: 'Los Angeles', lat: 34.05, lon: -118.24 },
  { name: 'Cairo', lat: 30.04, lon: 31.24 },
  { name: 'Delhi', lat: 28.61, lon: 77.21 },
  { name: 'Mexico City', lat: 19.43, lon: -99.13 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88 },
  { name: 'Bangkok', lat: 13.76, lon: 100.5 },
  { name: 'Singapore', lat: 1.35, lon: 103.82 },
  { name: 'Nairobi', lat: -1.29, lon: 36.82 },
  { name: 'Jakarta', lat: -6.21, lon: 106.85 },
  { name: 'Lima', lat: -12.05, lon: -77.04 },
  { name: 'Rio de Janeiro', lat: -22.91, lon: -43.17 },
  { name: 'Cape Town', lat: -33.92, lon: 18.42 },
];

const url =
  'https://archive-api.open-meteo.com/v1/archive' +
  '?latitude=' + CITIES.map((c) => c.lat).join(',') +
  '&longitude=' + CITIES.map((c) => c.lon).join(',') +
  '&start_date=2025-01-01&end_date=2025-12-31' +
  '&daily=temperature_2m_mean&timezone=auto';

const YEAR_START = new Date('2025-01-01');
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function App() {
  // 2. Utilisez un nom différent pour le state si vous gardez l'import, 
  // ou supprimez l'import si vous ne voulez que les données API.
  // Ici, on suppose que vous voulez afficher les données API dans la Heatmap.
  const [heatmapData, setHeatmapData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        
        const daily = json.flatMap((city, i) =>
          city.daily.time.map((t, j) => ({
            city: CITIES[i].name,
            week: Math.min(51, Math.floor((new Date(t) - YEAR_START) / WEEK_MS)),
            temp: city.daily.temperature_2m_mean[j],
          }))
        );

        const processedData = rollups(
          daily,
          (v) => mean(v, (d) => d.temp),
          (d) => d.city,
          (d) => d.week
        ).flatMap(([city, weeks]) =>
          weeks.map(([week, value]) => ({ 
            x: week.toString(), 
            y: city, 
            value 
          }))
        );

        // 3. Mettez à jour le state avec les données traitées
        setHeatmapData(processedData);
      } catch (error) {
        console.error("Erreur lors du fetch:", error);
      }
    };
    fetchData();
  }, []);



  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Heatmap: Weekly Temperatures Across the World in 2025</h1>
      <Heatmap data={heatmapData} width={900} height={600} />
      <p><a href='https://open-meteo.com/'>Data: Open-Meteo API</a></p>
    </div>      
  )
}

export default App