package org.example.electromap1.Controller;


import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.electromap1.Repository.PaiementRepository;
import org.example.electromap1.config.StripeProperties;
import org.example.electromap1.Service.StripeService;
import org.example.electromap1.entity.Paiement;
import org.example.electromap1.entity.StatutPaiement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final StripeProperties props;
    private final StripeService stripeService;
    private final PaiementRepository paiementRepo;


    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestHeader("Stripe-Signature") String signature,
            @RequestBody String payload
    ) {
        Event event;
        try {
            event = Webhook.constructEvent(
                    payload,
                    signature,
                    props.getWebhookSecret() // whsec_xxx dans application.yml
            );
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        // Traiter les types d'événements utiles
        switch (event.getType()) {
            case "checkout.session.completed": {
                Session session = (Session) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (session != null) {
                    String sessionId = session.getId();
                    String paymentIntentId = session.getPaymentIntent();
                    // Marque SUCCEEDED
                    stripeService.markPaymentSucceeded(sessionId, paymentIntentId);
                }
                break;
            }
            case "payment_intent.payment_failed": {
                PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (pi != null && pi.getLatestCharge() != null) {
                    // Optionnel: marquer FAILED si tu veux:
                    stripeService.markPaymentFailedByIntent(pi.getId());
                }
                break;
            }
            default:
                // ignore les autres
        }

        return ResponseEntity.ok("ok");
    }
    @Transactional
    public void markPaymentFailedByIntent(String paymentIntentId) {
        Paiement p = paiementRepo.findByStripePaymentIntentId(paymentIntentId)
                .orElseGet(() -> paiementRepo.findTopByStripePaymentIntentIdIsNullOrderByCreatedAtDesc().orElse(null));
        if (p == null) return;
        p.setStatut(StatutPaiement.FAILED);
        paiementRepo.save(p);
    }
}