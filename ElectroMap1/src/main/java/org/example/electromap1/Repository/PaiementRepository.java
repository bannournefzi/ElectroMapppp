package org.example.electromap1.Repository;

import org.example.electromap1.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    Optional<Paiement> findByStripeSessionId(String sessionId);
    Optional<Paiement> findTopByReservationStationIdOrderByCreatedAtDesc(Long reservationId);
    Optional<Paiement> findByStripePaymentIntentId(String paymentIntentId);
    Optional<Paiement> findTopByStripePaymentIntentIdIsNullOrderByCreatedAtDesc(); // (si utilisé)

}
