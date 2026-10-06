import type {
  ILocationProvider,
  IRouteProvider,
  GeoCoordinates,
  PlaceSearchResult,
  PlaceDetails,
  RouteEstimateResult,
} from './types';

export class BrowserLocationProvider implements ILocationProvider, IRouteProvider {
  /**
   * Requests device GPS coordinates using standard HTML5 Geolocation API.
   * Only invoked upon explicit user interaction (e.g. clicking a button).
   */
  async getCurrentCoordinates(): Promise<GeoCoordinates | null> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        () => {
          // Gracefully resolve null if user denies permission or location is unavailable
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  /**
   * Prepared placeholder for zero-cost place searches (e.g. OSM Nominatim).
   */
  async searchPlaces(_query: string): Promise<PlaceSearchResult[]> {
    return [];
  }

  /**
   * Prepared placeholder for zero-cost place details.
   */
  async getPlaceDetails(_placeId: string): Promise<PlaceDetails | null> {
    return null;
  }

  /**
   * Prepared placeholder for zero-cost route estimates (e.g. OSRM / OpenRouteService).
   */
  async getRoute(
    _origin: GeoCoordinates | string,
    _destination: GeoCoordinates | string,
    _mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
  ): Promise<RouteEstimateResult | null> {
    return null;
  }

  /**
   * Generates a universal, free external navigation URL to open the device's native map app.
   */
  getMapsUrl(location: {
    name?: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }): string {
    if (location.latitude != null && location.longitude != null) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${location.latitude},${location.longitude}`
      )}`;
    }
    const query = [location.name, location.address].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }
}

export const defaultLocationProvider = new BrowserLocationProvider();
