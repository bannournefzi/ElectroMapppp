package org.example.electromap1.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.electromap1.entity.ChargingStation;
import org.example.electromap1.Service.ChargingStationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChargingStationController {

    private final ChargingStationService service;

    @GetMapping

    public ResponseEntity<List<ChargingStation>> getAll() {
        return ResponseEntity.ok(service.getAllStations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChargingStation> getById(@PathVariable Long id) {
        return service.getStationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ChargingStation> create(@Valid @RequestBody ChargingStation station) {
        return ResponseEntity.ok(service.createStation(station));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ChargingStation> update(@PathVariable Long id, @Valid @RequestBody ChargingStation updated) {
        return ResponseEntity.ok(service.updateStation(id, updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteStation(id);
        return ResponseEntity.noContent().build();
    }
}
