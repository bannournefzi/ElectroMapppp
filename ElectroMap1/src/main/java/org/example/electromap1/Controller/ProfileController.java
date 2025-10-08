package org.example.electromap1.Controller;

import lombok.RequiredArgsConstructor;
import org.example.electromap1.user.User;
import org.example.electromap1.user.UserMapper;
import org.example.electromap1.user.UserProfileDTO;
import org.example.electromap1.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ProfileController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        return userRepository.findByEmail(principal.getName())
                .map(UserMapper::toDTO)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("User not found"));
    }
}
