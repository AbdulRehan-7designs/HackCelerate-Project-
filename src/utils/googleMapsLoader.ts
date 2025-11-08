import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg';

// Track which libraries are needed - collect all before loading
const requiredLibraries = new Set<string>();
let loaderPromise: Promise<typeof google> | null = null;
let isInitialized = false;

// All possible libraries that might be needed across the app
const ALL_POSSIBLE_LIBRARIES = ['places', 'geometry', 'visualization', 'drawing', 'marker'];

/**
 * Centralized Google Maps loader that ensures the API is only loaded once
 * with all required libraries. This prevents the "Loader must not be called again" error.
 * 
 * Strategy: Load ALL commonly used libraries upfront to avoid conflicts when
 * different components request different library sets.
 */
export const loadGoogleMaps = async (libraries: string[] = []): Promise<typeof google> => {
  // Track requested libraries (for reference, but we'll load all anyway)
  libraries.forEach(lib => {
    if (ALL_POSSIBLE_LIBRARIES.includes(lib)) {
      requiredLibraries.add(lib);
    }
  });

  // If already loaded, return immediately
  if (loaderPromise && isInitialized) {
    return loaderPromise;
  }

  // If currently loading, wait for it
  if (loaderPromise) {
    return loaderPromise;
  }

  // Load with ALL commonly used libraries upfront to prevent conflicts
  // This ensures any component can use any library without re-initialization errors
  const librariesToLoad: string[] = [
    'places',      // For search and autocomplete
    'geometry',    // For distance calculations
    'visualization' // For heatmaps
  ];

  // Create loader with all libraries
  const loader = new Loader({
    apiKey: GOOGLE_MAPS_API_KEY,
    version: "weekly",
    libraries: librariesToLoad as any
  });

  // Load and cache the promise
  loaderPromise = loader.load().then(google => {
    isInitialized = true;
    return google;
  }).catch(error => {
    // Reset on error so it can be retried
    loaderPromise = null;
    isInitialized = false;
    throw error;
  });

  return loaderPromise;
};

/**
 * Reset the loader (useful for testing or re-initialization)
 */
export const resetGoogleMapsLoader = () => {
  loaderPromise = null;
  isInitialized = false;
  requiredLibraries.clear();
};

