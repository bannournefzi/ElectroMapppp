package org.example.electromap1.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.electromap1.user.User;

import java.time.LocalDateTime;
import java.util.List;

@Entity

@Getter
@Setter
@Table(name = "trajet_planifie")
public class TrajetPlanifie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pointDepart;
    private String destination;
    private double chargeActuelle;
    private double distanceTotale;
    private LocalDateTime dateCreation;

    @ElementCollection
    private List<String> stationsSuggerees;

    @ManyToOne
    @JoinColumn(name = "user_id") // facultatif mais conseillé
    private User utilisateur;
    // Getters et Setters
    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateCreation() {

        return dateCreation;
    }


}