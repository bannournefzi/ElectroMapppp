package org.example.electromap1.Controller;

import lombok.RequiredArgsConstructor;
import org.example.electromap1.Repository.TrajetPlanifieRepository;
import org.example.electromap1.entity.TrajetPlanifie;
import org.example.electromap1.user.User;
import org.example.electromap1.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/trajets")
@RequiredArgsConstructor

public class TrajetController {

    @Autowired

    private final TrajetPlanifieRepository trajetRepo;
    private final UserRepository userRepo;

    @PostMapping
    public ResponseEntity<TrajetPlanifie> saveTrajet(
            @RequestBody TrajetPlanifie trajet,
            Principal principal // ou Authentication auth
    ) {
        trajet.setDateCreation(LocalDateTime.now());

        User user = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        trajet.setUtilisateur(user);

        return ResponseEntity.ok(trajetRepo.save(trajet));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrajetPlanifie> getTrajetById(@PathVariable Long id) {
        Optional<TrajetPlanifie> trajet = trajetRepo.findById(id);
        return trajet.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }}
