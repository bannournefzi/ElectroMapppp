package org.example.electromap1.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import org.example.electromap1.user.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservation_station") // ce nom sera utilisé pour la table
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    @ManyToOne
    @JoinColumn(name = "station_id")
    private ChargingStation station;

    @Column(name = "pourcentage_charge_actuelle")
    private int pourcentageChargeActuelle;

    @Column(name = "temps_estime_charge")
    private int tempsEstimeMinutes;


    @Column(name = "date_reservation")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateReservation;


    @Column(name = "date_fin_prevue")
    private LocalDateTime dateFinPrevue;

    @Column(name = "type_vehicule")
    private String typeVehicule;

    private String stationNom;
    private String stationAdresse;


    @Enumerated(EnumType.STRING)
    private ReservationStatus statut = ReservationStatus.EN_ATTENTE;
}
