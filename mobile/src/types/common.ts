export type ID = string;
/** ISO 8601 timestamp, e.g. "2026-11-08T14:30:00Z". */
export type ISODate = string;

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Address {
  label?: string; // "Home", "Job site"
  line1: string;
  city: string;
  location?: GeoPoint;
}