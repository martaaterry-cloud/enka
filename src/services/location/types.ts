export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface PlaceSearchResult {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  coordinates?: GeoCoordinates | null;
  provider: string;
}

export interface PlaceDetails extends PlaceSearchResult {
  raw?: Record<string, any>;
}

export interface RouteEstimateResult {
  durationMinutes: number;
  durationMinMinutes?: number;
  durationMaxMinutes?: number;
  distanceMeters?: number;
  travelMode: 'driving' | 'walking' | 'transit' | 'bicycling';
  provider: string;
}

/**
 * Clean abstraction for place search and device location.
 * Allows future integration with OpenStreetMap (Nominatim), browser APIs, etc.
 * Zero mandatory external cost / Zero paid SDK lock-in.
 */
export interface ILocationProvider {
  getCurrentCoordinates(): Promise<GeoCoordinates | null>;
  searchPlaces(query: string): Promise<PlaceSearchResult[]>;
  getPlaceDetails(placeId: string): Promise<PlaceDetails | null>;
  getMapsUrl(location: {
    name?: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }): string;
}

/**
 * Clean abstraction for route estimation between locations.
 * Extensible for free routing engines (e.g. OSRM, openrouteservice) or local calculations.
 */
export interface IRouteProvider {
  getRoute(
    origin: GeoCoordinates | string,
    destination: GeoCoordinates | string,
    mode: 'driving' | 'walking' | 'transit' | 'bicycling'
  ): Promise<RouteEstimateResult | null>;
}
