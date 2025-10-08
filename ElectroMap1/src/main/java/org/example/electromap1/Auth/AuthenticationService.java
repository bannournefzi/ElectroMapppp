package org.example.electromap1.Auth;

import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.example.electromap1.role.RoleRepository;
import org.example.electromap1.security.jwtService;
import org.example.electromap1.user.Token;
import org.example.electromap1.user.TokenRepository;
import org.example.electromap1.user.User;
import org.example.electromap1.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor

public class AuthenticationService {

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final Emailservice emailservice;
    private final AuthenticationManager authenticationManager;

    private final jwtService jwtservice;

    @Value("${application.mailing.frontend.activation-url}")
    private String activationUrl;

    public void register(RegistrationRequest request) throws MessagingException {

        var userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalArgumentException("ROLE_USER not found"));
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .carType(request.getCarType())
                .dateOfBirth(request.getDateOfBirth())
                .accountLocked(false)
                .enabled(false)
                .roles(List.of(userRole))
                .build();
        userRepository.save(user);
        sendValidationEmail(user);
    }

    private void sendValidationEmail(User user) throws MessagingException {
        var newToken = generateAndSaveActivationToken( user);

        emailservice.sendEmail(
                user.getEmail(),
                user.fullName(),
                EmailTemplateName.ACTIVATE_ACCOUNT,
                activationUrl,
                newToken,
                "Activate_Acount"

        );

    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateActivationCode(6);
        var token = Token.builder()
                .token(generatedToken)
                .createdAT(LocalDateTime.now())
                .expiresAT (LocalDateTime.now().plusMinutes(15))
                .user(user)
                .build();
        tokenRepository.save(token);
        return generatedToken;
    }

    private String generateActivationCode(int length) {
        String characters = "0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom secureRandom = new SecureRandom();
        for (int i = 0; i < length; i++) {
            int randomIndex = secureRandom.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }
        return codeBuilder.toString();
    }

    public AuthenticationResponse authenticate(@Valid AuthenticationRequest request) {
        var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var claims = new HashMap<String, Object>();
        var user = (User) auth.getPrincipal();
        claims.put("fullName", user.fullName());
        var jwtToken = jwtservice.generateToken(claims, user);
        return AuthenticationResponse.builder()
                .token(jwtToken).build();

    }

    //@Transactional
//    public void activateAccount(String token) throws MessagingException {
//        Token savedToken = tokenRepository.findByToken(token)
//                .orElseThrow(() -> new RuntimeException("Token not found"));
//        if (LocalDateTime.now().isAfter(savedToken.getExpiresAT())){
//            sendValidationEmail(savedToken.getUser());
//            throw new RuntimeException("Token is expired");
//        }
//        var user = userRepository.findById(savedToken.getUser().getId())
//                .orElseThrow(()-> new UsernameNotFoundException("User not found"));
//        user.setEnabled(true);
//        userRepository.save(user);
//        savedToken.setValidatedAT(LocalDateTime.now());
//        tokenRepository.save(savedToken);
//    }
    public void activateAccount(String token) throws MessagingException {
        Token savedToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        if (LocalDateTime.now().isAfter(savedToken.getExpiresAT())) {
            // ✅ Marquer le token comme expiré
            savedToken.setExpiresAT(LocalDateTime.now().minusMinutes(1));
            tokenRepository.save(savedToken);

            // ✅ Envoyer un nouveau token par mail
            sendValidationEmail(savedToken.getUser());

            // ✅ Stopper ici
            throw new RuntimeException("Token expired. A new one was sent to your email.");
        }

        // ✅ Activer le compte
        var user = userRepository.findById(savedToken.getUser().getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setEnabled(true);
        userRepository.save(user);

        savedToken.setValidatedAT(LocalDateTime.now());
        tokenRepository.save(savedToken);
    }
}
