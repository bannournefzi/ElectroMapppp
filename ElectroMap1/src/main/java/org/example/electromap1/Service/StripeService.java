package org.example.electromap1.Service;

import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.example.electromap1.Repository.PaiementRepository;
import org.example.electromap1.Repository.ReservationStationRepository;
import org.example.electromap1.config.StripeProperties;
import org.example.electromap1.entity.Paiement;
import org.example.electromap1.entity.ReservationStation;
import org.example.electromap1.entity.StatutPaiement;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class StripeService {

    private final StripeClient stripe;
    private final StripeProperties props;
    private final ReservationStationRepository reservationRepo;
    private final PaiementRepository paiementRepo;

    @Transactional
    public Session createCheckoutSession(Long reservationId) {
        ReservationStation reservation = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("ReservationStation not found: " + reservationId));

        long amountMinor = 1000L;
        BigDecimal amountMajor = BigDecimal.valueOf(10.00);

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(props.getSuccessUrl())
                .setCancelUrl(props.getCancelUrl())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(props.getCurrency())
                                                .setUnitAmount(amountMinor)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Paiement réservation station #" + reservation.getId())
                                                                .putMetadata("reservationId", String.valueOf(reservation.getId()))
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("reservationId", String.valueOf(reservation.getId()))
                .build();

        Session session;
        try {
            session = stripe.checkout().sessions().create(params);
        } catch (StripeException e) {
            throw new IllegalStateException("Stripe session creation failed: " + e.getMessage(), e);
        }

        Paiement p = Paiement.builder()
                .reservationStation(reservation)
                .amount(amountMajor)
                .currency(props.getCurrency())
                .stripeSessionId(session.getId())
                .statut(StatutPaiement.PENDING)
                .build();
        paiementRepo.save(p);

        return session;
    }

    @Transactional
    public void markPaymentSucceeded(String sessionId, String paymentIntentId) {
        Paiement p = paiementRepo.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for session " + sessionId));

        p.setStatut(StatutPaiement.SUCCEEDED);
        p.setStripePaymentIntentId(paymentIntentId);
        paiementRepo.save(p);


    }
    @Transactional
    public void markPaymentFailedByIntent(String paymentIntentId) {
        // On essaie d'abord par paymentIntentId (si déjà relié)
        Paiement p = paiementRepo.findByStripePaymentIntentId(paymentIntentId)
                // sinon on récupère le dernier PENDING sans PI (fallback)
                .orElseGet(() -> paiementRepo
                        .findTopByStripePaymentIntentIdIsNullOrderByCreatedAtDesc()
                        .orElse(null)
                );
        if (p == null) return;

        p.setStatut(StatutPaiement.FAILED);
         if (p.getStripePaymentIntentId() == null) {
            p.setStripePaymentIntentId(paymentIntentId);
        }
        paiementRepo.save(p);
    }

}
