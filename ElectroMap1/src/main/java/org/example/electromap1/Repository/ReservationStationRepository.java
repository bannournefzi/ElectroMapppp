package org.example.electromap1.Repository;

import org.example.electromap1.entity.ReservationStation;
import org.example.electromap1.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationStationRepository extends JpaRepository<ReservationStation, Long> {
    List<ReservationStation> findByUtilisateurId(Long userId);
    boolean existsByUtilisateurIdAndDateFinPrevueAfter(Long utilisateurId, LocalDateTime now);
    List<ReservationStation> findByUtilisateur(User user);


}