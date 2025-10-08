package org.example.electromap1.Service;

import lombok.RequiredArgsConstructor;
import org.example.electromap1.Repository.ChargingStationRepo;
import org.example.electromap1.Repository.ReservationStationRepository;
import org.example.electromap1.entity.ChargingStation;
import org.example.electromap1.entity.ReservationStation;
import org.example.electromap1.user.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReservationStationService {

    private final ReservationStationRepository reservationRepo;
    private final ChargingStationRepo stationRepo;
    private final ReservationStationRepository reservationRepository;

    public ReservationStation reserverStation(ReservationStation reservation, User user) {
        boolean hasActiveReservation = reservationRepo.existsByUtilisateurIdAndDateFinPrevueAfter(
                user.getId().longValue(), LocalDateTime.now());

        if (hasActiveReservation) {
            throw new RuntimeException("Vous avez déjà une réservation en cours.");
        }

        ChargingStation station = stationRepo.findById(reservation.getStation().getId())
                .orElseThrow(() -> new RuntimeException("Station non trouvée"));

        double pourcentageRestant = 100 - reservation.getPourcentageChargeActuelle();
        double batterieVehiculeKWh = getCapaciteBatterie(reservation.getTypeVehicule());
        double energieManquante = batterieVehiculeKWh * (pourcentageRestant / 100);
        double tempsHeures = energieManquante / station.getPower();
        int tempsMinutes = (int) (tempsHeures * 60);

        station.setAvailable(false);
        stationRepo.save(station);

        reservation.setUtilisateur(user);
        reservation.setDateReservation(LocalDateTime.now());
        reservation.setDateFinPrevue(LocalDateTime.now().plusMinutes(tempsMinutes));
        reservation.setTempsEstimeMinutes(tempsMinutes);

        return reservationRepo.save(reservation);
    }


    private double getCapaciteBatterie(String typeVehicule) {
        return switch (typeVehicule.toLowerCase()) {
            case "tesla model 3" -> 60.0;
            case "renault zoe" -> 40.0;
            case "nissan leaf" -> 50.0;
            default -> 45.0; // Valeur par défaut
        };
    }

    public void deleteById(Long id) {
        reservationRepository.deleteById(id);
    }




}
