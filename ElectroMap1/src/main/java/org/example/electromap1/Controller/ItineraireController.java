package org.example.electromap1.Controller;

import lombok.RequiredArgsConstructor;
import org.example.electromap1.Service.ItineraireService;
import org.example.electromap1.entity.ChargingStation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/itineraire")
@RequiredArgsConstructor
public class ItineraireController {
    private final ItineraireService itineraireService;

    @GetMapping("/suggested-stations")
    public ResponseEntity<List<ChargingStation>> getItineraire(
            @RequestParam double fromLat,
            @RequestParam double fromLng,
            @RequestParam double toLat,
            @RequestParam double toLng,
            @RequestParam double charge
    ) {
        List<ChargingStation> stations = itineraireService.calculerStationsItineraire(fromLat, fromLng, toLat, toLng, charge);
        return ResponseEntity.ok(stations);
    }
}
