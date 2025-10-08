package org.example.electromap1.Service;

import lombok.RequiredArgsConstructor;
import org.example.electromap1.Repository.ReservationStationRepository;
import org.example.electromap1.entity.ChargingStation;
import org.example.electromap1.Repository.ChargingStationRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChargingStationService {

    private final ChargingStationRepo repository;
    private final ReservationStationRepository reservationRepository;

    public List<ChargingStation> getAllStations() {
        return repository.findAll();
    }

    public Optional<ChargingStation> getStationById(Long id) {
        return repository.findById(id);
    }



    public ChargingStation createStation(ChargingStation station) {
        System.out.println(" STATION REÇUE : " + station.getName());
        return repository.save(station);
    }

    public ChargingStation updateStation(Long id, ChargingStation updated) {
        return repository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setLatitude(updated.getLatitude());
            existing.setLongitude(updated.getLongitude());
            existing.setType(updated.getType());
            existing.setAvailable(updated.isAvailable());
            existing.setWorking(updated.isWorking());
            existing.setDescription(updated.getDescription());
            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Station not found"));
    }

    public void deleteStation(Long id) {
        repository.deleteById(id);
    }
    public void deleteById(Long id) {
        reservationRepository.deleteById(id);
    }

}
