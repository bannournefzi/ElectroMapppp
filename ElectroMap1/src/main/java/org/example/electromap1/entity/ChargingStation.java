package org.example.electromap1.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "charging_stations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "reservations"})

public class ChargingStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom de la borne est obligatoire")
    private String name;

    @DecimalMin(value = "-90.0", message = "Latitude minimale = -90.0")
    @DecimalMax(value = "90.0", message = "Latitude maximale = 90.0")
    private double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude minimale = -180.0")
    @DecimalMax(value = "180.0", message = "Longitude maximale = 180.0")
    private double longitude;

    @NotNull(message = "Le type de charge est requis")
    @Enumerated(EnumType.STRING)
    private ChargingType type;

    private boolean available = true;

    private boolean working = true;

    @Size(max = 1000, message = "La description ne doit pas dépasser 1000 caractères")
    private String description;

    @Column(length = 255)
    private String address;

    private Double power;

    @ElementCollection
    @CollectionTable(name = "station_vehicles", joinColumns = @JoinColumn(name = "station_id"))
    @Column(name = "vehicle")
    private List<String> compatibleVehicles;

    @Column(length = 255)
    private String connectorTypes;

    @Column(name = "average_charge_time")
    private Double averageChargeTime;

    private Double pricePerKwh;
}
