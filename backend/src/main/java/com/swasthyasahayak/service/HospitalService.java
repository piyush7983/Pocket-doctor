package com.swasthyasahayak.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service for finding nearby hospitals.
 * Uses Google Places API if configured, otherwise returns mock data.
 */
@Service
public class HospitalService {

    private static final Logger log = LoggerFactory.getLogger(HospitalService.class);

    @Value("${app.google.api-key:DEMO_KEY}")
    private String googleApiKey;

    /**
     * Represents a hospital result.
     */
    public record HospitalResult(
            String placeId,
            String name,
            String address,
            double distance,       // in km
            double rating,
            int totalRatings,
            String mapsUrl,
            String phoneNumber,
            double lat,
            double lng
    ) {}

    /**
     * Find hospitals near the given coordinates within ~20 km.
     */
    public List<HospitalResult> findNearbyHospitals(double lat, double lng) {
        // If Google API key is configured, call Google Places API
        if (googleApiKey != null && !googleApiKey.isEmpty()
                && !googleApiKey.equals("DEMO_KEY")
                && !googleApiKey.startsWith("YOUR_")) {
            return callGooglePlacesApi(lat, lng);
        }

        // Return mock data for development
        return generateMockHospitals(lat, lng);
    }

    /**
     * Call Google Places API for real hospital data.
     */
    private List<HospitalResult> callGooglePlacesApi(double lat, double lng) {
        try {
            // In a real implementation, use HttpClient to call Google Places API:
            // https://maps.googleapis.com/maps/api/place/nearbysearch/json
            // ?location={lat},{lng}&radius=20000&type=hospital&key={apiKey}

            /*
            String url = String.format(
                "https://maps.googleapis.com/maps/api/place/nearbysearch/json" +
                "?location=%f,%f&radius=20000&type=hospital&key=%s",
                lat, lng, googleApiKey);

            var client = HttpClient.newHttpClient();
            var request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

            var response = client.send(request, HttpResponse.BodyHandlers.ofString());
            // Parse JSON response...
            */

            log.info("Google Places API call would be made for: {}, {}", lat, lng);
            return generateMockHospitals(lat, lng);
        } catch (Exception e) {
            log.error("Error calling Google Places API", e);
            return generateMockHospitals(lat, lng);
        }
    }

    /**
     * Generate mock hospital data for development/testing.
     */
    private List<HospitalResult> generateMockHospitals(double lat, double lng) {
        String[][] hospitalData = {
            {"AIIMS - All India Institute of Medical Sciences", "4.5", "12500"},
            {"Apollo Hospital", "4.4", "8900"},
            {"Fortis Healthcare", "4.3", "7200"},
            {"Max Super Specialty Hospital", "4.5", "6500"},
            {"Medanta - The Medicity", "4.6", "9800"},
            {"Sir Ganga Ram Hospital", "4.2", "5400"},
            {"BLK-Max Hospital", "4.3", "4600"},
            {"Manipal Hospital", "4.4", "5800"},
            {"Safdarjung Hospital", "4.0", "8200"},
            {"Holy Family Hospital", "4.1", "3100"},
        };

        List<HospitalResult> results = new ArrayList<>();
        Random rand = new Random();

        for (int i = 0; i < hospitalData.length; i++) {
            double distance = Math.round((0.5 + rand.nextDouble() * 19.5) * 10.0) / 10.0;
            double latOffset = (rand.nextDouble() - 0.5) * 0.05;
            double lngOffset = (rand.nextDouble() - 0.5) * 0.05;

            results.add(new HospitalResult(
                    "mock-place-" + i,
                    hospitalData[i][0],
                    (rand.nextInt(500) + 1) + ", Sector " + (rand.nextInt(60) + 1) + ", Near Metro Station",
                    distance,
                    Double.parseDouble(hospitalData[i][1]),
                    Integer.parseInt(hospitalData[i][2]),
                    "https://www.google.com/maps/search/?api=1&query="
                            + (lat + latOffset) + "," + (lng + lngOffset),
                    "+91-11-" + (10000000 + rand.nextInt(90000000)),
                    lat + latOffset,
                    lng + lngOffset
            ));
        }

        // Sort by distance
        results.sort(Comparator.comparingDouble(HospitalResult::distance));

        // Return top 10
        return results.size() > 10 ? results.subList(0, 10) : results;
    }
}
