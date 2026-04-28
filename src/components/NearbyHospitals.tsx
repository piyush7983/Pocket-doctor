import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getNearbyHospitals, type Hospital } from "@/services/api";
import toast from "react-hot-toast";
import {
  MapPin,
  Star,
  Navigation,
  Phone,
  Loader2,
  Cross,
  Building2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function NearbyHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");

  const getUserLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  };

  const handleFindHospitals = async () => {
    setIsLoading(true);
    setLocationError("");
    setHospitals([]);

    try {
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      const results = await getNearbyHospitals(latitude, longitude);
      setHospitals(results);
      setHasSearched(true);

      if (results.length === 0) {
        toast.error("No hospitals found nearby. Try expanding your search.");
      } else {
        toast.success(`Found ${results.length} hospitals near you!`);
      }
    } catch (err: any) {
      const msg =
        err.code === 1
          ? "Location access denied. Please enable location permissions."
          : err.code === 2
          ? "Location unavailable. Please try again."
          : err.code === 3
          ? "Location request timed out. Please try again."
          : "Failed to get location. Using demo data.";

      setLocationError(msg);
      toast.error(msg);

      // Use default location (New Delhi) as fallback
      const defaultLat = 28.6139;
      const defaultLng = 77.209;
      setUserLocation({ lat: defaultLat, lng: defaultLng });
      const results = await getNearbyHospitals(defaultLat, defaultLng);
      setHospitals(results);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getDistanceColor = (distance: number) => {
    if (distance <= 2) return "text-green-600 dark:text-green-400";
    if (distance <= 5) return "text-amber-600 dark:text-amber-400";
    return "text-gray-500 dark:text-gray-400";
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 dark:fill-gray-700 text-gray-200 dark:text-gray-700"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Nearby Hospitals
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Find hospitals and clinics within 20 km of your location
        </p>
      </div>

      {/* Search Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleFindHospitals}
        disabled={isLoading}
        className="w-full rounded-2xl bg-gradient-to-r from-medical-500 to-blue-600 text-white px-6 py-5 font-semibold shadow-lg shadow-medical-200 dark:shadow-medical-900/30 hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Finding hospitals near you...
          </>
        ) : (
          <>
            <Cross className="h-5 w-5" />
            Find Nearby Hospitals
            <ChevronRight className="h-5 w-5" />
          </>
        )}
      </motion.button>

      {/* Location Error */}
      {locationError && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          ⚠️ {locationError} Showing results for default location.
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && hasSearched && hospitals.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Found <strong>{hospitals.length}</strong> hospitals near you
              </p>
              <button
                onClick={handleFindHospitals}
                className="text-sm text-medical-600 dark:text-medical-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            <div className="space-y-3">
              {hospitals.map((hospital, idx) => (
                <motion.div
                  key={hospital.placeId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400 font-bold text-sm">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name */}
                      <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                        {hospital.name}
                      </h3>

                      {/* Address */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {hospital.address}
                      </p>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <div className="flex">{getRatingStars(hospital.rating)}</div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {hospital.rating}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({hospital.totalRatings.toLocaleString()})
                          </span>
                        </div>

                        {/* Distance */}
                        <span
                          className={`text-xs font-semibold ${getDistanceColor(hospital.distance)} flex items-center gap-0.5`}
                        >
                          <Navigation className="h-3 w-3" />
                          {hospital.distance} km
                        </span>

                        {/* Phone */}
                        {hospital.phoneNumber && (
                          <a
                            href={`tel:${hospital.phoneNumber}`}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-medical-600 dark:hover:text-medical-400 flex items-center gap-0.5"
                          >
                            <Phone className="h-3 w-3" />
                            {hospital.phoneNumber}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Map Link */}
                    <a
                      href={hospital.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400 px-3 py-2 text-xs font-semibold hover:bg-medical-100 dark:hover:bg-medical-900/40 transition-colors"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      View Map
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {!isLoading && hasSearched && hospitals.length === 0 && !locationError && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No hospitals found nearby.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Try again or expand your search radius.
            </p>
          </div>
        )}
      </AnimatePresence>

      {/* Initial State */}
      {!isLoading && !hasSearched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-medical-50 dark:bg-medical-900/20 mx-auto mb-4">
            <MapPin className="h-10 w-10 text-medical-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Find Hospitals Near You
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Click the button above to locate hospitals within 20 km of your current
            location. We'll show you the nearest ones with ratings and contact info.
          </p>
        </motion.div>
      )}
    </div>
  );
}
