package com.swasthyasahayak.controller;

import com.swasthyasahayak.service.HospitalService;
import com.swasthyasahayak.service.HospitalService.HospitalResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    /**
     * GET /api/nearby-hospitals?lat=...&lng=...
     * Returns top 10 hospitals within ~20 km radius.
     */
    @GetMapping("/nearby-hospitals")
    public ResponseEntity<List<HospitalResult>> getNearbyHospitals(
            @RequestParam double lat,
            @RequestParam double lng) {
        List<HospitalResult> hospitals = hospitalService.findNearbyHospitals(lat, lng);
        return ResponseEntity.ok(hospitals);
    }
}
