package org.example.electromap1.Controller;

import lombok.RequiredArgsConstructor;
import org.example.electromap1.Repository.ReservationStationRepository;
import org.example.electromap1.Service.ReservationStationService;
import org.example.electromap1.entity.ReservationStation;
import org.example.electromap1.user.User;
import org.example.electromap1.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationStationController {

    private final ReservationStationRepository reservationRepo;
    private final UserRepository userRepo;
    private final ReservationStationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationStation> reserver(
            @RequestBody ReservationStation reservation,
            Principal principal) {

        User user = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        ReservationStation saved = reservationService.reserverStation(reservation, user);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReservationStation>> mesReservations(Principal principal) {
        User user = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return ResponseEntity.ok(reservationRepo.findByUtilisateurId(user.getId().longValue()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReservationStation>> all() {
        return ResponseEntity.ok(reservationRepo.findAll());
    }
    @DeleteMapping("/admin/reservations/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        reservationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    



}
