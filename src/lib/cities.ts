export interface City {
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
}

export const PAKISTANI_CITIES: City[] = [
  { name: 'Lahore', center: { lat: 31.5204, lng: 74.3587 }, zoom: 12 },
  { name: 'Karachi', center: { lat: 24.8607, lng: 67.0011 }, zoom: 11 },
  { name: 'Islamabad', center: { lat: 33.6844, lng: 73.0479 }, zoom: 12 },
  { name: 'Rawalpindi', center: { lat: 33.5651, lng: 73.0169 }, zoom: 12 },
  { name: 'Faisalabad', center: { lat: 31.4504, lng: 73.1350 }, zoom: 12 },
  { name: 'Multan', center: { lat: 30.1575, lng: 71.5249 }, zoom: 12 },
  { name: 'Gujranwala', center: { lat: 32.1877, lng: 74.1945 }, zoom: 12 },
  { name: 'Peshawar', center: { lat: 34.0151, lng: 71.5249 }, zoom: 12 },
];

export const DEFAULT_CITY = PAKISTANI_CITIES[0]; // Lahore

export function getCityByName(name: string): City | undefined {
  return PAKISTANI_CITIES.find(city => 
    city.name.toLowerCase() === name.toLowerCase()
  );
}
