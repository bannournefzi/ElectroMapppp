package org.example.electromap1.Controller;


import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;
import org.example.electromap1.Repository.PaiementRepository;
import org.example.electromap1.dto.CreateCheckoutSessionRequest;
import org.example.electromap1.dto.CreateCheckoutSessionResponse;
import org.example.electromap1.Service.StripeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;
    private final PaiementRepository paiementRepo;
    private final com.stripe.StripeClient stripe;

    @PostMapping("/checkout/session")
    public ResponseEntity<CreateCheckoutSessionResponse> createSession(
            @RequestBody CreateCheckoutSessionRequest req) {
        Session session = stripeService.createCheckoutSession(req.getReservationId());
        return ResponseEntity.ok(new CreateCheckoutSessionResponse(session.getId(), session.getUrl()));
    }

    @GetMapping("/reservation/{reservationId}/status")
    public ResponseEntity<String> getPaymentStatus(@PathVariable Long reservationId) {
        return paiementRepo.findTopByReservationStationIdOrderByCreatedAtDesc(reservationId)
                .map(p -> ResponseEntity.ok(p.getStatut().name()))
                .orElse(ResponseEntity.ok("NONE"));                   
    }
    @PostMapping("/confirm")
    public ResponseEntity<Void> confirm(@RequestParam("session_id") String sessionId) throws Exception {
        var session = stripe.checkout().sessions().retrieve(sessionId);
        if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
            stripeService.markPaymentSucceeded(session.getId(), session.getPaymentIntent());
        } else {
            // optional: mark failed if not paid
        }
        return ResponseEntity.ok().build();
    }
}