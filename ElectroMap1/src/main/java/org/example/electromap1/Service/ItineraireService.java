package org.example.electromap1.Service;

import lombok.RequiredArgsConstructor;
import org.example.electromap1.Repository.ChargingStationRepo;
import org.example.electromap1.entity.ChargingStation;
import org.example.electromap1.utill.GeoUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItineraireService {

    private final ChargingStationRepo stationRepo;

    // Exemple : 1% de batterie = 4 km (à adapter selon ton modèle)
    private final double kmParPourcentageCharge = 4.0;
    // Autonomie max d'une voiture (100% de batterie) ~ 400 km
    private final double autonomieMaxKm = 400.0;

    public List<ChargingStation> calculerStationsItineraire(
            double departLat,
            double departLng,
            double destinationLat,
            double destinationLng,
            double chargeActuellePourcent
    ) {
        double autonomieRestante = chargeActuellePourcent * kmParPourcentageCharge;
        double distanceTotale = GeoUtils.distanceKm(departLat, departLng, destinationLat, destinationLng);

        List<ChargingStation> toutesStations = stationRepo.findAll();
        List<ChargingStation> stationsDansLeChemin = new ArrayList<>();

        for (ChargingStation station : toutesStations) {
            double distanceFromDepart = GeoUtils.distanceKm(departLat, departLng, station.getLatitude(), station.getLongitude());
            double distanceFromDest = GeoUtils.distanceKm(destinationLat, destinationLng, station.getLatitude(), station.getLongitude());

            if ((distanceFromDepart + distanceFromDest) <= distanceTotale * 1.2 &&
                    distanceFromDepart <= autonomieRestante) {

                stationsDansLeChemin.add(station);

                double rechargeKm = 200.0;
                autonomieRestante = Math.min(autonomieRestante + rechargeKm, autonomieMaxKm);
            }
        }

        stationsDansLeChemin.sort(Comparator.comparingDouble(
                s -> GeoUtils.distanceKm(departLat, departLng, s.getLatitude(), s.getLongitude())
        ));

        return stationsDansLeChemin;
    }
}
